import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

// Groq API config
const GROQ_BASE = "https://api.groq.com/openai/v1";
const GROQ_MODEL = "llama-3.3-70b-versatile";

// Default/fallback prompt if KV is empty
const DEFAULT_PROMPT = `You are MindBridge AI — a compassionate, professional mental health consultant and psychiatrist for Deaf and Hard-of-Hearing (DHH) individuals. You provide emotional support, coping strategies, and wellness guidance. Respond in plain English, typically 3-6 sentences.`;

// --- Helpers ---
const hashPassword = async (v) => {
  const m = new TextEncoder().encode(v);
  const h = await crypto.subtle.digest("SHA-256", m);
  return Array.from(new Uint8Array(h))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const getDb = async (kv) => {
  const data = await kv.get("db", { type: "json" });
  return (
    data || {
      users: [],
      settingsByUserId: {},
      journalsByUserId: {},
      moodsByUserId: {},
    }
  );
};

const saveDb = async (kv, db) => {
  await kv.put("db", JSON.stringify(db));
};

const getSessions = async (kv) => {
  const data = await kv.get("sessions", { type: "json" });
  return data || {};
};

const saveSessions = async (kv, sessions) => {
  await kv.put("sessions", JSON.stringify(sessions));
};

const authMiddleware = async (c, next) => {
  const token = (c.req.header("Authorization") || "").replace("Bearer ", "");
  if (!token) return c.json({ error: "Unauthorized" }, 401);
  const kv = c.env.SIGNMIND_DB;
  const sessions = await getSessions(kv);
  const userId = sessions[token];
  if (!userId) return c.json({ error: "Unauthorized" }, 401);
  c.set("userId", userId);
  c.set("token", token);
  await next();
};

const safeJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
};

const getAdvice = async () => {
  const data = await safeJson(
    `https://api.adviceslip.com/advice?ts=${Date.now()}`,
  );
  return (
    data?.slip?.advice ||
    "Take one steady breath and focus on the next helpful action."
  );
};

