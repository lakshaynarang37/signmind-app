import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  HandMetal,
  Loader2,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { signupUser, loginUser } from "../services/backendApi";
import { cn } from "../lib/utils";

const particleCount = 24;

const AuthScreen = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data =
        mode === "signup"
          ? await signupUser(form.name, form.email, form.password)
          : await loginUser(form.email, form.password);
      onAuthSuccess(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-background">
      {/* Left — Decorative Panel */}
      <div className="hidden lg:flex flex-1 relative flex-col items-center justify-center p-16 overflow-hidden">
        {/* Animated gradient blobs */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,hsl(252_85%_68%/0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,hsl(174_72%_47%/0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_10%,hsl(344_82%_60%/0.08),transparent_60%)]" />

        {/* Floating particles */}
        {Array.from({ length: particleCount }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 1,
              height: Math.random() * 4 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: [
                "hsl(252 85% 68%/0.5)",
                "hsl(174 72% 47%/0.5)",
                "hsl(38 92% 50%/0.4)",
              ][i % 3],
            }}
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}

        {/* Grid lines */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--border)/0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)/0.3) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Logo mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative z-10 flex flex-col items-center text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center mb-8 shadow-2xl glow-violet animate-pulse-glow">
            <HandMetal size={36} className="text-white" />
          </div>
          <h1 className="font-display text-5xl font-bold gradient-text mb-4">
            SignMind
          </h1>
          <p className="text-lg text-muted-foreground max-w-sm leading-relaxed">
            Mental wellness built with the{" "}
            <span className="text-foreground font-medium">
              Deaf & Hard-of-Hearing
            </span>{" "}
            community in mind. Visual-first tools, respectful support, and
            privacy by default.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-sm">
            {[
              {
                icon: "🧠",
                label: "Support Chat",
                desc: "A calm place to check in",
              },
              {
                icon: "🌬️",
                label: "Visual Therapy",
                desc: "Silent guided exercises",
              },
              {
                icon: "📓",
                label: "Sign Journal",
                desc: "Write and track your days",
              },
              {
                icon: "🤝",
                label: "DHH Community",
                desc: "Shared stories and support",
              },
            ].map((f) => (
              <motion.div
                key={f.label}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-3 text-left"
              >
                <div className="text-2xl mb-1">{f.icon}</div>
                <div className="text-sm font-semibold text-foreground">
                  {f.label}
                </div>
                <div className="text-xs text-muted-foreground">{f.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:max-w-[480px] w-full">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center">
              <HandMetal size={18} className="text-white" />
            </div>
            <span className="font-display text-2xl font-bold gradient-text">
              SignMind
            </span>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-violet-400" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                Welcome
              </span>
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground">
              {mode === "login" ? "Sign back in" : "Create account"}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {mode === "login"
                ? "Pick up where you left off."
                : "Create your account and start at your own pace."}
            </p>
          </div>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  {mode === "signup" && (
                    <motion.div
                      key="name"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1.5 overflow-hidden"
                    >
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                          id="name"
                          placeholder="e.g. Alex Rivera"
                          className="pl-9"
                          value={form.name}
                          onChange={(e) => update("name", e.target.value)}
                          required={mode === "signup"}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-9"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id="password"
                      type={showPass ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      className="pl-9 pr-10"
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="rounded-lg bg-destructive/10 border border-destructive/25 px-3 py-2 text-sm text-destructive"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  variant="brand"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      {mode === "login" ? "Sign In" : "Create Account"}
                      <ArrowRight size={16} />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              onClick={() => {
                setMode((m) => (m === "login" ? "signup" : "login"));
                setError("");
              }}
              className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              {mode === "login" ? "Sign up free" : "Sign in"}
            </button>
          </p>

          <p className="text-center text-xs text-muted-foreground/50 mt-4">
            🔒 Your data is private by default. We never sell information.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthScreen;
