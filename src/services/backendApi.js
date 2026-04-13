import { requireSupabase } from "./supabaseClient";

const DHH_SYSTEM_PROMPT = `You are MindBridge, a supportive wellness companion for Deaf and Hard-of-Hearing (DHH) users.

How to respond:
- Write like a calm, trauma-informed counselor with strong commonsense.
- Start by reflecting the user's feeling in one short sentence.
- Validate communication fatigue, isolation, and stress without sounding clinical.
- Offer practical, visual-first coping ideas (grounding, breathing, journaling, routines).
- Avoid hearing-first language and avoid audio-only suggestions.
- Respect different communication preferences (ASL, signed systems, text, spoken language).
- Use concise emotional labeling, simple summaries, and one concrete next step.
- Avoid repeating the same opening line or the same advice twice in a row.
- Keep the tone direct, human, and steady. Do not sound scripted or overly cheerful.
- If the user is distressed, be specific about one next step instead of giving a list.

Safety and scope:
- You are not a doctor and you do not diagnose or prescribe.
- If the user sounds in danger, encourage immediate crisis support and trusted contacts.
- Suggest professional therapy when deeper care is needed.

Output style:
- Write in plain English.
- Usually 3-6 sentences unless the user asks for depth.
- End with one gentle follow-up question when helpful.`;

const FALLBACK_PROMPTS = [
  "What emotion showed up most strongly for you today, and when did you notice it first?",
  "What did your body feel like during your hardest moment today?",
  "Name one thing you handled better this week than last week.",
  "What support do you need most right now, and from whom?",
  "What would a calmer tomorrow look like for you in one specific way?",
];

const DB_SETUP_MESSAGE =
  "Database is not initialized yet. Run supabase-schema.sql in your Supabase SQL Editor.";

const FALLBACK_KEY = "signmind_fallback_db";