// --- App ---
app.use(
  "*",
  cors({
    origin: ["https://signmind-wellness.pages.dev", "http://localhost:5173"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);
app.get("/api/health", (c) =>
  c.json({
    ok: true,
    platform: "cloudflare-workers",
    ts: new Date().toISOString(),
  }),
);

// Auth
app.post("/api/auth/signup", async (c) => {
  const { name, email, password } = await c.req.json();
  const kv = c.env.SIGNMIND_DB;
  const db = await getDb(kv);
  const emailLower = email.trim().toLowerCase();
  if (db.users.find((u) => u.email === emailLower))
    return c.json({ error: "Exists" }, 409);

  const userId = crypto.randomUUID();
  const user = {
    id: userId,
    name: name.trim(),
    email: emailLower,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  db.settingsByUserId[userId] = {
    theme: "midnight",
    language: "en",
    notifications: true,
    privacyMode: true,
  };
  db.journalsByUserId[userId] = [];
  db.moodsByUserId[userId] = [];
  await saveDb(kv, db);

  const token = crypto.randomUUID().replace(/-/g, "");
  const sessions = await getSessions(kv);
  sessions[token] = userId;
  await saveSessions(kv, sessions);

  return c.json(
    { token, user: { id: userId, name: user.name, email: user.email } },
    201,
  );
});

app.post("/api/auth/login", async (c) => {
  const { email, password } = await c.req.json();
  const kv = c.env.SIGNMIND_DB;
  const db = await getDb(kv);
  const user = db.users.find(
    (u) => u.email === (email || "").trim().toLowerCase(),
  );
  if (!user || user.passwordHash !== (await hashPassword(password)))
    return c.json({ error: "Invalid" }, 401);

  const token = crypto.randomUUID().replace(/-/g, "");
  const sessions = await getSessions(kv);
  sessions[token] = user.id;
  await saveSessions(kv, sessions);
  return c.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

app.get("/api/auth/me", authMiddleware, async (c) => {
  const kv = c.env.SIGNMIND_DB;
  const db = await getDb(kv);
  const user = db.users.find((u) => u.id === c.get("userId"));
  if (!user) return c.json({ error: "User not found" }, 404);
  return c.json({ user: { id: user.id, name: user.name, email: user.email } });
});

app.post("/api/auth/update-profile", authMiddleware, async (c) => {
  const { name, email } = await c.req.json();
  const kv = c.env.SIGNMIND_DB;
  const db = await getDb(kv);
  const userId = c.get("userId");
  const user = db.users.find((u) => u.id === userId);
  if (!user) return c.json({ error: "User not found" }, 404);

  if (email && email.trim().toLowerCase() !== user.email) {
    const emailLower = email.trim().toLowerCase();
    if (db.users.find((u) => u.email === emailLower))
      return c.json({ error: "Email already in use" }, 409);
    user.email = emailLower;
  }
  if (name) user.name = name.trim();

  await saveDb(kv, db);
  return c.json({ user: { id: user.id, name: user.name, email: user.email } });
});

app.post("/api/auth/update-password", authMiddleware, async (c) => {
  const { oldPassword, newPassword } = await c.req.json();
  if (!oldPassword || !newPassword)
    return c.json({ error: "Missing passwords" }, 400);

  const kv = c.env.SIGNMIND_DB;
  const db = await getDb(kv);
  const user = db.users.find((u) => u.id === c.get("userId"));
  if (!user) return c.json({ error: "User not found" }, 404);

  // Verify old password
  if (user.passwordHash !== (await hashPassword(oldPassword))) {
    return c.json({ error: "Incorrect current password" }, 401);
  }

  user.passwordHash = await hashPassword(newPassword);
  user.updatedAt = new Date().toISOString();
  await saveDb(kv, db);

  return c.json({ ok: true, message: "Password updated successfully" });
});

// Settings & Moods & Journals
app.get("/api/settings", authMiddleware, async (c) => {
  const db = await getDb(c.env.SIGNMIND_DB);
  return c.json({ settings: db.settingsByUserId[c.get("userId")] || {} });
});

app.put("/api/settings", authMiddleware, async (c) => {
  const kv = c.env.SIGNMIND_DB;
  const body = await c.req.json();
  const db = await getDb(kv);
  db.settingsByUserId[c.get("userId")] = {
    ...db.settingsByUserId[c.get("userId")],
    ...body,
    updatedAt: new Date().toISOString(),
  };
  await saveDb(kv, db);
  return c.json({ settings: db.settingsByUserId[c.get("userId")] });
});

app.post("/api/ai/chat", authMiddleware, async (c) => {
  const { messages } = await c.req.json();
  const kv = c.env.SIGNMIND_DB;
  const apiKey = c.env.GROQ_API_KEY || "";

  // Fetch full professional prompt from KV
  const systemPrompt = (await kv.get("SYSTEM_PROMPT")) || DEFAULT_PROMPT;

  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-10),
      ],
      max_tokens: 512,
      temperature: 0.7,
    }),
  });
  if (!res.ok) return c.json({ error: "AI Err" }, 502);
  const data = await res.json();
  return c.json({ reply: data.choices[0].message.content });
});

app.get("/api/journal/entries", authMiddleware, async (c) => {
  const db = await getDb(c.env.SIGNMIND_DB);
  return c.json({
    entries: (db.journalsByUserId[c.get("userId")] || []).slice().reverse(),
  });
});

app.post("/api/journal/entries", authMiddleware, async (c) => {
  const kv = c.env.SIGNMIND_DB;
  const body = await c.req.json();
  const db = await getDb(kv);
  const entry = {
    id: crypto.randomUUID(),
    ...body,
    createdAt: new Date().toISOString(),
  };
  if (!db.journalsByUserId[c.get("userId")])
    db.journalsByUserId[c.get("userId")] = [];
  db.journalsByUserId[c.get("userId")].push(entry);
  await saveDb(kv, db);
  return c.json({ entry }, 201);
});

app.get("/api/mood/history", authMiddleware, async (c) => {
  const db = await getDb(c.env.SIGNMIND_DB);
  return c.json({
    history: (db.moodsByUserId[c.get("userId")] || []).slice(-7),
  });
});

app.post("/api/mood/log", authMiddleware, async (c) => {
  const kv = c.env.SIGNMIND_DB;
  const body = await c.req.json();
  const db = await getDb(kv);
  const entry = {
    id: crypto.randomUUID(),
    ...body,
    loggedAt: new Date().toISOString(),
  };
  if (!db.moodsByUserId[c.get("userId")])
    db.moodsByUserId[c.get("userId")] = [];
  db.moodsByUserId[c.get("userId")].push(entry);
  await saveDb(kv, db);
  return c.json({ entry }, 201);
});

export default app;
