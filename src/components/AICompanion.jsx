import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Brain, Loader2, RotateCcw, Sparkles, Wind, Eye, Zap, Clock,
  Play, Pause, RefreshCw, ChevronLeft, Info
} from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { sendAIMessage } from "../services/backendApi";
import { cn } from "../lib/utils";

// ─── Visual Therapy Modules ───────────────────────────────────────────────────
const THERAPY_MODULES = [
  { id: "breathe", icon: Wind, title: "Color Breathing Sync", tag: "5 min · Beginner", desc: "Fully visual breathing exercise using expanding color rings. Activates the parasympathetic system to reduce anxiety.", color: "hsl(174 72% 47%)", bgClass: "bg-teal-500/10", textClass: "text-teal-400", dur: 300 },
  { id: "ground", icon: Eye, title: "Grounding Through Shapes", tag: "10 min · Intermediate", desc: "Gaze-focus on morphing geometric patterns to interrupt anxiety spirals. Based on the 5-4-3-2-1 grounding technique.", color: "hsl(252 85% 68%)", bgClass: "bg-violet-500/10", textClass: "text-violet-400", dur: 600 },
  { id: "affirm", icon: Zap, title: "ASL Affirmation Loop", tag: "3 min · All levels", desc: "A continuous loop of positive affirmations in ASL context. Delivered natively — not as a hearing-first adaptation.", color: "hsl(38 92% 50%)", bgClass: "bg-amber-500/10", textClass: "text-amber-400", dur: 180 },
  { id: "scan", icon: Clock, title: "Visual Body Scan", tag: "8 min · Beginner", desc: "Guided mindful body scan using visual color halos. Fully visual, zero narration. Helps somatic awareness.", color: "hsl(344 82% 60%)", bgClass: "bg-rose-500/10", textClass: "text-rose-400", dur: 480 },
];

const AFFIRMATIONS = ["You are safe in this moment.", "Your pace is enough.", "Your feelings are valid.", "Progress can be gentle."];
const QUICK_PROMPTS = [
  "I'm feeling anxious and overwhelmed",
  "I feel isolated and alone today",
  "Help me ground myself right now",
  "I'm struggling with communication barriers",
  "How can I manage stress visually?",
  "I need help processing my emotions",
];

// ─── Therapy Visual Components ────────────────────────────────────────────────
const BreathingVisual = ({ playing }) => (
  <div className="flex-1 flex flex-col items-center justify-center relative bg-gradient-to-b from-teal-950/30 to-background">
    <motion.div animate={playing ? { scale: [1, 1.8, 1], opacity: [0.15, 0.04, 0.15] } : {}} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      className="absolute w-64 h-64 rounded-full" style={{ background: "hsl(174 72% 47%)", filter: "blur(60px)" }} />
    {[200, 140, 96].map((size, i) => (
      <motion.div key={i} animate={playing ? { scale: [1, 1.5 - i * 0.1, 1] } : {}} transition={{ duration: 7, ease: "easeInOut", repeat: Infinity, delay: i * 0.5 }}
        className={`absolute rounded-full ${i === 2 ? "flex items-center justify-center" : ""}`}
        style={{ width: size, height: size, border: `${i + 1}px solid hsl(174 72% 47% / ${0.3 + i * 0.2})`, background: i === 2 ? "hsl(174 72% 47% / 0.15)" : "transparent" }}>
        {i === 2 && <motion.span animate={playing ? { opacity: [1, 0, 1] } : {}} transition={{ duration: 7, repeat: Infinity }} className="text-teal-400 text-sm font-semibold">{playing ? "Inhale" : "Ready"}</motion.span>}
      </motion.div>
    ))}
    {playing && <p className="absolute bottom-10 text-xs text-muted-foreground">Follow the ring · 7s in · 4s hold · 8s out</p>}
  </div>
);

const GroundingVisual = ({ playing }) => (
  <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-violet-950/30 to-background">
    <motion.div animate={playing ? { rotate: [0, 12, -12, 0], scale: [1, 1.08, 0.95, 1] } : {}} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="w-40 h-40 rounded-3xl border-2 border-violet-500 bg-violet-500/10" />
  </div>
);

const AffirmVisual = ({ playing }) => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setIdx((p) => (p + 1) % AFFIRMATIONS.length), 4500);
    return () => clearInterval(t);
  }, [playing]);
  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-amber-950/20 to-background p-8">
      <AnimatePresence mode="wait">
        <motion.p key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-xl font-display font-semibold text-center text-foreground max-w-sm">{AFFIRMATIONS[idx]}</motion.p>
      </AnimatePresence>
    </div>
  );
};

const BodyScanVisual = ({ playing, pct }) => (
  <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-rose-950/20 to-background p-8 gap-4">
    <div className="w-full max-w-sm">
      <div className="h-2.5 rounded-full bg-muted overflow-hidden border border-border">
        <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: "easeOut" }} className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500" />
      </div>
      <p className="text-sm text-muted-foreground text-center mt-3">{playing ? "Scanning from head to toe with gentle visual cues..." : "Ready for guided body scan"}</p>
    </div>
  </div>
);