const CRISIS_PATTERNS = [
  /\b(i\s*want\s*to\s*die|i\s*wanna\s*die|kill\s*myself|end\s*my\s*life)\b/i,
  /\b(suicidal|suicide|self\s*harm|hurt\s*myself|can't\s*go\s*on|can\'t\s*go\s*on)\b/i,
  /\b(no\s*reason\s*to\s*live|better\s*off\s*dead|overdose)\b/i,
];

export const looksLikeCrisis = (text = "") =>
  CRISIS_PATTERNS.some((pattern) => pattern.test(String(text || "")));

const DISTRESS_PATTERNS = [
  /\b(depressed|depression|anxious|anxiety|overwhelmed|hopeless|empty|panic|stressed|can't cope|cant cope|worn out|burnt out|burned out)\b/i,
];

export const looksLikeDistress = (text = "") =>
  DISTRESS_PATTERNS.some((pattern) => pattern.test(String(text || "")));

const readFallbackDb = () => {
  try {
    const raw = localStorage.getItem(FALLBACK_KEY);
    if (!raw) {
      return {
        journalsByUserId: {},
        moodsByUserId: {},
        communityPosts: [],
        aiChatSessionsByUserId: {},
        aiChatMessagesBySessionId: {},
      };
    }
    const parsed = JSON.parse(raw);
    return {
      journalsByUserId: parsed.journalsByUserId || {},
      moodsByUserId: parsed.moodsByUserId || {},
      communityPosts: parsed.communityPosts || [],
      aiChatSessionsByUserId: parsed.aiChatSessionsByUserId || {},
      aiChatMessagesBySessionId: parsed.aiChatMessagesBySessionId || {},
    };
  } catch {
    return {
      journalsByUserId: {},
      moodsByUserId: {},
      communityPosts: [],
      aiChatSessionsByUserId: {},
      aiChatMessagesBySessionId: {},
    };
  }
};

const writeFallbackDb = (db) => {
  localStorage.setItem(FALLBACK_KEY, JSON.stringify(db));
};

const incrementLocalCounter = (key) => {
  const current = Number(localStorage.getItem(key) || 0);
  localStorage.setItem(key, String(current + 1));
};

export const getLocalCounter = (key) => Number(localStorage.getItem(key) || 0);

const isMissingTableError = (error) => {
  const msg = String(error?.message || "").toLowerCase();
  const code = String(error?.code || "").toUpperCase();
  return (
    code === "PGRST205" ||
    msg.includes("could not find the table") ||
    (msg.includes("relation") && msg.includes("does not exist")) ||
    msg.includes("schema cache")
  );
};

const ensureSession = async () => {
  const supabase = requireSupabase();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw error;
  if (!session?.user) throw new Error("Unauthorized");
  return { supabase, session };
};

const mapUser = (user) => ({
  id: user.id,
  name:
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User",
  email: user.email,
  createdAt: user.created_at,
});

const normalizeError = (error, fallback) => {
  if (!error) return new Error(fallback);
  if (isMissingTableError(error)) {
    const dbErr = new Error(DB_SETUP_MESSAGE);
    dbErr.code = "DB_NOT_INITIALIZED";
    return dbErr;
  }
  const msg = error.message || fallback;
  const err = new Error(msg);
  err.code = error.code;
  err.status = error.status;
  return err;
};

const createAuthError = (message, code) => {
  const err = new Error(message);
  err.code = code;
  return err;
};

const parseAuthError = (error, fallback = "Auth request failed") => {
  const normalized = normalizeError(error, fallback);
  const msg = (normalized.message || "").toLowerCase();

  if (
    msg.includes("email not confirmed") ||
    normalized.code === "email_not_confirmed"
  ) {
    return createAuthError(
      "Your email is not confirmed yet. Please check your inbox, then sign in.",
      "EMAIL_NOT_CONFIRMED",
    );
  }

  if (
    msg.includes("rate limit") ||
    msg.includes("too many") ||
    msg.includes("security purposes") ||
    msg.includes("over_email_send_rate_limit")
  ) {
    return createAuthError(
      "Signup email sending is temporarily rate-limited on the server. Please wait a bit, then try again, or sign in if this account was already created.",
      "RATE_LIMITED",
    );
  }

  return normalized;
};

const upsertProfile = async (user, preferredName) => {
  const supabase = requireSupabase();
  const payload = {
    id: user.id,
    name:
      preferredName ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "User",
    email: user.email || null,
  };
  const { error } = await supabase.from("profiles").upsert(payload, {
    onConflict: "id",
  });
  // Do not block auth if profile table is not created yet.
  if (isMissingTableError(error)) return;
  if (error) throw normalizeError(error, "Failed to sync profile");
};

const randomFallback = (items) =>
  items[Math.floor(Math.random() * items.length)];

const safeFetchJson = async (url, options = {}) => {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

// Auth
export const signupUser = async (name, email, password) => {
  const supabase = requireSupabase();
  const normalizedEmail = String(email).trim().toLowerCase();
  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password: String(password),
    options: { data: { name: String(name || "").trim() } },
  });
  if (error) throw parseAuthError(error, "Signup failed");

  if (!data.session) {
    throw createAuthError(
      "Account created. Please confirm your email, then sign in.",
      "EMAIL_CONFIRMATION_REQUIRED",
    );
  }

  await upsertProfile(data.user, name);
  return {
    token: data.session?.access_token || "",
    user: mapUser(data.user),
  };
};

export const loginUser = async (email, password) => {
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(email).trim().toLowerCase(),
    password: String(password),
  });
  if (error) throw parseAuthError(error, "Login failed");
  await upsertProfile(data.user);
  return {
    token: data.session?.access_token || "",
    user: mapUser(data.user),
  };
};

export const resendConfirmationEmail = async (email) => {
  const supabase = requireSupabase();
  const normalizedEmail = String(email).trim().toLowerCase();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: normalizedEmail,
  });
  if (error) throw parseAuthError(error, "Could not resend confirmation email");
  return { ok: true };
};

export const logoutUser = async () => {
  const supabase = requireSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) throw normalizeError(error, "Logout failed");
  return { ok: true };
};

export const getCurrentUser = async () => {
  const { session } = await ensureSession();
  return { user: mapUser(session.user) };
};

