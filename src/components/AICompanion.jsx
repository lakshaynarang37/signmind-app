import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Brain,
  Loader2,
  RotateCcw,
  Sparkles,
  Wind,
  Eye,
  Zap,
  Clock,
  Play,
  Pause,
  RefreshCw,
  ChevronLeft,
  Info,
} from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import {
  looksLikeCrisis,
  looksLikeDistress,
  sendAIMessage,
  analyzeJournalMood,
  getAIChatSessions,
  getAIChatMessages,
  saveAIChatTurn,
} from "../services/backendApi";
import { cn } from "../lib/utils";

// ─── Visual Therapy Modules ───────────────────────────────────────────────────
const THERAPY_MODULES = [
  {
    id: "breathe",
    icon: Wind,
    title: "Color Breathing Sync",
    tag: "5 min · Beginner",
    desc: "A visual breathing practice with expanding rings to help you slow down and settle.",
    color: "hsl(174 72% 47%)",
    bgClass: "bg-teal-500/10",
    textClass: "text-teal-400",
    dur: 300,
  },
  {
    id: "ground",
    icon: Eye,
    title: "Grounding Through Shapes",
    tag: "10 min · Intermediate",
    desc: "Follow simple moving shapes to interrupt racing thoughts and return to the present.",
    color: "hsl(252 85% 68%)",
    bgClass: "bg-violet-500/10",
    textClass: "text-violet-400",
    dur: 600,
  },
  {
    id: "affirm",
    icon: Zap,
    title: "Visual Confidence Loop",
    tag: "3 min · All levels",
    desc: "Short supportive prompts that are easy to read, repeat, and use during a hard moment.",
    color: "hsl(38 92% 50%)",
    bgClass: "bg-amber-500/10",
    textClass: "text-amber-400",
    dur: 180,
  },
  {
    id: "reset",
    icon: Clock,
    title: "Captioned 5-4-3-2-1 Reset",
    tag: "8 min · Beginner",
    desc: "A visual grounding sequence that names what you can see, feel, and notice without audio.",
    color: "hsl(344 82% 60%)",
    bgClass: "bg-rose-500/10",
    textClass: "text-rose-400",
    dur: 480,
  },
  {
    id: "boundary",
    icon: Info,
    title: "Boundary Script Cards",
    tag: "4 min · Practical",
    desc: "Swipe through clear text prompts for asking for captions, pauses, or more time to process.",
    color: "hsl(200 84% 55%)",
    bgClass: "bg-sky-500/10",
    textClass: "text-sky-400",
    dur: 240,
  },
  {
    id: "release",
    icon: Sparkles,
    title: "Silent Tension Release",
    tag: "6 min · Beginner",
    desc: "A gentle visual sequence for relaxing shoulders, jaw, and hands after a long day of communication.",
    color: "hsl(142 72% 45%)",
    bgClass: "bg-emerald-500/10",
    textClass: "text-emerald-400",
    dur: 360,
  },
];

const AFFIRMATIONS = [
  "You are safe in this moment.",
  "Your pace is enough.",
  "Your feelings are valid.",
  "Progress can be gentle.",
];
const QUICK_PROMPTS = [
  "I feel anxious and overloaded right now",
  "I feel isolated today",
  "Can you guide me through grounding?",
  "Communication fatigue is hitting me hard",
  "What is one visual way to lower stress?",
  "Help me sort through what I am feeling",
];

const WELCOME_MESSAGE = {
  role: "assistant",
  content:
    "Hi, I am MindBridge. This is a calm, text-first space for Deaf and Hard-of-Hearing users to check in, reflect, and find practical coping steps. What feels most important right now?",
};

