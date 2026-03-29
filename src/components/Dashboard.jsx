import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Brain, BarChart3, Users, TrendingUp, Zap, ArrowUpRight,
  Flame, Smile, Target, Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { getDailyWellness, getMoodHistory } from "../services/backendApi";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

const StatCard = ({ value, label, color, icon: Icon, delay }) => (
  <motion.div custom={delay} variants={cardVariants} initial="hidden" animate="visible">
    <Card className="border-border/50 relative overflow-hidden hover:border-border transition-colors duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg ${color.bg}`}>
            <Icon size={16} className={color.text} />
          </div>
        </div>
        <p className={`text-2xl font-display font-bold ${color.text} tracking-tight`}>{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
        <div className={`absolute bottom-0 right-0 w-16 h-16 rounded-full ${color.glow} blur-2xl opacity-25`} />
      </CardContent>
    </Card>
  </motion.div>
);

const MoodBar = ({ day, value, color }) => (
  <div className="flex flex-col items-center gap-1.5 flex-1">
    <div className="w-full h-16 flex items-end justify-center">
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: `${value}%` }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-[28px] rounded-t-md opacity-80"
        style={{ background: color, minHeight: 3 }}
      />
    </div>
    <span className="text-[10px] text-muted-foreground">{day}</span>
  </div>
);

const QuickAction = ({ icon: Icon, label, desc, color, onClick, delay }) => (
  <motion.div custom={delay} variants={cardVariants} initial="hidden" animate="visible">
    <Card
      className="border-border/50 cursor-pointer group hover:border-violet-500/30 transition-all duration-200 overflow-hidden"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color.bg} group-hover:scale-105 transition-transform duration-200`}>
          <Icon size={18} className={color.text} />
        </div>
        <h3 className="font-semibold text-sm text-foreground mb-1">{label}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  </motion.div>
);

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const Dashboard = ({ currentUser, setActiveTab, token }) => {
  const [wellness, setWellness] = useState({ insight: "Your consistency is a strong signal of progress.", affirmation: "Small steady steps still count.", weather: {} });
  const [moodData, setMoodData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getDailyWellness().catch(() => null),
      getMoodHistory(token).catch(() => null),
    ]).then(([wellnessData, moodHistData]) => {
      if (!mounted) return;
      if (wellnessData) setWellness(wellnessData);
      if (moodHistData?.history) setMoodData(moodHistData.history);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [token]);

  // Build 7-day mood chart
  const dayMoods = DAYS.map((day, i) => {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - (6 - i));
    const dateStr = targetDate.toDateString();
    const dayLogs = moodData.filter((m) => new Date(m.loggedAt).toDateString() === dateStr);
    const avg = dayLogs.length ? dayLogs.reduce((s, m) => s + m.score, 0) / dayLogs.length : null;
    const colors = ["hsl(252 85% 68%)", "hsl(174 72% 47%)", "hsl(344 82% 60%)", "hsl(38 92% 50%)", "hsl(160 60% 45%)"];
    return { day, value: avg ? (avg / 10) * 100 : Math.floor(Math.random() * 40 + 30), color: colors[i % 5] };
  });

  const firstName = currentUser?.name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-5">
      {/* Hero Banner */}
      <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
        <div className="relative rounded-2xl border border-violet-500/20 bg-gradient-to-br from-card to-violet-950/20 p-6 lg:p-8 overflow-hidden">
          {/* Blobs */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,hsl(252_85%_68%/0.1),transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_10%_100%,hsl(174_72%_47%/0.07),transparent_60%)] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1">
              <Badge variant="violet" className="mb-3">
                <Zap size={10} /> Daily Check-in
              </Badge>
              <h2 className="font-display text-2xl lg:text-3xl font-bold tracking-tight mb-2">
                {greeting}, {firstName} 👋<br />
                <span className="gradient-text">How are you feeling today?</span>
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5 max-w-lg">
                {wellness.insight} <span className="text-emerald-400 font-medium">{wellness.affirmation}</span>
                {wellness.weather?.temperatureC != null ? ` It's ${wellness.weather.temperatureC}°C outside.` : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="brand" size="sm" onClick={() => setActiveTab("journal")}>
                  <BookOpen size={14} /> Write in Journal
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("ai-companion")}>
                  Talk to AI Companion <ArrowUpRight size={14} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard delay={1} value="14" label="Day Streak" icon={Flame} color={{ bg: "bg-amber-500/10", text: "text-amber-400", glow: "bg-amber-400" }} />
        <StatCard delay={2} value="87%" label="Mood Stability" icon={Smile} color={{ bg: "bg-emerald-500/10", text: "text-emerald-400", glow: "bg-emerald-400" }} />
        <StatCard delay={3} value={Math.max(moodData.length, 0)} label="Mood Logs" icon={Activity} color={{ bg: "bg-violet-500/10", text: "text-violet-400", glow: "bg-violet-400" }} />
        <StatCard delay={4} value="3" label="AI Sessions" icon={Target} color={{ bg: "bg-teal-500/10", text: "text-teal-400", glow: "bg-teal-400" }} />
      </div>

      {/* Mood Chart + Today's Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible" className="lg:col-span-2">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Weekly Mood</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Your emotional arc this week</p>
                </div>
                <Badge variant="emerald">
                  <TrendingUp size={10} /> +12%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-20 mt-2">
                {dayMoods.map((m, i) => <MoodBar key={i} {...m} />)}
              </div>
              <p className="text-xs text-muted-foreground/60 mt-3 text-center">Log your mood daily to see real data here</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div custom={6} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="border-border/50 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Today's Plan</CardTitle>
            </CardHeader>
            <CardContent>
              {[
                { label: "Log morning mood", done: true, color: "text-violet-400" },
                { label: "5-min breathing exercise", done: false, color: "text-teal-400" },
                { label: "Journal entry", done: false, color: "text-amber-400" },
                { label: "AI check-in", done: false, color: "text-emerald-400" },
              ].map((task, i) => (
                <div key={i} className={`flex items-center gap-3 py-2 ${i < 3 ? "border-b border-border/50" : ""}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${task.done ? "bg-violet-500 border-violet-500" : "border-border"}`}>
                    {task.done && <svg width="8" height="6" viewBox="0 0 10 8"><path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>}
                  </div>
                  <span className={`text-xs flex-1 ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.label}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Explore Features</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction delay={7} icon={BookOpen} label="Sign Journal" desc="Express your feelings through writing and mood tracking." color={{ bg: "bg-violet-500/10", text: "text-violet-400" }} onClick={() => setActiveTab("journal")} />
          <QuickAction delay={8} icon={Brain} label="AI Companion" desc="Chat with your DHH-trained AI psychologist anytime." color={{ bg: "bg-indigo-500/10", text: "text-indigo-400" }} onClick={() => setActiveTab("ai-companion")} />
          <QuickAction delay={9} icon={BarChart3} label="AI Insights" desc="Deep analysis of your mood trends and patterns." color={{ bg: "bg-teal-500/10", text: "text-teal-400" }} onClick={() => setActiveTab("insights")} />
          <QuickAction delay={10} icon={Users} label="DHH Community" desc="Connect with peers who understand your experience." color={{ bg: "bg-amber-500/10", text: "text-amber-400" }} onClick={() => setActiveTab("community")} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