// Settings
export const getSettings = async () => {
  const { supabase, session } = await ensureSession();
  const { data, error } = await supabase
    .from("user_settings")
    .select("theme, language, notifications, privacy_mode")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error) throw normalizeError(error, "Failed to load settings");
  return {
    settings: {
      theme: data?.theme || "emerald",
      language: data?.language || "en",
      notifications: data?.notifications ?? true,
      privacyMode: data?.privacy_mode ?? true,
    },
  };
};

export const saveSettings = async (_token, settings) => {
  const { supabase, session } = await ensureSession();
  const { data, error } = await supabase
    .from("user_settings")
    .upsert(
      {
        user_id: session.user.id,
        theme: settings.theme || "emerald",
        language: settings.language || "en",
        notifications: Boolean(settings.notifications),
        privacy_mode: Boolean(settings.privacyMode),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select("theme, language, notifications, privacy_mode")
    .single();

  if (error) throw normalizeError(error, "Failed to save settings");
  return {
    settings: {
      theme: data.theme,
      language: data.language,
      notifications: data.notifications,
      privacyMode: data.privacy_mode,
    },
  };
};

export const updateProfile = async (_token, name, email) => {
  const { supabase } = await ensureSession();
  const { data, error } = await supabase.auth.updateUser({
    email: String(email).trim().toLowerCase(),
    data: { name: String(name).trim() },
  });
  if (error) throw normalizeError(error, "Failed to update profile");
  await upsertProfile(data.user, name);
  return { user: mapUser(data.user) };
};

export const updatePassword = async (_token, _oldPassword, newPassword) => {
  const { supabase } = await ensureSession();
  const { error } = await supabase.auth.updateUser({
    password: String(newPassword),
  });
  if (error) throw normalizeError(error, "Failed to update password");
  return { ok: true };
};

// Daily Wellness
export const getDailyWellness = async () => {
  try {
    const timestamp = Date.now();
    const [adviceData, weatherData] = await Promise.all([
      safeFetchJson(`https://api.adviceslip.com/advice?ts=${timestamp}`),
      safeFetchJson(
        "https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.209&current=temperature_2m,weather_code&timezone=auto",
      ),
    ]);

    return {
      source: "free-public-apis",
      insight:
        adviceData?.slip?.advice ||
        "Your consistency is a strong signal of progress.",
      affirmation: "Small steady steps still count.",
      microAction: "Take a 90-second grounding pause before your next task.",
      weather: {
        temperatureC: weatherData?.current?.temperature_2m ?? null,
        weatherCode: weatherData?.current?.weather_code ?? null,
      },
    };
  } catch {
    return {
      source: "fallback",
      insight: "Your consistency is a strong signal of progress.",
      affirmation: "Small steady steps still count.",
      microAction: "Take one slow breath and label what you feel in one word.",
      weather: { temperatureC: null, weatherCode: null },
    };
  }
};

export const getJournalPrompt = async () => {
  try {
    const timestamp = Date.now();
    const data = await safeFetchJson(
      `https://api.adviceslip.com/advice?ts=${timestamp}`,
    );
    return {
      source: "advice-slip",
      prompt: `Reflect on this: ${data?.slip?.advice}`,
    };
  } catch {
    return { source: "fallback", prompt: randomFallback(FALLBACK_PROMPTS) };
  }
};

// AI Chat
export const sendAIMessage = async (_token, messages) => {
  const localApi = "/api/ai/chat";
  const aiProxy = import.meta.env.VITE_AI_PROXY_URL || localApi;

  const response = await fetch(aiProxy, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system: DHH_SYSTEM_PROMPT, messages }),
  });
  if (!response.ok) {
    const last =
      messages?.filter((m) => m.role === "user").at(-1)?.content || "";
    return {
      reply: `I hear you. ${last ? "Thanks for sharing that." : ""} Try one visual grounding step right now: look around and name 5 things you can see, then take one slow breath. What feels most intense in this moment?`,
      crisis: false,
    };
  }
  const data = await response.json();
  if (!data?.reply) throw new Error("Invalid AI response");
  return {
    reply: data.reply,
    crisis: Boolean(data.crisis),
    risk: data.risk || null,
  };
};

