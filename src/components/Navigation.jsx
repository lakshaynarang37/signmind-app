import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Video, Layers, BarChart3, Users, AlertTriangle, ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    label: 'Overview',
    tooltip: 'Your personalized overview — mood trends, streaks, quick-start cards, and daily insights all in one place.'
  },
  {
    id: 'journal',
    icon: Video,
    label: 'Sign Journal',
    tooltip: 'Record your thoughts in American Sign Language. AI tracks your expressions and emotion arcs — no typing needed.'
  },
  {
    id: 'therapy',
    icon: Layers,
    label: 'Visual Therapy',
    tooltip: 'Guided, fully visual therapy exercises: breathing animation, grounding patterns, and ASL affirmations. Zero audio required.'
  },
  {
    id: 'insights',
    icon: BarChart3,
    label: 'AI Insights',
    tooltip: 'Deep AI analysis of your mood patterns, emotion trends across sessions, and personalized mental health recommendations.'
  },
  {
    id: 'community',
    icon: Users,
    label: 'DHH Community',
    tooltip: 'A private, moderated community for DHH users. Share experiences, get peer support, and access DHH-curated resources.'
  },
];

const NavItem = ({ item, isActive, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const Icon = item.icon;

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        onClick={onClick}
        style={{
          width: '100%',
          padding: '11px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          background: isActive ? 'var(--brand-dim)' : 'transparent',
          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          textAlign: 'left',
          fontSize: '0.875rem',
          fontWeight: isActive ? 600 : 400,
          position: 'relative',
          userSelect: 'none'
        }}
      >
        {isActive && (
          <motion.div
            layoutId="nav-pill"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'var(--radius-md)',
              background: 'var(--brand-dim)',
              border: '1px solid var(--border-brand)',
              zIndex: 0
            }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          />
        )}
        <div style={{ position: 'relative', zIndex: 1, color: isActive ? 'var(--brand)' : 'var(--text-muted)', flexShrink: 0 }}>
          <Icon size={18} />
        </div>
        <span style={{ position: 'relative', zIndex: 1, flex: 1 }}>{item.label}</span>
        {isActive && (
          <ChevronRight size={14} style={{ position: 'relative', zIndex: 1, color: 'var(--brand)', opacity: 0.6 }} />
        )}
      </button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="nav-tooltip"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
          >
            <p className="tooltip-title">{item.label}</p>
            <p className="tooltip-desc">{item.tooltip}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Navigation = ({ activeTab, setActiveTab, onCrisisClick }) => {
  const [crisisHover, setCrisisHover] = useState(false);

  return (
    <nav style={{
      width: 'var(--nav-width)',
      minWidth: 'var(--nav-width)',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid var(--border)',
      background: 'rgba(6, 8, 16, 0.9)',
      padding: '0',
      zIndex: 50,
      position: 'relative'
    }}>
      {/* Logo */}
      <div style={{
        height: 'var(--header-h)',
        minHeight: 'var(--header-h)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        borderBottom: '1px solid var(--border)',
        gap: '10px'
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--brand), var(--accent-violet))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, boxShadow: 'var(--shadow-brand)'
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2C5.24 2 3 4.24 3 7c0 1.65.8 3.1 2.04 4.01L4.5 14h7l-.54-2.99A4.99 4.99 0 0 0 13 7c0-2.76-2.24-5-5-5z" fill="white" opacity="0.9"/>
            <path d="M6 7.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm5 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" fill="white"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'Outfit, sans-serif' }}>SignMind</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.04em', marginTop: '1px' }}>BETA v0.4</div>
        </div>
      </div>

      {/* Nav Items */}
      <div style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
        <p style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 14px 4px', marginBottom: '4px' }}>
          Features
        </p>

        {NAV_ITEMS.map(item => (
          <NavItem
            key={item.id}
            item={item}
            isActive={activeTab === item.id}
            onClick={() => setActiveTab(item.id)}
          />
        ))}

        <div className="divider" style={{ margin: '16px 0 8px' }} />

        <p style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 14px 8px' }}>
          Resources
        </p>

        {[
          { label: 'DHH Research Hub', badge: 'New' },
          { label: 'App Settings' },
        ].map((item, i) => (
          <button key={i} style={{
            width: '100%', padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderRadius: 'var(--radius-md)', border: 'none', background: 'transparent',
            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 400
          }}>
            {item.label}
            {item.badge && (
              <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'var(--brand)', color: '#fff', padding: '2px 6px', borderRadius: 'var(--radius-full)' }}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Crisis Button */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
        <div style={{ position: 'relative' }}
          onMouseEnter={() => setCrisisHover(true)}
          onMouseLeave={() => setCrisisHover(false)}
        >
          <button
            onClick={onCrisisClick}
            className="pulse-red"
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              background: 'var(--accent-rose-dim)',
              color: 'var(--danger)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontWeight: 600,
              fontSize: '0.875rem',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
          >
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'var(--danger)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', flexShrink: 0, boxShadow: 'var(--shadow-danger)'
            }}>
              <AlertTriangle size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div>Silent Crisis Help</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(244,63,94,0.6)', fontWeight: 400, marginTop: '1px' }}>No call. Video only.</div>
            </div>
          </button>

          <AnimatePresence>
            {crisisHover && (
              <motion.div
                className="nav-tooltip"
                style={{ bottom: 'calc(100% + 10px)', top: 'auto', transform: 'translateY(0)', left: 'calc(100% + 14px)', top: '50%', transform: 'translateY(-50%)' }}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
              >
                <p className="tooltip-title" style={{ color: 'var(--danger)' }}>1-Tap Silent Crisis</p>
                <p className="tooltip-desc">
                  Instantly connects you via video to a trained ASL counselor. No phone call, no voice, no waiting on hold. Designed for DHH users only.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User profile mini */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          marginTop: '12px', padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-glass)',
          border: '1px solid var(--border)',
          cursor: 'pointer'
        }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--brand), var(--accent-violet))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0
          }}>AJ</div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Alex Johnson</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Member since 2024</div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