// ─── Chat Message ─────────────────────────────────────────────────────────────
const Message = ({ msg }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
    {msg.role === "assistant" && (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center flex-shrink-0 mt-1">
        <Brain size={14} className="text-white" />
      </div>
    )}
    <div className={cn("max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed", msg.role === "user" ? "bg-violet-600 text-white rounded-tr-sm" : "bg-card border border-border text-foreground rounded-tl-sm")}>
      {msg.role === "assistant" && <p className="text-[10px] font-semibold text-violet-400 mb-1">MindBridge AI</p>}
      {msg.content}
    </div>
  </motion.div>
);

const TypingIndicator = () => (
  <div className="flex gap-3">
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
      <Brain size={14} className="text-white" />
    </div>
    <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }} className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
      ))}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AICompanion = ({ token }) => {
  const [view, setView] = useState("home"); // home | chat | therapy
  const [activeModule, setActiveModule] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [remainSec, setRemainSec] = useState(0);
  const [messages, setMessages] = useState([{ role: "assistant", content: "Hello! I'm MindBridge AI — your personal mental health companion, trained specifically for Deaf and Hard-of-Hearing individuals. I'm here to listen, support, and guide you through evidence-based techniques adapted for DHH experiences. What's on your mind today?" }]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const module = THERAPY_MODULES.find((m) => m.id === activeModule);
  const pct = module ? ((module.dur - remainSec) / module.dur) * 100 : 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Therapy timer
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setRemainSec((v) => { if (v <= 1) { setPlaying(false); return 0; } return v - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [playing]);

  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content || sending) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setSending(true);
    try {
      const { reply } = await sendAIMessage(token, newMessages.map(({ role, content }) => ({ role, content })));
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "I'm having trouble connecting right now. Please try again in a moment. Remember, you can always use the breathing exercise while I reconnect." }]);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ─── Home View ───────────────────────────────────────────────────────────────
  if (view === "home") {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="font-display text-2xl font-bold mb-1">Your Wellness Space</h2>
          <p className="text-muted-foreground text-sm">AI-powered support + visual therapy — all designed for DHH users</p>
        </div>

        {/* AI Companion card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="relative rounded-2xl border border-violet-500/25 bg-gradient-to-br from-card to-violet-950/20 p-6 overflow-hidden cursor-pointer hover:border-violet-500/40 transition-all duration-200"
            onClick={() => setView("chat")}>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,hsl(252_85%_68%/0.1),transparent_60%)] pointer-events-none" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg glow-violet flex-shrink-0">
                <Brain size={26} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display text-lg font-semibold">MindBridge AI</h3>
                  <Badge variant="violet"><Sparkles size={10} /> Live</Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">Your personal DHH-trained psychologist and consultant. Empathetic, ASL-culture-aware, always available. No appointments, no barriers.</p>
                <Button variant="brand" size="sm" onClick={(e) => { e.stopPropagation(); setView("chat"); }}>
                  Start Conversation <Sparkles size={13} />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Therapy Modules */}
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground mb-3">Visual Therapy Modules</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {THERAPY_MODULES.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <motion.div key={mod.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                  <Card className="border-border/50 cursor-pointer hover:border-border transition-all duration-200 overflow-hidden group"
                    onClick={() => { setActiveModule(mod.id); setRemainSec(mod.dur); setPlaying(false); setView("therapy"); }}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${mod.bgClass}`}>
                          <Icon size={16} className={mod.textClass} />
                        </div>
                        <Badge variant="secondary" className="text-[10px]">{mod.tag}</Badge>
                      </div>
                      <h4 className="font-semibold text-sm mb-1 group-hover:text-foreground transition-colors">{mod.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{mod.desc}</p>
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
            <Button variant="ghost" size="icon-sm" onClick={() => setView("home")}><ChevronLeft size={16} /></Button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center">
              <Brain size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">MindBridge AI</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[10px] text-muted-foreground">DHH Psychologist · Online</p>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => setMessages([{ role: "assistant", content: "Chat cleared. I'm still here — what's on your mind?" }])}>
            <RotateCcw size={14} />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
          {sending && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {QUICK_PROMPTS.map((p) => (
              <button key={p} onClick={() => sendMessage(p)}
                className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-violet-500/40 hover:bg-violet-500/5 text-muted-foreground hover:text-foreground transition-all duration-200">
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2 items-end border-t border-border pt-4">
          <Textarea
            ref={inputRef}
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
            className="flex-1 min-h-[48px] max-h-32 resize-none text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
          />
          <Button variant="brand" size="icon" className="h-12 w-12 flex-shrink-0" onClick={() => sendMessage()} disabled={sending || !input.trim()}>
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
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
          <Button variant="ghost" size="sm" onClick={() => setView("home")}><ChevronLeft size={15} /> All Modules</Button>
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
          {activeModule === "scan" && <BodyScanVisual playing={playing} pct={pct} />}

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 p-5 border-t border-border bg-card/50 backdrop-blur-sm">
            <Button variant="ghost" size="icon" onClick={() => { setPlaying(false); setRemainSec(module.dur); }}><RefreshCw size={15} /></Button>
            <button onClick={() => setPlaying((p) => !p)}
              className="w-14 h-14 rounded-full bg-foreground flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform duration-150">
              {playing ? <Pause size={22} fill="hsl(var(--background))" color="hsl(var(--background))" /> : <Play size={22} fill="hsl(var(--background))" color="hsl(var(--background))" style={{ marginLeft: 2 }} />}
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