export const analyzeJournalMood = async (_token, text) => {
  const response = await fetch("/api/ai/mood", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const lowered = String(text || "").toLowerCase();
    const crisisLanguage =
      /(suicid|self harm|kill myself|end my life|i\s*wanna\s*die|i\s*want\s*to\s*die|better off dead|overdose|can't go on)/.test(
        lowered,
      );
    const severeDistress =
      /(depressed|very sad|hopeless|worthless|empty|panic attack|can'?t cope|burnt out|burned out)/.test(
        lowered,
      );
    const mildNegative =
      /(sad|anxious|stressed|tired|overwhelmed|lonely|drained)/.test(lowered);
    const score = crisisLanguage
      ? 1
      : severeDistress
        ? 3
        : mildNegative
          ? 4
          : 6;
    return {
      score,
      label: score <= 2 ? "critical" : score <= 4 ? "low" : "neutral",
      reason:
        "Estimated from journal text because AI mood service is temporarily unavailable.",
      crisis: crisisLanguage,
    };
  }

  const data = await response.json();
  return {
    score: Number(data.score) || 5,
    label: String(data.label || "neutral"),
    reason: String(data.reason || ""),
    crisis: Boolean(data.crisis) || looksLikeCrisis(text),
  };
};

const normalizeMoodLabel = (label) => {
  const value = String(label || "neutral").toLowerCase();
  if (["critical", "high", "severe"].includes(value)) return "critical";
  if (["low", "down", "overwhelmed", "stressed"].includes(value)) return "low";
  if (["good", "stable", "positive"].includes(value)) return "positive";
  return "neutral";
};

const mapChatSession = (row) => ({
  id: row.id,
  userId: row.user_id,
  title: row.title || "Support chat",
  moodScore: row.mood_score ?? null,
  moodLabel: normalizeMoodLabel(row.mood_label),
  crisis: Boolean(row.crisis),
  preview: row.preview || "",
  createdAt: row.created_at,
  updatedAt: row.last_message_at || row.created_at,
  messageCount: row.message_count ?? 0,
});

const mapChatMessage = (row) => ({
  id: row.id,
  sessionId: row.session_id,
  userId: row.user_id,
  role: row.role,
  content: row.content,
  moodScore: row.mood_score ?? null,
  moodLabel: normalizeMoodLabel(row.mood_label),
  crisis: Boolean(row.crisis),
  createdAt: row.created_at,
});

export const getAIChatSessions = async () => {
  const { supabase, session } = await ensureSession();
  const { data, error } = await supabase
    .from("ai_chat_sessions")
    .select(
      "id, user_id, title, mood_score, mood_label, crisis, preview, created_at, last_message_at, message_count",
    )
    .eq("user_id", session.user.id)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error)) {
      const fallback = readFallbackDb();
      const sessions = (fallback.aiChatSessionsByUserId[session.user.id] || [])
        .slice()
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
      return { sessions };
    }
    throw normalizeError(error, "Failed to load chat sessions");
  }

  return {
    sessions: (data || []).map((row) => mapChatSession(row)),
  };
};

export const getAIChatMessages = async (sessionId) => {
  if (!sessionId) return { messages: [] };
  const { supabase, session } = await ensureSession();
  const { data, error } = await supabase
    .from("ai_chat_messages")
    .select(
      "id, session_id, user_id, role, content, mood_score, mood_label, crisis, created_at",
    )
    .eq("user_id", session.user.id)
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingTableError(error)) {
      const fallback = readFallbackDb();
      const history = fallback.aiChatMessagesBySessionId[sessionId] || [];
      return {
        messages: history
          .slice()
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          ),
      };
    }
    throw normalizeError(error, "Failed to load chat messages");
  }

  return {
    messages: (data || []).map((row) => mapChatMessage(row)),
  };
};

