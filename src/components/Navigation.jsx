import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  BarChart3,
  Users,
  FlaskConical,
  Settings,
  AlertTriangle,
  HandMetal,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "../lib/utils";

const NAV_ITEMS = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "journal", label: "Journal", icon: BookOpen },
  { id: "ai-companion", label: "Support Chat", icon: Brain },
  { id: "insights", label: "Insights", icon: BarChart3 },
  { id: "community", label: "Community", icon: Users },
  { id: "research", label: "Research", icon: FlaskConical },
];

const NavItem = ({ item, active, onClick }) => {
  const Icon = item.icon;
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent",
      )}
    >
      {/* Active indicator pill */}
      {active && (
        <motion.div
          layoutId="nav-active"
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/20 to-indigo-600/10 border border-violet-500/30"
          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
        />
      )}

      {/* Icon container */}
      <div
        className={cn(
          "relative z-10 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200",
          active
            ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25"
            : "text-muted-foreground group-hover:text-foreground",
        )}
      >
        <Icon size={16} />
      </div>

      <span className="relative z-10 flex-1 text-left">{item.label}</span>

      {active && (
        <ChevronRight
          size={14}
          className="relative z-10 text-violet-400 opacity-60"
        />
      )}

      {/* Companion badge */}
      {item.id === "ai-companion" && !active && (
        <span className="relative z-10 text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20 font-semibold">
          Chat
        </span>
      )}
    </motion.button>
  );
};

const Navigation = ({
  activeTab,
  setActiveTab,
  onCrisisClick,
  currentUser,
}) => {
  const initials = (currentUser?.name || "U").slice(0, 2).toUpperCase();

  return (
    <div className="w-[220px] min-w-[220px] h-screen flex flex-col border-r border-border bg-card/40 backdrop-blur-xl">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg glow-violet">
            <HandMetal size={17} className="text-white" />
          </div>
          <div>
            <span className="font-display text-base font-bold gradient-text">
              SignMind
            </span>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
              Wellness Platform
            </p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest px-3 mb-2">
          Navigation
        </p>
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            active={activeTab === item.id}
            onClick={() => setActiveTab(item.id)}
          />
        ))}

        {/* Settings */}
        <div className="mt-2 pt-2 border-t border-border">
          <NavItem
            item={{ id: "settings", label: "Settings", icon: Settings }}
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          />
        </div>
      </nav>

      {/* Crisis Button */}
      <div className="px-3 pb-3">
        <button
          onClick={onCrisisClick}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-rose-500/25 bg-rose-500/5 text-rose-400 text-sm font-medium hover:bg-rose-500/10 hover:border-rose-500/40 transition-all duration-200 group"
        >
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors">
            <AlertTriangle size={14} />
          </div>
          <div className="text-left">
            <div className="text-xs font-semibold">Crisis Support</div>
            <div className="text-[10px] text-rose-400/60">
              Silent & text-based help
            </div>
          </div>
        </button>
      </div>

      {/* User */}
      <div className="px-3 pb-4 border-t border-border pt-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {currentUser?.name || "User"}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {currentUser?.email || ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { NAV_ITEMS };
export default Navigation;