// ─── Therapy Visual Components ────────────────────────────────────────────────
const BreathingVisual = ({ playing }) => (
  <div className="flex-1 flex flex-col items-center justify-center relative bg-linear-to-b from-teal-950/30 to-background">
    <motion.div
      animate={
        playing ? { scale: [1, 1.8, 1], opacity: [0.15, 0.04, 0.15] } : {}
      }
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      className="absolute w-64 h-64 rounded-full"
      style={{ background: "hsl(174 72% 47%)", filter: "blur(60px)" }}
    />
    {[200, 140, 96].map((size, i) => (
      <motion.div
        key={i}
        animate={playing ? { scale: [1, 1.5 - i * 0.1, 1] } : {}}
        transition={{
          duration: 7,
          ease: "easeInOut",
          repeat: Infinity,
          delay: i * 0.5,
        }}
        className={`absolute rounded-full ${i === 2 ? "flex items-center justify-center" : ""}`}
        style={{
          width: size,
          height: size,
          border: `${i + 1}px solid hsl(174 72% 47% / ${0.3 + i * 0.2})`,
          background: i === 2 ? "hsl(174 72% 47% / 0.15)" : "transparent",
        }}
      >
        {i === 2 && (
          <motion.span
            animate={playing ? { opacity: [1, 0, 1] } : {}}
            transition={{ duration: 7, repeat: Infinity }}
            className="text-teal-400 text-sm font-semibold"
          >
            {playing ? "Inhale" : "Ready"}
          </motion.span>
        )}
      </motion.div>
    ))}
    {playing && (
      <p className="absolute bottom-10 text-xs text-muted-foreground">
        Follow the ring · 7s in · 4s hold · 8s out
      </p>
    )}
  </div>
);

const GroundingVisual = ({ playing }) => (
  <div className="flex-1 flex items-center justify-center bg-linear-to-b from-violet-950/30 to-background">
    <motion.div
      animate={
        playing ? { rotate: [0, 12, -12, 0], scale: [1, 1.08, 0.95, 1] } : {}
      }
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="w-40 h-40 rounded-3xl border-2 border-violet-500 bg-violet-500/10"
    />
  </div>
);

const AffirmVisual = ({ playing }) => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(
      () => setIdx((p) => (p + 1) % AFFIRMATIONS.length),
      4500,
    );
    return () => clearInterval(t);
  }, [playing]);
  return (
    <div className="flex-1 flex items-center justify-center bg-linear-to-b from-amber-950/20 to-background p-8">
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-xl font-display font-semibold text-center text-foreground max-w-sm"
        >
          {AFFIRMATIONS[idx]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

const ResetVisual = ({ playing }) => {
  const steps = [
    "5 things you can see",
    "4 things you can touch",
    "3 things you can notice",
    "2 things you can smell",
    "1 thing you need right now",
  ];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(
      () => setIdx((value) => (value + 1) % steps.length),
      3200,
    );
    return () => clearInterval(t);
  }, [playing]);

  return (
    <div className="flex-1 flex items-center justify-center bg-linear-to-b from-rose-950/20 to-background p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-center max-w-sm space-y-4"
        >
          <div className="w-20 h-20 rounded-3xl mx-auto bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-3xl font-display font-bold text-rose-300">
            {idx + 1}
          </div>
          <p className="text-xl font-display font-semibold text-foreground">
            {steps[idx]}
          </p>
          <p className="text-sm text-muted-foreground">
            Move at your own pace. This is a visual reset, not a test.
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const BoundaryCardsVisual = ({ playing }) => {
  const cards = [
    "Please type that for me.",
    "I need captions to follow this.",
    "Give me a moment to process.",
    "Can we slow down and repeat that in text?",
  ];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(
      () => setIdx((value) => (value + 1) % cards.length),
      3400,
    );
    return () => clearInterval(t);
  }, [playing]);

  return (
    <div className="flex-1 flex items-center justify-center bg-linear-to-b from-sky-950/20 to-background p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="w-full max-w-sm rounded-3xl border border-sky-500/20 bg-card/80 p-6 shadow-lg"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-sky-400 mb-4">
            Boundary card
          </p>
          <p className="text-2xl font-display font-semibold text-foreground leading-snug">
            {cards[idx]}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            These are short scripts you can copy or show when communication gets
            hard.
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const ReleaseVisual = ({ playing }) => {
  const [step, setStep] = useState(0);
  const instructions = [
    "Relax your shoulders",
    "Unclench your jaw",
    "Open and close your hands",
    "Let your breath stay slow",
  ];

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(
      () => setStep((value) => (value + 1) % instructions.length),
      2800,
    );
    return () => clearInterval(t);
  }, [playing]);

  return (
    <div className="flex-1 flex items-center justify-center bg-linear-to-b from-emerald-950/20 to-background p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="max-w-sm text-center space-y-4"
        >
          <motion.div
            animate={playing ? { scale: [1, 1.04, 1] } : {}}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-28 h-28 rounded-full mx-auto border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-center"
          >
            <Sparkles size={28} className="text-emerald-400" />
          </motion.div>
          <p className="text-xl font-display font-semibold text-foreground">
            {instructions[step]}
          </p>
          <p className="text-sm text-muted-foreground">
            Communication fatigue lives in the body too. Release tension one
            step at a time.
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ─── Chat Message ─────────────────────────────────────────────────────────────
const Message = ({ msg }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "flex gap-3",
      msg.role === "user" ? "flex-row-reverse" : "flex-row",
    )}
  >
    {msg.role === "assistant" && (
      <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-600 to-indigo-700 flex items-center justify-center shrink-0 mt-1">
        <Brain size={14} className="text-white" />
      </div>
    )}
    <div
      className={cn(
        "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
        msg.role === "user"
          ? "bg-violet-600 text-white rounded-tr-sm"
          : "bg-card border border-border text-foreground rounded-tl-sm",
      )}
    >
      {msg.role === "assistant" && (
        <p className="text-[10px] font-semibold text-violet-400 mb-1">
          MindBridge
        </p>
      )}
      {msg.content}
    </div>
  </motion.div>
);