export const saveAIChatTurn = async (sessionId, payload) => {
  const { supabase, session } = await ensureSession();
  const currentSessionId = sessionId || crypto.randomUUID();
  const isNewSession = Boolean(payload?.isNewSession);
  const userMessage = String(payload?.userMessage || "").trim();
  const assistantMessage = String(payload?.assistantMessage || "").trim();
  const moodScore = Number(payload?.moodScore) || null;
  const moodLabel = normalizeMoodLabel(payload?.moodLabel);
  const crisis = Boolean(payload?.crisis);
  const title = String(payload?.title || userMessage || "Support chat")
    .trim()
    .slice(0, 80);
  const preview = String(
    payload?.preview || assistantMessage || userMessage || "",
  )
    .trim()
    .slice(0, 180);

  const sessionRow = {
    id: currentSessionId,
    user_id: session.user.id,
    title,
    mood_score: moodScore,
    mood_label: moodLabel,
    crisis,
    preview,
    last_message_at: new Date().toISOString(),
    message_count: assistantMessage ? 2 : userMessage ? 1 : 0,
  };

  const { error: sessionError } = await supabase
    .from("ai_chat_sessions")
    .upsert(sessionRow, { onConflict: "id" });

  if (sessionError) {
    if (!isMissingTableError(sessionError)) {
      throw normalizeError(sessionError, "Failed to save chat session");
    }

    const fallback = readFallbackDb();
    const sessions = fallback.aiChatSessionsByUserId[session.user.id] || [];
    const updatedSession = {
      ...sessionRow,
      userId: session.user.id,
      createdAt:
        sessions.find((item) => item.id === currentSessionId)?.createdAt ||
        new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    fallback.aiChatSessionsByUserId[session.user.id] = [
      updatedSession,
      ...sessions.filter((item) => item.id !== currentSessionId),
    ];
    if (!fallback.aiChatMessagesBySessionId[currentSessionId]) {
      fallback.aiChatMessagesBySessionId[currentSessionId] = [];
    }
    if (userMessage) {
      fallback.aiChatMessagesBySessionId[currentSessionId].push({
        id: crypto.randomUUID(),
        sessionId: currentSessionId,
        userId: session.user.id,
        role: "user",
        content: userMessage,
        moodScore,
        moodLabel,
        crisis,
        createdAt: new Date().toISOString(),
      });
    }
    if (assistantMessage) {
      fallback.aiChatMessagesBySessionId[currentSessionId].push({
        id: crypto.randomUUID(),
        sessionId: currentSessionId,
        userId: session.user.id,
        role: "assistant",
        content: assistantMessage,
        moodScore,
        moodLabel,
        crisis,
        createdAt: new Date().toISOString(),
      });
    }
    writeFallbackDb(fallback);
    if (isNewSession) {
      incrementLocalCounter("signmind_chat_sessions");
    }
    return { sessionId: currentSessionId };
  }

  const rows = [];
  if (userMessage) {
    rows.push({
      session_id: currentSessionId,
      user_id: session.user.id,
      role: "user",
      content: userMessage.slice(0, 4000),
      mood_score: moodScore,
      mood_label: moodLabel,
      crisis,
    });
  }
  if (assistantMessage) {
    rows.push({
      session_id: currentSessionId,
      user_id: session.user.id,
      role: "assistant",
      content: assistantMessage.slice(0, 4000),
      mood_score: moodScore,
      mood_label: moodLabel,
      crisis,
    });
  }

  if (rows.length > 0) {
    const { error: messageError } = await supabase
      .from("ai_chat_messages")
      .insert(rows);
    if (messageError) {
      if (isMissingTableError(messageError)) {
        const fallback = readFallbackDb();
        if (!fallback.aiChatMessagesBySessionId[currentSessionId]) {
          fallback.aiChatMessagesBySessionId[currentSessionId] = [];
        }
        rows.forEach((row) => {
          fallback.aiChatMessagesBySessionId[currentSessionId].push({
            id: crypto.randomUUID(),
            sessionId: currentSessionId,
            userId: session.user.id,
            role: row.role,
            content: row.content,
            moodScore: row.mood_score,
            moodLabel: row.mood_label,
            crisis: row.crisis,
            createdAt: new Date().toISOString(),
          });
        });
        writeFallbackDb(fallback);
        if (isNewSession) {
          incrementLocalCounter("signmind_chat_sessions");
        }
        return { sessionId: currentSessionId };
      }
      throw normalizeError(messageError, "Failed to save chat messages");
    }
  }

  if (isNewSession) {
    incrementLocalCounter("signmind_chat_sessions");
  }
  return { sessionId: currentSessionId };
};

// Journal
export const getJournalEntries = async () => {
  const { supabase, session } = await ensureSession();
  const { data, error } = await supabase
    .from("journal_entries")
    .select("id, text, mood, mood_label, tags, created_at")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error)) {
      const fallback = readFallbackDb();
      const entries = (fallback.journalsByUserId[session.user.id] || [])
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      return { entries };
    }
    throw normalizeError(error, "Failed to load journal entries");
  }
  return {
    entries: (data || []).map((row) => ({
      id: row.id,
      text: row.text,
      mood: row.mood,
      moodLabel: row.mood_label,
      tags: row.tags || [],
      createdAt: row.created_at,
    })),
  };
};

