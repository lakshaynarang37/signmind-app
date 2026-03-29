import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Brain, Smile, Calendar, Info, Loader2, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { getMoodHistory, sendAIMessage } from "../services/backendApi";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const COLORS = ["hsl(252 85% 68%)", "hsl(174 72% 47%)", "hsl(344 82% 60%)", "hsl(38 92% 50%)", "hsl(160 60% 45%)", "hsl(210 80% 65%)", "hsl(280 70% 60%)"];

const Insights = ({ token }) => {
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState("");
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    getMoodHistory(token)
      .then((d) => setMoodHistory(d.history || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const generateInsight = async () => {
    if (!moodHistory.length) return;
    setLoadingInsight(true);
    const summary = moodHistory.slice(-7).map((m) => `${new Date(m.loggedAt).toLocaleDateString("en-US", { weekday: "short" })}: ${m.score}/10 (${m.label})`).join(", ");
    try {
      const { reply } = await sendAIMessage(token, [{ role: "user", content: `Based on my mood logs from the past week: ${summary} — please give me a concise 3-4 sentence psychological insight about my emotional pattern, and one practical coping strategy tailored for a Deaf/Hard-of-Hearing person.` }]);
      setAiInsight(reply);
    } catch { setAiInsight("Unable to generate insight right now. Keep logging your mood daily for best results."); }
    setLoadingInsight(false);
  };

  // Build 7-day data
  const todayIdx = new Date().getDay();
  const dayData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toDateString();
    const dayLogs = moodHistory.filter((m) => new Date(m.loggedAt).toDateString() === dateStr);
    const avg = dayLogs.length ? Math.round(dayLogs.reduce((s, m) => s + m.score, 0) / dayLogs.length) : null;
    return { day: DAYS[d.getDay()], value: avg, count: dayLogs.length, color: COLORS[i] };
  });

  const allScores = moodHistory.map((m) => m.score);
  const avgScore = allScores.length ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1) : null;
  const maxScore = allScores.length ? Math.max(...allScores) : null;
  const minScore = allScores.length ? Math.min(...allScores) : null;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold mb-1">AI Insights</h2>
        <p className="text-muted-foreground text-sm">Pattern analysis of your mood, emotions, and wellness trends</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Weekly Avg", value: avgScore ?? "–", desc: "Mood score out of 10", color: "text-violet-400" },
          { label: "Peak Mood", value: maxScore ?? "–", desc: "Best day score", color: "text-emerald-400" },
          { label: "Total Logs", value: moodHistory.length, desc: "Mood check-ins", color: "text-amber-400" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="border-border/50 text-center">
              <CardContent className="p-4">
                <p className={`text-2xl font-display font-bold ${s.color} tracking-tight`}>{s.value}</p>
                <p className="text-xs font-semibold text-foreground mt-1">{s.label}</p>
                <p className="text-[10px] text-muted-foreground">{s.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Mood Chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><Activity size={14} className="text-violet-400" /> 7-Day Mood History</CardTitle>
              <Badge variant="secondary" className="text-[10px]"><Calendar size={9} /> Last 7 days</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-24 shimmer-bg rounded-lg" />
            ) : (
              <div className="flex items-end gap-2 h-28 mt-2">
                {dayData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full h-20 flex items-end justify-center relative group">
                      {d.value !== null ? (
                        <>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(d.value / 10) * 100}%` }}
                            transition={{ duration: 0.6, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                            className="w-full max-w-[28px] rounded-t-md cursor-pointer"
                            style={{ background: d.color, opacity: 0.85 }}
                          />
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-card border border-border rounded px-1.5 py-0.5 text-[10px] text-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                            {d.value}/10
                          </div>
                        </>
                      ) : (
                        <div className="w-full max-w-[28px] h-1 rounded-full bg-border/50" />
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{d.day}</span>
                  </div>
                ))}
              </div>
            )}
            {!loading && moodHistory.length === 0 && (
              <p className="text-center text-xs text-muted-foreground mt-4">No mood data yet. Start logging from the Journal page to see your trends.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* AI-Generated Insight */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-border/50 border-violet-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <Brain size={13} className="text-white" />
              </div>
              AI Pattern Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aiInsight ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-foreground/80 leading-relaxed bg-violet-500/5 border border-violet-500/15 rounded-xl p-4">
                {aiInsight}
              </motion.div>
            ) : (
              <div className="text-center py-6">
                <Brain size={28} className="mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground mb-4">
                  {moodHistory.length >= 3 ? "Generate a personalized AI insight based on your mood history." : "Log at least 3 moods to unlock AI pattern analysis."}
                </p>
                <Button variant="brand" size="sm" onClick={generateInsight} disabled={loadingInsight || moodHistory.length < 3}>
                  {loadingInsight ? <><Loader2 size={13} className="animate-spin" /> Analyzing...</> : <><Brain size={13} /> Generate Insight</>}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Mood Log Table */}
      {moodHistory.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Mood Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {moodHistory.slice(0, 10).reverse().map((m, i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5 border-b border-border/30 last:border-0">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white" style={{ background: COLORS[m.score % COLORS.length] }}>{m.score}</div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">{m.label || "Mood check-in"}</p>
                      {m.note && <p className="text-[10px] text-muted-foreground truncate">{m.note}</p>}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{new Date(m.loggedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Insights;
