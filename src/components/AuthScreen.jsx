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
import {
  signupUser,
  loginUser,
  resendConfirmationEmail,
} from "../services/backendApi";
import { cn } from "../lib/utils";

const particleCount = 24;

const AuthScreen = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authErrorCode, setAuthErrorCode] = useState("");
  const [notice, setNotice] = useState("");
  const [resending, setResending] = useState(false);

  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setAuthErrorCode("");
    setLoading(true);
    try {
      const data =
        mode === "signup"
          ? await signupUser(form.name, form.email, form.password)
          : await loginUser(form.email, form.password);
      onAuthSuccess(data);
    } catch (err) {
      setAuthErrorCode(err.code || "");
      setError(err.message || "Something went wrong. Please try again.");

      if (err.code === "EMAIL_CONFIRMATION_REQUIRED") {
        setMode("login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!form.email) {
      setError("Enter your email first, then resend confirmation.");
      return;
    }

    setResending(true);
    setError("");
    setNotice("");
    try {
      await resendConfirmationEmail(form.email);
      setNotice("Confirmation email sent. Check inbox/spam, then sign in.");
    } catch (err) {
      setError(err.message || "Could not resend confirmation email.");
      setAuthErrorCode(err.code || "");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-background">
      {/* Left — Decorative Panel */}
      <div className="hidden lg:flex flex-1 relative flex-col items-center justify-center p-16 overflow-hidden">
        {/* Animated gradient blobs */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,color-mix(in_srgb,var(--brand-start)_22%,transparent),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,color-mix(in_srgb,var(--brand-end)_18%,transparent),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_10%,color-mix(in_srgb,var(--primary)_12%,transparent),transparent_60%)]" />

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
                "color-mix(in srgb, var(--brand-start) 65%, white)",
                "color-mix(in srgb, var(--brand-end) 65%, white)",
                "color-mix(in srgb, var(--primary) 55%, white)",
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
              "linear-gradient(color-mix(in srgb, var(--border) 70%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--border) 70%, transparent) 1px, transparent 1px)",
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
          <div className="w-20 h-20 rounded-2xl bg-[linear-gradient(135deg,var(--brand-start),var(--brand-end))] flex items-center justify-center mb-8 shadow-2xl">
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
                className="rounded-xl border border-border bg-card/75 backdrop-blur-sm p-3 text-left"
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
            <div className="w-10 h-10 rounded-xl bg-[linear-gradient(135deg,var(--brand-start),var(--brand-end))] flex items-center justify-center">
              <HandMetal size={18} className="text-white" />
            </div>
            <span className="font-display text-2xl font-bold gradient-text">
              SignMind
            </span>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-primary" />
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

                <AnimatePresence>
                  {notice && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="rounded-lg bg-emerald-500/10 border border-emerald-500/25 px-3 py-2 text-sm text-emerald-700"
                    >
                      {notice}
                    </motion.div>
                  )}
                </AnimatePresence>

                {(authErrorCode === "EMAIL_NOT_CONFIRMED" ||
                  authErrorCode === "EMAIL_CONFIRMATION_REQUIRED") && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    disabled={resending || loading}
                    onClick={handleResendConfirmation}
                  >
                    {resending ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />{" "}
                        Sending...
                      </>
                    ) : (
                      "Resend confirmation email"
                    )}
                  </Button>
                )}

                {authErrorCode === "RATE_LIMITED" && mode === "signup" && (
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs text-amber-700">
                    <p>
                      Supabase is limiting confirmation emails right now. If you
                      already created this account, switch to sign in.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login");
                        setError("");
                        setNotice(
                          "Try signing in now. If email is still unconfirmed, resend confirmation once the cooldown passes.",
                        );
                      }}
                      className="mt-2 font-medium text-amber-800 hover:text-amber-900 underline underline-offset-2"
                    >
                      Switch to sign in
                    </button>
                  </div>
                )}

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
                setNotice("");
                setAuthErrorCode("");
              }}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
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
