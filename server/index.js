import express from "express";
import cors from "cors";
import process from "node:process";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const PORT = Number(process.env.PORT || 8787);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "db.json");

// Groq API config (free tier)
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_BASE = "https://api.groq.com/openai/v1";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const DHH_SYSTEM_PROMPT = `You are MindBridge AI — a compassionate, professional mental health consultant and psychologist specializing exclusively in serving Deaf and Hard-of-Hearing (DHH) individuals.

Your identity and expertise:
• You are trained in Deaf mental health, ASL-culture-informed therapy, and trauma-informed care
• You understand the unique psychological challenges of DHH people: communication barriers, social isolation, audism, navigating hearing-centric healthcare systems, identity formation in Deaf culture, and language deprivation trauma
• You are bilingual-culturally aware: you respect both Deaf culture (capital-D Deaf community, ASL as a primary language) and Hard-of-Hearing individuals who may be bicultural
• You are trained in CBT, DBT, mindfulness-based approaches, and somatic techniques — all adapted for visual/tactile learners

Your communication style:
• Use clear, plain language. Avoid idioms that assume hearing (e.g., "I hear you" → say "I understand")
• Be warm, patient, and never condescending
• Validate experiences of audism, communication fatigue, and isolation with genuine empathy
• Offer concrete, practical coping strategies adapted for DHH users (visual-first techniques, text-based grounding)
• When someone is in crisis, always provide DHH-accessible crisis resources (text-based hotlines, video relay services)
• Never suggest "you should just listen to..." or audio-based solutions
• Respect that the person may use ASL, SEE, Cued Speech, or written English as their primary communication method

Your scope:
• Provide emotional support, psychoeducation, coping strategies, and mental wellness guidance
• Help users process emotions, anxiety, depression, identity, relationships, and daily stressors
• Guide mindfulness and grounding exercises (visual, breathing-based)
• Recognize when professional in-person therapy is needed and say so clearly
• You do NOT diagnose, prescribe, or replace a licensed therapist — but you are the most accessible first step for DHH individuals who face enormous barriers to traditional mental healthcare

Always respond in plain English (the user's written language). Keep responses focused, warm, and actionable — typically 3–6 sentences unless more depth is requested. End responses that need follow-up with a single gentle question to keep the conversation going.`;

const sessions = new Map();

const defaultDb = {
  users: [],
  settingsByUserId: {},
  journalsByUserId: {},
  moodsByUserId: {},
};

const loadDb = async () => {
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    // Ensure new keys exist for older db files
    if (!parsed.journalsByUserId) parsed.journalsByUserId = {};
    if (!parsed.moodsByUserId) parsed.moodsByUserId = {};
    return parsed;
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify(defaultDb, null, 2), "utf-8");
    return structuredClone(defaultDb);
  }
};

const saveDb = async (db) => {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
};

const hashPassword = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

const createToken = () => crypto.randomBytes(24).toString("hex");

const getTokenFromAuthHeader = (headerValue = "") => {
  const [scheme, token] = headerValue.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
};

const authRequired = (req, res, next) => {
  const token = getTokenFromAuthHeader(req.headers.authorization);
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.userId = sessions.get(token);
  req.token = token;
  next();
};

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const FALLBACK_PROMPTS = [
  "What emotion showed up most strongly for you today, and when did you notice it first?",
  "What did your body feel like during your hardest moment today?",
  "Name one thing you handled better this week than last week.",
  "What support do you need most right now, and from whom?",
  "What would a calmer tomorrow look like for you in one specific way?",
];

const safeJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
};

const getAdvice = async () => {
  const timestamp = Date.now();
  const data = await safeJson(
    `https://api.adviceslip.com/advice?ts=${timestamp}`,
  );
  return (
    data?.slip?.advice ||
    "Take one steady breath and focus on the next helpful action."
  );
};

const getZenLine = async () => {
  const response = await fetch("https://api.github.com/zen", {
    headers: { "User-Agent": "signmind-app", Accept: "text/plain" },
  });
  if (!response.ok) throw new Error(`GitHub zen failed: ${response.status}`);
  const text = await response.text();
  return text || "Focus on progress, not perfection.";
};

