import React, { useEffect, useState } from "react";
import Navigation from "./components/Navigation";
import Dashboard from "./components/Dashboard";
import Journaling from "./components/Journaling";
import AICompanion from "./components/AICompanion";
import Insights from "./components/Insights";
import Community from "./components/Community";
import CrisisModal from "./components/CrisisModal";
import ResearchHub from "./components/ResearchHub";
import Settings from "./components/Settings";
import AuthScreen from "./components/AuthScreen";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard, BookOpen, Brain, BarChart3, Users, FlaskConical,
  Settings as SettingsIcon, AlertTriangle, HandMetal, LogOut, Menu, X
} from "lucide-react";
import { getCurrentUser, logoutUser, getSettings } from "./services/backendApi";
import { cn } from "./lib/utils";

const MOBILE_TABS = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "journal", label: "Journal", icon: BookOpen },
  { id: "ai-companion", label: "AI", icon: Brain },
  { id: "insights", label: "Insights", icon: BarChart3 },
  { id: "community", label: "Community", icon: Users },
];

const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
};

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("signmind_theme") || "midnight");
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("signmind_token") || "");
  const [currentUser, setCurrentUser] = useState(() => {
    const raw = localStorage.getItem("signmind_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("signmind_theme", theme);
  }, [theme]);

  useEffect(() => {
    let mounted = true;
    const syncUser = async () => {
      if (!authToken) return;
      try {
        const [userData] = await Promise.all([
          getCurrentUser(authToken),
          getSettings(authToken).catch(() => null),
        ]);
        if (mounted && userData?.user) {
          setCurrentUser(userData.user);
          localStorage.setItem("signmind_user", JSON.stringify(userData.user));
        }
      } catch {
        if (mounted) {
          localStorage.removeItem("signmind_token");
          localStorage.removeItem("signmind_user");
          setAuthToken("");
          setCurrentUser(null);
        }
      }
    };
    syncUser();
    return () => { mounted = false; };
  }, [authToken]);

  const onAuthSuccess = ({ token, user }) => {
    localStorage.setItem("signmind_token", token);
    localStorage.setItem("signmind_user", JSON.stringify(user));
    setAuthToken(token);
    setCurrentUser(user);
  };

  const onLogout = async () => {
    try { if (authToken) await logoutUser(authToken); } catch { }
    localStorage.removeItem("signmind_token");
    localStorage.removeItem("signmind_user");
    setAuthToken("");
    setCurrentUser(null);
  };

  const renderContent = () => {
    const props = { token: authToken, currentUser, setActiveTab };
    switch (activeTab) {
      case "dashboard": return <Dashboard {...props} />;
      case "journal": return <Journaling {...props} />;
      case "ai-companion": return <AICompanion {...props} />;
      case "insights": return <Insights {...props} />;
      case "community": return <Community {...props} />;
      case "research": return <ResearchHub {...props} />;
      case "settings": return <Settings {...props} onLogout={onLogout} theme={theme} setTheme={setTheme} />;
      default: return <Dashboard {...props} />;
    }
  };

  if (!authToken) return <AuthScreen onAuthSuccess={onAuthSuccess} />;

  const PAGE_LABELS = {
    dashboard: "Overview", journal: "Sign Journal", "ai-companion": "AI Companion",
    insights: "AI Insights", community: "DHH Community", research: "Research Hub", settings: "Settings"
  };

  return (
    <div className="flex w-full h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onCrisisClick={() => setIsCrisisModalOpen(true)}
          currentUser={currentUser}
        />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-card/40 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-accent transition-colors"
            >
              <Menu size={18} />
            </button>
            <div>
              <h1 className="font-display text-base font-semibold">{PAGE_LABELS[activeTab] || "SignMind"}</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live AI badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">AI Active</span>
            </div>

            {/* Crisis mobile button */}
            <button
              onClick={() => setIsCrisisModalOpen(true)}
              className="lg:hidden p-2 rounded-lg text-rose-400 border border-rose-500/25 bg-rose-500/5 hover:bg-rose-500/10 transition-colors"
            >
              <AlertTriangle size={15} />
            </button>

            {/* Avatar */}
            <button
              onClick={() => setActiveTab("settings")}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold hover:ring-2 hover:ring-violet-500/40 transition-all"
            >
              {(currentUser?.name || "U").slice(0, 2).toUpperCase()}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={pageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="p-4 lg:p-6 max-w-6xl"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Nav */}
        <div className="lg:hidden flex-shrink-0 border-t border-border bg-card/80 backdrop-blur-xl">
          <div className="flex items-center h-16 px-2">
            {MOBILE_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all duration-200",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  <div className={cn(
                    "w-9 h-7 flex items-center justify-center rounded-lg transition-all duration-200",
                    active ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white" : ""
                  )}>
                    <Icon size={16} />
                  </div>
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
              onClick={() => setMobileNavOpen(false)}
            />
            <motion.div
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50"
            >
              <Navigation
                activeTab={activeTab}
                setActiveTab={(t) => { setActiveTab(t); setMobileNavOpen(false); }}
                onCrisisClick={() => { setIsCrisisModalOpen(true); setMobileNavOpen(false); }}
                currentUser={currentUser}
              />
              <button
                onClick={() => setMobileNavOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Crisis Modal */}
      <AnimatePresence>
        {isCrisisModalOpen && (
          <CrisisModal 
            isOpen={isCrisisModalOpen} 
            onClose={() => setIsCrisisModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