export const saveJournalEntry = async (_token, payload) => {
  const { supabase, session } = await ensureSession();
  const cleanEntry = {
    id: crypto.randomUUID(),
    text: String(payload.text || "")
      .trim()
      .slice(0, 5000),
    mood: Number(payload.mood) || 5,
    moodLabel: String(payload.moodLabel || "neutral"),
    tags: Array.isArray(payload.tags) ? payload.tags.slice(0, 5) : [],
    createdAt: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("journal_entries")
    .insert({
      user_id: session.user.id,
      text: cleanEntry.text,
      mood: cleanEntry.mood,
      mood_label: cleanEntry.moodLabel,
      tags: cleanEntry.tags,
    })
    .select("id, text, mood, mood_label, tags, created_at")
    .single();

  if (error) {
    if (isMissingTableError(error)) {
      const fallback = readFallbackDb();
      if (!fallback.journalsByUserId[session.user.id]) {
        fallback.journalsByUserId[session.user.id] = [];
      }
      fallback.journalsByUserId[session.user.id].push(cleanEntry);
      writeFallbackDb(fallback);
      return { entry: cleanEntry };
    }
    throw normalizeError(error, "Failed to save journal entry");
  }
  return {
    entry: {
      id: data.id,
      text: data.text,
      mood: data.mood,
      moodLabel: data.mood_label,
      tags: data.tags || [],
      createdAt: data.created_at,
    },
  };
};

export const deleteJournalEntry = async (_token, id) => {
  const { supabase, session } = await ensureSession();
  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", session.user.id);
  if (error) {
    if (isMissingTableError(error)) {
      const fallback = readFallbackDb();
      const existing = fallback.journalsByUserId[session.user.id] || [];
      fallback.journalsByUserId[session.user.id] = existing.filter(
        (e) => e.id !== id,
      );
      writeFallbackDb(fallback);
      return { ok: true };
    }
    throw normalizeError(error, "Failed to delete journal entry");
  }
  return { ok: true };
};

// Mood Tracking
export const logMood = async (_token, payload) => {
  const { supabase, session } = await ensureSession();
  const score = Number(payload.score);
  if (!score || score < 1 || score > 10) {
    throw new Error("score 1-10 is required");
  }

  const { data, error } = await supabase
    .from("mood_logs")
    .insert({
      user_id: session.user.id,
      score,
      label: String(payload.label || ""),
      note: String(payload.note || "").slice(0, 500),
      logged_at: new Date().toISOString(),
    })
    .select("id, score, label, note, logged_at")
    .single();

  if (error) {
    if (isMissingTableError(error)) {
      const fallback = readFallbackDb();
      if (!fallback.moodsByUserId[session.user.id]) {
        fallback.moodsByUserId[session.user.id] = [];
      }
      const entry = {
        id: crypto.randomUUID(),
        score,
        label: String(payload.label || ""),
        note: String(payload.note || "").slice(0, 500),
        loggedAt: new Date().toISOString(),
      };
      fallback.moodsByUserId[session.user.id].push(entry);
      writeFallbackDb(fallback);
      return { entry };
    }
    throw normalizeError(error, "Failed to log mood");
  }
  return {
    entry: {
      id: data.id,
      score: data.score,
      label: data.label,
      note: data.note,
      loggedAt: data.logged_at,
    },
  };
};

export const getMoodHistory = async () => {
  const { supabase, session } = await ensureSession();
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("mood_logs")
    .select("id, score, label, note, logged_at")
    .eq("user_id", session.user.id)
    .gte("logged_at", since)
    .order("logged_at", { ascending: true });

  if (error) {
    if (isMissingTableError(error)) {
      const fallback = readFallbackDb();
      const all = fallback.moodsByUserId[session.user.id] || [];
      const sinceTs = new Date(since).getTime();
      const history = all
        .filter((row) => new Date(row.loggedAt).getTime() >= sinceTs)
        .sort(
          (a, b) =>
            new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime(),
        );
      return { history };
    }
    throw normalizeError(error, "Failed to load mood history");
  }
  return {
    history: (data || []).map((row) => ({
      id: row.id,
      score: row.score,
      label: row.label,
      note: row.note,
      loggedAt: row.logged_at,
    })),
  };
};

// Community
export const getCommunityPosts = async () => {
  const { supabase, session } = await ensureSession();
  const { data, error } = await supabase
    .from("community_posts")
    .select("id, user_id, content, tags, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    if (isMissingTableError(error)) {
      const fallback = readFallbackDb();
      const posts = (fallback.communityPosts || [])
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      return { posts };
    }
    throw normalizeError(error, "Failed to load community posts");
  }

  const userIds = [...new Set((data || []).map((post) => post.user_id))];
  let profileById = {};

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name")
      .in("id", userIds);
    profileById = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
  }

  return {
    posts: (data || []).map((post) => ({
      id: post.id,
      userId: post.user_id,
      content: post.content,
      tags: post.tags || [],
      createdAt: post.created_at,
      authorName: profileById[post.user_id]?.name || "User",
    })),
  };
};