const getWeatherSnapshot = async (latitude = 28.6139, longitude = 77.209) => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`;
  const data = await safeJson(url);
  return {
    temperatureC: data?.current?.temperature_2m ?? null,
    weatherCode: data?.current?.weather_code ?? null,
  };
};

// ─── Health ───────────────────────────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "signmind-backend",
    timestamp: new Date().toISOString(),
  });
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "name, email, and password are required" });
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const db = await loadDb();
  const existingUser = db.users.find((u) => u.email === normalizedEmail);
  if (existingUser) {
    return res
      .status(409)
      .json({
        error: "Account with this email already exists",
        code: "ACCOUNT_EXISTS",
      });
  }
  const user = {
    id: crypto.randomUUID(),
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(String(password)),
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  db.settingsByUserId[user.id] = {
    theme: "dark",
    language: "en",
    notifications: true,
    privacyMode: true,
    updatedAt: new Date().toISOString(),
  };
  db.journalsByUserId[user.id] = [];
  db.moodsByUserId[user.id] = [];
  await saveDb(db);
  const token = createToken();
  sessions.set(token, user.id);
  return res
    .status(201)
    .json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "email and password are required" });
  const normalizedEmail = String(email).trim().toLowerCase();
  const db = await loadDb();
  const user = db.users.find((u) => u.email === normalizedEmail);
  if (!user)
    return res
      .status(404)
      .json({
        error: "No account found with this email",
        code: "ACCOUNT_NOT_FOUND",
      });
  if (user.passwordHash !== hashPassword(String(password))) {
    return res
      .status(401)
      .json({ error: "Incorrect password", code: "INCORRECT_PASSWORD" });
  }
  const token = createToken();
  sessions.set(token, user.id);
  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

app.post("/api/auth/logout", authRequired, (req, res) => {
  sessions.delete(req.token);
  return res.json({ ok: true });
});

app.get("/api/auth/me", authRequired, async (req, res) => {
  const db = await loadDb();
  const user = db.users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
});

// ─── Settings ─────────────────────────────────────────────────────────────────

app.get("/api/settings", authRequired, async (req, res) => {
  const db = await loadDb();
  const settings = db.settingsByUserId[req.userId] || {
    theme: "dark",
    language: "en",
    notifications: true,
    privacyMode: true,
  };
  return res.json({ settings });
});

app.put("/api/settings", authRequired, async (req, res) => {
  const { theme, language, notifications, privacyMode } = req.body || {};
  const db = await loadDb();
  db.settingsByUserId[req.userId] = {
    theme: theme || "dark",
    language: language || "en",
    notifications: Boolean(notifications),
    privacyMode: Boolean(privacyMode),
    updatedAt: new Date().toISOString(),
  };
  await saveDb(db);
  return res.json({ settings: db.settingsByUserId[req.userId] });
});

// ─── AI Chat (Groq) ───────────────────────────────────────────────────────────

app.post("/api/ai/chat", authRequired, async (req, res) => {
  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

  const safeMessages = messages.slice(-20).map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content).slice(0, 2000),
  }));

  try {
    const response = await fetch(`${GROQ_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: DHH_SYSTEM_PROMPT },
          ...safeMessages,
        ],
        max_tokens: 512,
        temperature: 0.75,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq error:", err);
      return res.status(502).json({ error: "AI service error", detail: err });
    }

    const data = await response.json();
    const reply =
      data?.choices?.[0]?.message?.content ||
      "I'm here for you. Could you tell me a little more about what you're going through?";
    return res.json({ reply });
  } catch (e) {
    console.error("AI chat error:", e);
    return res
      .status(500)
      .json({ error: "Failed to contact AI", detail: e.message });
  }
});

// ─── Journal ──────────────────────────────────────────────────────────────────

app.get("/api/journal/entries", authRequired, async (req, res) => {
  const db = await loadDb();
  const entries = (db.journalsByUserId[req.userId] || []).slice().reverse();
  return res.json({ entries });
});

app.post("/api/journal/entries", authRequired, async (req, res) => {
  const { text, mood, moodLabel, tags } = req.body || {};
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: "text is required" });
  }
  const db = await loadDb();
  if (!db.journalsByUserId[req.userId]) db.journalsByUserId[req.userId] = [];
  const entry = {
    id: crypto.randomUUID(),
    text: String(text).trim().slice(0, 5000),
    mood: Number(mood) || 5,
    moodLabel: String(moodLabel || "neutral"),
    tags: Array.isArray(tags) ? tags.slice(0, 5) : [],
    createdAt: new Date().toISOString(),
  };
  db.journalsByUserId[req.userId].push(entry);
  await saveDb(db);
  return res.status(201).json({ entry });
});

app.delete("/api/journal/entries/:id", authRequired, async (req, res) => {
  const { id } = req.params;
  const db = await loadDb();
  const entries = db.journalsByUserId[req.userId] || [];
  db.journalsByUserId[req.userId] = entries.filter((e) => e.id !== id);
  await saveDb(db);
  return res.json({ ok: true });
});

