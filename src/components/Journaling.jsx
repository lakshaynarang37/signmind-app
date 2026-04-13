import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Send,
  Loader2,
  Trash2,
  Calendar,
  Tag,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import {
  analyzeJournalMood,
  getJournalEntries,
  saveJournalEntry,
  deleteJournalEntry,
  getJournalPrompt,
  logMood,
} from "../services/backendApi";

const MOOD_LABELS = [
  "",
  "Awful",
  "Very Bad",
  "Bad",
  "Rough",
  "Neutral",
  "Okay",
  "Good",
  "Great",
  "Wonderful",
  "Amazing",
];
const MOOD_COLORS = [
  "",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
];
const TAGS = [
  "anxious",
  "hopeful",
  "lonely",
  "connected",
  "stressed",
  "calm",
  "confused",
  "grateful",
  "tired",
  "energized",
];

const Journaling = ({ token, setActiveTab, onCrisisDetected }) => {
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [detectedMood, setDetectedMood] = useState(null);

  useEffect(() => {
    Promise.all([
      getJournalEntries(token)
        .then((d) => setEntries(d.entries || []))
        .catch(() => {}),
      getJournalPrompt()
        .then((d) => setPrompt(d.prompt || ""))
        .catch(() => {}),
    ]).finally(() => setLoadingEntries(false));
  }, [token]);

  const toggleTag = (tag) =>
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag].slice(0, 5),
    );

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const moodResult = await analyzeJournalMood(token, text);
      const score = Math.max(1, Math.min(10, Number(moodResult?.score) || 5));
      const moodLabel =
        MOOD_LABELS[score] || String(moodResult?.label || "neutral");

      const { entry } = await saveJournalEntry(token, {
        text,
        mood: score,
        moodLabel,
        tags: selectedTags,
      });

      await logMood(token, {
        score,
        label: moodLabel,
        note: String(text).slice(0, 280),
      }).catch(() => {});

      setDetectedMood({ score, moodLabel, reason: moodResult?.reason || "" });
      setEntries((prev) => [entry, ...prev]);
      setText("");
      setSelectedTags([]);

      const shouldOpenCrisisSupport = Boolean(moodResult?.crisis) || score <= 1;

      if (shouldOpenCrisisSupport) {
        onCrisisDetected?.();
        localStorage.setItem(
          "signmind_ai_autostart_message",
          "I just logged a very low mood in my journal. Please give me immediate grounding support and a short safety plan for tonight.",
        );
        setActiveTab("ai-companion");
      }
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteJournalEntry(token, id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch {}
    setDeleting(null);
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="font-display text-2xl font-bold mb-1">
          AI Mood Journal
        </h2>
        <p className="text-muted-foreground text-sm">
          AI scores your mood from what you write, then stores your private
          reflection securely.
        </p>
      </div>

      {/* Write Entry Card */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen size={16} className="text-violet-400" /> New Entry
            </CardTitle>
            {prompt && (
              <button
                onClick={() => setText(prompt)}
                className="text-xs text-muted-foreground hover:text-violet-400 transition-colors flex items-center gap-1"
              >
                <Sparkles size={11} /> Use prompt
              </button>
            )}
          </div>
          {prompt && (
            <p className="text-xs text-muted-foreground/70 italic mt-1">
              "{prompt}"
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="How are you feeling? What happened today? What do you want to remember?"
            className="min-h-30"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {detectedMood ? (
            <div className="rounded-lg border border-border bg-card px-3 py-2">
              <p className="text-xs text-muted-foreground">
                Last AI mood analysis
              </p>
              <p
                className="text-sm font-semibold"
                style={{
                  color:
                    MOOD_COLORS[detectedMood.score] || "hsl(var(--foreground))",
                }}
              >
                {detectedMood.moodLabel} ({detectedMood.score}/10)
              </p>
            </div>
          ) : null}

          {/* Tags */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Tag size={12} /> Feeling tags (optional)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all duration-150 ${selectedTags.includes(tag) ? "border-violet-500/50 bg-violet-500/15 text-violet-400" : "border-border text-muted-foreground hover:border-border hover:text-foreground"}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="brand"
            className="w-full"
            onClick={handleSave}
            disabled={saving || !text.trim()}
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <>
                <Send size={15} /> Save Entry
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Past Entries */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <Calendar size={13} /> Past Entries ({entries.length})
        </h3>
        {loadingEntries ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 rounded-xl shimmer-bg" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              Your journal is empty. Write your first entry above.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {entries.map((entry) => (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mb-3"
              >
                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            color: MOOD_COLORS[entry.mood],
                            background: `${MOOD_COLORS[entry.mood]}15`,
                          }}
                        >
                          {MOOD_LABELS[entry.mood] || "Neutral"} · {entry.mood}
                          /10
                        </span>
                        {entry.tags?.map((t) => (
                          <Badge
                            key={t}
                            variant="secondary"
                            className="text-[10px] shrink-0"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          disabled={deleting === entry.id}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          {deleting === entry.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
                      {entry.text}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Journaling;