export const createCommunityPost = async (_token, payload) => {
  const { supabase, session } = await ensureSession();
  const content = String(payload?.content || "").trim();
  if (content.length < 3) {
    throw new Error("Post content must be at least 3 characters");
  }

  const tags = Array.isArray(payload?.tags)
    ? payload.tags
        .map((tag) => String(tag).trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 5)
    : [];

  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      user_id: session.user.id,
      content: content.slice(0, 1500),
      tags,
    })
    .select("id, user_id, content, tags, created_at")
    .single();

  if (error) {
    if (isMissingTableError(error)) {
      const fallback = readFallbackDb();
      const post = {
        id: crypto.randomUUID(),
        userId: session.user.id,
        content: content.slice(0, 1500),
        tags,
        createdAt: new Date().toISOString(),
        authorName: mapUser(session.user).name,
      };
      fallback.communityPosts = [
        post,
        ...(fallback.communityPosts || []),
      ].slice(0, 200);
      writeFallbackDb(fallback);
      return { post };
    }
    throw normalizeError(error, "Failed to create post");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", session.user.id)
    .maybeSingle();

  return {
    post: {
      id: data.id,
      userId: data.user_id,
      content: data.content,
      tags: data.tags || [],
      createdAt: data.created_at,
      authorName: profile?.name || mapUser(session.user).name,
    },
  };
};

// Research
const RESEARCH_QUERIES = [
  "(deaf mental health) OR (hard of hearing mental health)",
  "(hearing loss depression) OR (hearing loss anxiety)",
  "(deaf trauma) OR (communication fatigue)",
  "(sign language psychotherapy) OR (accessible counseling)",
];

export const getResearchArticles = async (variant = 0) => {
  try {
    const normalizedVariant = Math.abs(Number(variant) || 0);
    const queryIndex = normalizedVariant % RESEARCH_QUERIES.length;
    const page = Math.floor(normalizedVariant / RESEARCH_QUERIES.length) + 1;
    const europePmc = await safeFetchJson(
      `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(RESEARCH_QUERIES[queryIndex])}&format=json&pageSize=8&page=${page}&sort_date:y`,
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

    return { source: "europe-pmc", items };
  } catch {
    return {
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
      ],
    };
  }
};