// ─── Mood Tracking ────────────────────────────────────────────────────────────

app.post("/api/mood/log", authRequired, async (req, res) => {
  const { score, label, note } = req.body || {};
  if (!score || score < 1 || score > 10) {
    return res.status(400).json({ error: "score 1-10 is required" });
  }
  const db = await loadDb();
  if (!db.moodsByUserId[req.userId]) db.moodsByUserId[req.userId] = [];
  const entry = {
    id: crypto.randomUUID(),
    score: Number(score),
    label: String(label || ""),
    note: String(note || "").slice(0, 500),
    loggedAt: new Date().toISOString(),
  };
  db.moodsByUserId[req.userId].push(entry);
  // Keep last 90 entries
  if (db.moodsByUserId[req.userId].length > 90) {
    db.moodsByUserId[req.userId] = db.moodsByUserId[req.userId].slice(-90);
  }
  await saveDb(db);
  return res.status(201).json({ entry });
});

app.get("/api/mood/history", authRequired, async (req, res) => {
  const db = await loadDb();
  const all = db.moodsByUserId[req.userId] || [];
  // Return last 7 days
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const recent = all.filter(
    (m) => now - new Date(m.loggedAt).getTime() < sevenDays,
  );
  return res.json({ history: recent });
});

// ─── Research Articles ────────────────────────────────────────────────────────

app.get("/api/research/articles", async (_req, res) => {
  try {
    const europePmc = await safeJson(
      "https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=(deaf%20mental%20health)%20OR%20(hard%20of%20hearing%20mental%20health)&format=json&pageSize=8&sort_date:y",
    );
    const items = (europePmc?.resultList?.result || []).map((item) => ({
      title: item?.title || "Untitled",
      year: Number(item?.pubYear) || null,
      doi: item?.doi || null,
      url: item?.doi
        ? `https://doi.org/${item.doi}`
        : item?.pmid
          ? `https://pubmed.ncbi.nlm.nih.gov/${item.pmid}/`
          : null,
      publisher: item?.journalTitle || item?.source || "Research Archive",
      abstract: item?.abstractText?.slice(0, 300) || null,
    }));
    return res.json({ source: "europe-pmc", items });
  } catch {
    return res.json({
      source: "fallback",
      items: [
        {
          title: "Deaf and hard-of-hearing mental health care access review",
          year: 2023,
          doi: null,
          url: "https://www.who.int/",
          publisher: "World Health Organization",
          abstract:
            "A comprehensive review of mental healthcare access barriers for DHH populations worldwide.",
        },
        {
          title: "ASL-based therapy delivery outcomes in community settings",
          year: 2022,
          doi: null,
          url: "https://www.nimh.nih.gov/",
          publisher: "National Institute of Mental Health",
          abstract:
            "Outcomes study examining ASL-based psychotherapy delivery effectiveness.",
        },
        {
          title:
            "Mental health disparities in Deaf communities: a meta-analysis",
          year: 2023,
          doi: null,
          url: "https://pubmed.ncbi.nlm.nih.gov/",
          publisher: "PubMed Central",
          abstract:
            "Meta-analysis of 42 studies examining mental health outcome disparities in Deaf adults.",
        },
      ],
    });
  }
});

// ─── Daily Wellness ───────────────────────────────────────────────────────────

app.get("/api/wellness/daily", async (req, res) => {
  const lat = Number.isFinite(Number(req.query.latitude))
    ? Number(req.query.latitude)
    : 28.6139;
  const lon = Number.isFinite(Number(req.query.longitude))
    ? Number(req.query.longitude)
    : 77.209;
  try {
    const [advice, zen, weather] = await Promise.all([
      getAdvice(),
      getZenLine(),
      getWeatherSnapshot(lat, lon),
    ]);
    res.json({
      source: "free-public-apis",
      insight: advice,
      affirmation: zen,
      microAction: "Take a 90-second grounding pause before your next task.",
      weather,
    });
  } catch {
    res.json({
      source: "fallback",
      insight: "Your consistency is a strong signal of progress.",
      affirmation: "Small steady steps still count.",
      microAction: "Take one slow breath and label what you feel in one word.",
      weather: { temperatureC: null, weatherCode: null },
    });
  }
});

app.get("/api/journal/prompt", async (_req, res) => {
  try {
    const advice = await getAdvice();
    res.json({ source: "advice-slip", prompt: `Reflect on this: ${advice}` });
  } catch {
    res.json({
      source: "fallback",
      prompt:
        FALLBACK_PROMPTS[Math.floor(Math.random() * FALLBACK_PROMPTS.length)],
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ SignMind backend running on http://localhost:${PORT}`);
});
