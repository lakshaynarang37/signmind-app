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
  { id: "journal", label: "Mood Journal", icon: BookOpen },
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
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent",
      )}
    >
      {/* Active indicator pill */}
      {active && (
        <motion.div
          layoutId="nav-active"
          className="absolute inset-0 rounded-xl bg-[linear-gradient(135deg,color-mix(in_srgb,var(--brand-start)_16%,white),color-mix(in_srgb,var(--brand-end)_10%,white))] border border-primary/25"
          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
        />
      )}

      {/* Icon container */}
      <div
        className={cn(
          "relative z-10 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200",
          active
            ? "bg-[linear-gradient(135deg,var(--brand-start),var(--brand-end))] text-white shadow-sm"
            : "text-muted-foreground group-hover:text-foreground",
        )}
      >
        <Icon size={16} />
      </div>

      <span className="relative z-10 flex-1 text-left">{item.label}</span>

      {active && (
        <ChevronRight
          size={14}
          className="relative z-10 text-primary opacity-80"
        />
      )}

      {/* Companion badge */}
      {item.id === "ai-companion" && !active && (
        <span className="relative z-10 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold">
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
    <div className="w-[220px] min-w-[220px] h-screen flex flex-col border-r border-border bg-card/85 backdrop-blur-xl">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[linear-gradient(135deg,var(--brand-start),var(--brand-end))] flex items-center justify-center shadow-sm">
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
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-700 text-sm font-medium hover:bg-rose-100 hover:border-rose-400 transition-all duration-200 group"
        >
          <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center group-hover:bg-rose-200 transition-colors">
            <AlertTriangle size={14} />
          </div>
          <div className="text-left">
            <div className="text-xs font-semibold">Crisis Support</div>
            <div className="text-[10px] text-rose-700/75">
              Silent & text-based help
            </div>
          </div>
        </button>
      </div>

      {/* User */}
      <div className="px-3 pb-4 border-t border-border pt-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-[linear-gradient(135deg,var(--brand-start),var(--brand-end))] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
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
