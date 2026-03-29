import React, { useState } from "react";
import {
  User,
  Moon,
  Sun,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  Palette,
  Globe,
  Lock,
  CreditCard,
  HelpCircle,
  Mail,
  Save,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "../lib/utils";
import { updateProfile, updatePassword } from "../services/backendApi";

const THEMES = [
  {
    id: "midnight",
    name: "Midnight Obsidian",
    color: "#94d8c0",
    desc: "Sage & Deep Charcoal",
  },
  {
    id: "emerald",
    name: "Emerald Glade",
    color: "#5eead4",
    desc: "Teal & Dark Forest",
  },
  {
    id: "amber",
    name: "Amber Harvest",
    color: "#fcd34d",
    desc: "Ochre & Warm Black",
  },
  {
    id: "sunset",
    name: "Dusty Sunset",
    color: "#fda4af",
    desc: "Rose & Earthy Dark",
  },
];

export default function Settings({
  token,
  currentUser,
  onLogout,
  theme,
  setTheme,
}) {
  const [editing, setEditing] = useState(null); // 'profile' | 'password' | null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await updateProfile(token, profileForm.name, profileForm.email);
      setSuccess("Profile updated successfully!");
      setEditing(null);
      // We rely on App.jsx syncUser to update the UI globally
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setError("Passwords do not match");
    }
    setLoading(true);
    setError("");
    try {
      await updatePassword(
        token,
        passwordForm.oldPassword,
        passwordForm.newPassword,
      );
      setSuccess("Password updated successfully!");
      setEditing(null);
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 lg:pb-0 relative">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-display font-bold text-foreground">
          Settings
        </h2>
        <p className="text-muted-foreground">
          Manage your account and app preferences
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-in fade-in slide-in-from-top-2">
          {success}
        </div>
      )}

      {/* Profile Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-2">
          Account Security
        </h3>

        <div className="glass rounded-3xl overflow-hidden border border-border divide-y divide-border">
          {/* Name/Email Edit */}
          <div className="p-5">
            {editing === "profile" ? (
              <form
                onSubmit={handleUpdateProfile}
                className="space-y-4 animate-in fade-in duration-300"
              >
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, name: e.target.value })
                    }
                    className="w-full h-12 bg-secondary/50 border border-border rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground ml-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, email: e.target.value })
                    }
                    className="w-full h-12 bg-secondary/50 border border-border rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    disabled={loading}
                    type="submit"
                    className="flex-1 h-11 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(null);
                      setError("");
                    }}
                    className="w-11 h-11 bg-secondary text-muted-foreground rounded-xl flex items-center justify-center hover:bg-secondary/80 transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setEditing("profile")}
                className="w-full flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
                    <User size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">
                      {currentUser?.name || "Global User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {currentUser?.email || "user@signmind.com"}
                    </p>
                  </div>
                </div>
                <div className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Edit Profile
                </div>
              </button>
            )}
          </div>

          {/* Password Edit */}
          <div className="p-5">
            {editing === "password" ? (
              <form
                onSubmit={handleUpdatePassword}
                className="space-y-4 animate-in fade-in duration-300"
              >
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground ml-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.oldPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        oldPassword: e.target.value,
                      })
                    }
                    className="w-full h-12 bg-secondary/50 border border-border rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground ml-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full h-12 bg-secondary/50 border border-border rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground ml-1">
                      Confirm
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full h-12 bg-secondary/50 border border-border rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    disabled={loading}
                    type="submit"
                    className="flex-1 h-11 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Lock size={16} />
                    )}
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(null);
                      setError("");
                    }}
                    className="w-11 h-11 bg-secondary text-muted-foreground rounded-xl flex items-center justify-center hover:bg-secondary/80"
                  >
                    <X size={18} />
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setEditing("password")}
                className="w-full flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                    <Shield size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">
                      Password & Security
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Change your password and manage sessions
                    </p>
                  </div>
                </div>
                <div className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Change
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Theme Picker */}
      <div className="glass rounded-3xl p-6 border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Palette size={20} />
          </div>
          <div>
            <h3 className="font-bold text-foreground">App Theme</h3>
            <p className="text-xs text-muted-foreground">
              Choose your preferred visual style
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                "p-4 rounded-2xl border transition-all text-left flex items-center justify-between group",
                theme === t.id
                  ? "bg-primary/5 border-primary ring-1 ring-primary/50"
                  : "bg-secondary/50 border-border hover:border-primary/30",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl shadow-lg transition-transform group-hover:scale-110"
                  style={{ backgroundColor: t.color }}
                />
                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    {t.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                </div>
              </div>
              {theme === t.id && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-background" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="pt-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold hover:bg-rose-500 hover:text-white transition-all group"
        >
          <LogOut
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Log Out of SignMind
        </button>
        <p className="text-center text-[10px] text-muted-foreground mt-4">
          SignMind Wellness Platform v2.0 • Built with care for the DHH
          community
        </p>
      </div>
    </div>
  );
}