const TypingIndicator = () => (
  <div className="flex gap-3">
    <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-600 to-indigo-700 flex items-center justify-center shrink-0">
      <Brain size={14} className="text-white" />
    </div>
    <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }}
          className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
        />
      ))}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AICompanion = ({ token, onCrisisDetected }) => {
  const [view, setView] = useState("home"); // home | chat | therapy
  const [activeModule, setActiveModule] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [remainSec, setRemainSec] = useState(0);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [distressAttempts, setDistressAttempts] = useState(0);
  const [chatSessions, setChatSessions] = useState([]);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const sessionLabel = chatSessions.find((item) => item.id === activeSessionId);

  const module = THERAPY_MODULES.find((m) => m.id === activeModule);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const loadChatSessions = async (preferredSessionId = null) => {
    setSessionLoading(true);
    try {
      const { sessions } = await getAIChatSessions();
      setChatSessions(sessions || []);
      const nextSessionId = preferredSessionId || activeSessionId || null;
      if (nextSessionId && nextSessionId !== activeSessionId) {
        const { messages: storedMessages } =
          await getAIChatMessages(nextSessionId);
        setActiveSessionId(nextSessionId);
        setMessages(
          storedMessages.length > 0 ? storedMessages : [WELCOME_MESSAGE],
        );
      }
    } catch {
      setChatSessions([]);
    } finally {
      setSessionLoading(false);
    }
  };

  const resetConversation = () => {
    setActiveSessionId(null);
    setMessages([WELCOME_MESSAGE]);
    setInput("");
    setDistressAttempts(0);
  };

  const openSession = async (sessionId) => {
    if (!sessionId) return;
    try {
      const { messages: storedMessages } = await getAIChatMessages(sessionId);
      setActiveSessionId(sessionId);
      setMessages(
        storedMessages.length > 0 ? storedMessages : [WELCOME_MESSAGE],
      );
    } catch {
      setActiveSessionId(sessionId);
      setMessages([WELCOME_MESSAGE]);
    }
    setView("chat");
    setDistressAttempts(0);
  };

  // Therapy timer
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setRemainSec((v) => {
        if (v <= 1) {
          setPlaying(false);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [playing]);

  const fmt = (s) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content || sending) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setSending(true);

    const isCrisis = looksLikeCrisis(content);
    const isDistress = looksLikeDistress(content);
    const nextAttempts = isDistress ? distressAttempts + 1 : 0;
    setDistressAttempts(nextAttempts);
    const nextSessionId = activeSessionId || crypto.randomUUID();
    if (!activeSessionId) {
      setActiveSessionId(nextSessionId);
    }

    let mood = { score: 5, label: "neutral" };
    try {
      mood = await analyzeJournalMood(token, content);
    } catch {
      mood = {
        score: isCrisis ? 1 : isDistress ? 3 : 5,
        label: isCrisis ? "critical" : isDistress ? "low" : "neutral",
      };
    }

    const shouldEscalate = isCrisis || nextAttempts >= 2;

    if (shouldEscalate) {
      const assistantMessage =
        "I am opening crisis support now so you can get immediate help.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantMessage },
      ]);
      try {
        await saveAIChatTurn(nextSessionId, {
          userMessage: content,
          assistantMessage,
          moodScore: mood.score,
          moodLabel: mood.label,
          crisis: true,
          title: content,
          preview: assistantMessage,
          isNewSession: !activeSessionId,
        });
        await loadChatSessions(nextSessionId);
      } catch {
        // Persistence failures should not block crisis support.
      }
      onCrisisDetected?.();
      setSending(false);
      return;
    }

    try {
      const result = await sendAIMessage(
        token,
        newMessages.map(({ role, content }) => ({ role, content })),
      );
      if (result?.crisis) {
        onCrisisDetected?.();
      }
      if (result?.crisis || nextAttempts >= 3) {
        onCrisisDetected?.();
      }
      const reply =
        result?.reply ||
        "I am here with you. Tell me what happened in the last hour so we can take one practical next step.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      try {
        await saveAIChatTurn(nextSessionId, {
          userMessage: content,
          assistantMessage: reply,
          moodScore: mood.score,
          moodLabel: mood.label,
          crisis: Boolean(result?.crisis),
          title: content,
          preview: reply,
          isNewSession: !activeSessionId,
        });
        await loadChatSessions(nextSessionId);
      } catch {
        // Keep the chat usable even if history storage is temporarily unavailable.
      }
    } catch {
      const fallbackReply =
        "I am having trouble connecting right now. Please try again in a moment. If helpful, you can use one of the breathing or grounding modules while this reconnects.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: fallbackReply },
      ]);
      try {
        await saveAIChatTurn(nextSessionId, {
          userMessage: content,
          assistantMessage: fallbackReply,
          moodScore: mood.score,
          moodLabel: mood.label,
          crisis: false,
          title: content,
          preview: fallbackReply,
          isNewSession: !activeSessionId,
        });
        await loadChatSessions(nextSessionId);
      } catch {
        // Ignore persistence errors in the fallback path too.
      }
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    loadChatSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const autoPrompt = localStorage.getItem("signmind_ai_autostart_message");
    if (!autoPrompt) return;
    localStorage.removeItem("signmind_ai_autostart_message");
    setView("chat");
    // Wait one tick so chat view mounts before sending.
    setTimeout(() => {
      sendMessage(autoPrompt);
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ─── Home View ───────────────────────────────────────────────────────────────
  if (view === "home") {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="font-display text-2xl font-bold mb-1">
            Your Wellness Space
          </h2>
          <p className="text-muted-foreground text-sm">
            Private support chat and visual exercises designed for DHH users
          </p>
        </div>

        {/* AI Companion card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div
            className="relative rounded-2xl border border-violet-500/25 bg-linear-to-br from-card to-violet-950/20 p-6 overflow-hidden cursor-pointer hover:border-violet-500/40 transition-all duration-200"
            onClick={() => setView("chat")}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,hsl(252_85%_68%/0.1),transparent_60%)] pointer-events-none" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg glow-violet shrink-0">
                <Brain size={26} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display text-lg font-semibold">
                    MindBridge Chat
                  </h3>
                  <Badge variant="violet">
                    <Sparkles size={10} /> Available
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  A supportive check-in space for stress, emotions, and daily
                  overwhelm. You can vent, reflect, or ask for one small next
                  step.
                </p>
                <Button
                  variant="brand"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setView("chat");
                  }}
                >
                  Open Chat <Sparkles size={13} />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="rounded-2xl border border-border/60 bg-card/60 p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-sm">Recent chat history</h3>
              <p className="text-xs text-muted-foreground">
                Each chat is stored per user with a mood tag from the latest
                check-in.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                resetConversation();
                setView("chat");
              }}
            >
              New chat
            </Button>
          </div>

          {sessionLoading ? (
            <div className="grid grid-cols-1 gap-2">
              {[1, 2].map((item) => (
                <div key={item} className="h-16 rounded-xl shimmer-bg" />
              ))}
            </div>
          ) : chatSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No saved chats yet. Start one and your mood will be tracked
              automatically.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {chatSessions.slice(0, 3).map((session) => (
                <button
                  key={session.id}
                  onClick={() => openSession(session.id)}
                  className="w-full text-left rounded-xl border border-border/60 bg-background/60 px-4 py-3 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {session.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {session.preview || "Support chat"}
                      </p>
                    </div>
                    <Badge
                      variant={
                        session.moodLabel === "critical"
                          ? "destructive"
                          : session.moodLabel === "low"
                            ? "amber"
                            : session.moodLabel === "positive"
                              ? "emerald"
                              : "secondary"
                      }
                      className="shrink-0 text-[10px] capitalize"
                    >
                      {session.moodLabel}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Therapy Modules */}
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground mb-3">
            Visual Therapy Modules
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {THERAPY_MODULES.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <Card
                    className="border-border/50 cursor-pointer hover:border-border transition-all duration-200 overflow-hidden group"
                    onClick={() => {
                      setActiveModule(mod.id);
                      setRemainSec(mod.dur);
                      setPlaying(false);
                      setView("therapy");
                    }}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center ${mod.bgClass}`}
                        >
                          <Icon size={16} className={mod.textClass} />
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
                          {mod.tag}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-sm mb-1 group-hover:text-foreground transition-colors">
                        {mod.title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {mod.desc}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── Chat View ───────────────────────────────────────────────────────────────
  if (view === "chat") {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setView("home")}
            >
              <ChevronLeft size={16} />
            </Button>
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-600 to-indigo-700 flex items-center justify-center">
              <Brain size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">MindBridge Chat</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[10px] text-muted-foreground">
                  Support chat · Online
                </p>
              </div>
              {sessionLabel && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Saved chat · mood {sessionLabel.moodLabel}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => loadChatSessions(activeSessionId || null)}
            >
              <RotateCcw size={14} />
            </Button>
            <Button variant="ghost" size="sm" onClick={resetConversation}>
              New
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.map((msg, i) => (
            <Message key={i} msg={msg} />
          ))}
          {sending && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-violet-500/40 hover:bg-violet-500/5 text-muted-foreground hover:text-foreground transition-all duration-200"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2 items-end border-t border-border pt-4">
          <Textarea
            ref={inputRef}
            placeholder="Type a message... (Enter to send, Shift+Enter for a new line)"
            className="flex-1 min-h-12 max-h-32 resize-none text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
          />
          <Button
            variant="brand"
            size="icon"
            className="h-12 w-12 shrink-0"
            onClick={() => sendMessage()}
            disabled={sending || !input.trim()}
          >
            {sending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </Button>
        </div>
      </div>
    );
  }

  // ─── Therapy Module View ──────────────────────────────────────────────────────
  if (view === "therapy" && module) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
          <Button variant="ghost" size="sm" onClick={() => setView("home")}>
            <ChevronLeft size={15} /> All Modules
          </Button>
          <div className="text-center">
            <h3 className="font-semibold text-sm">{module.title}</h3>
            <p className="text-xs text-muted-foreground">{module.tag}</p>
          </div>
          <div className="w-24" />
        </div>

        <div className="flex-1 rounded-xl border border-border overflow-hidden flex flex-col bg-card/30">
          {activeModule === "breathe" && <BreathingVisual playing={playing} />}
          {activeModule === "ground" && <GroundingVisual playing={playing} />}
          {activeModule === "affirm" && <AffirmVisual playing={playing} />}
          {activeModule === "reset" && <ResetVisual playing={playing} />}
          {activeModule === "boundary" && (
            <BoundaryCardsVisual playing={playing} />
          )}
          {activeModule === "release" && <ReleaseVisual playing={playing} />}

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 p-5 border-t border-border bg-card/50 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setPlaying(false);
                setRemainSec(module.dur);
              }}
            >
              <RefreshCw size={15} />
            </Button>
            <button
              onClick={() => setPlaying((p) => !p)}
              className="w-14 h-14 rounded-full bg-foreground flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform duration-150"
            >
              {playing ? (
                <Pause
                  size={22}
                  fill="hsl(var(--background))"
                  color="hsl(var(--background))"
                />
              ) : (
                <Play
                  size={22}
                  fill="hsl(var(--background))"
                  color="hsl(var(--background))"
                  style={{ marginLeft: 2 }}
                />
              )}
            </button>
            <div className="font-mono text-sm text-muted-foreground px-3 py-1.5 rounded-full bg-muted">
              {fmt(remainSec || module.dur)}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default AICompanion;
