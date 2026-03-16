import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Heart, BarChart3, Users, TrendingUp, ArrowUpRight, Smile, Zap, Eye, ShieldCheck } from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  })
};

const MoodBar = ({ day, value, color }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
    <div style={{ width: '100%', height: '72px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: `${value}%` }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          width: '100%', maxWidth: '28px',
          background: color,
          borderRadius: '6px 6px 3px 3px',
          opacity: 0.85
        }}
      />
    </div>
    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{day}</span>
  </div>
);

const Tooltip = ({ title, children }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            className="tooltip"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            <p className="tooltip-title">{title.name}</p>
            <p className="tooltip-desc">{title.desc}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const QuickActionCard = ({ icon: Icon, label, desc, color, colorDim, onClick, index, tooltipInfo }) => (
  <motion.div
    custom={index}
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    whileHover={{ y: -3, scale: 1.01 }}
    onClick={onClick}
    style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
      padding: '20px', cursor: 'pointer', position: 'relative', overflow: 'hidden',
      transition: 'border-color 0.2s ease'
    }}
    onHoverStart={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
    onHoverEnd={e => e.currentTarget.style.borderColor = 'var(--border)'}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
        background: colorDim, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={20} style={{ color }} />
      </div>

      {tooltipInfo && (
        <Tooltip title={tooltipInfo}>
          <div style={{
            width: '22px', height: '22px', borderRadius: '50%',
            border: '1px solid var(--border-strong)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'help'
          }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>?</span>
          </div>
        </Tooltip>
      )}
    </div>

    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>{label}</h3>
    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{desc}</p>

    <div style={{ position: 'absolute', bottom: '-30px', right: '-30px', width: '100px', height: '100px', background: colorDim, borderRadius: '50%', filter: 'blur(30px)' }} />
  </motion.div>
);

const Dashboard = ({ setActiveTab }) => {
  const weekMoods = [
    { day: 'Mo', value: 60, color: 'var(--accent-amber)' },
    { day: 'Tu', value: 45, color: 'var(--accent-rose)' },
    { day: 'We', value: 75, color: 'var(--brand)' },
    { day: 'Th', value: 80, color: 'var(--accent-teal)' },
    { day: 'Fr', value: 55, color: 'var(--accent-amber)' },
    { day: 'Sa', value: 90, color: 'var(--accent-emerald)' },
    { day: 'Su', value: 70, color: 'var(--accent-teal)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px' }}>

      {/* Hero Banner */}
      <motion.div
        custom={0} variants={cardVariants} initial="hidden" animate="visible"
        style={{
          background: 'linear-gradient(120deg, var(--bg-card) 0%, rgba(91, 141, 238, 0.08) 100%)',
          border: '1px solid var(--border-brand)', borderRadius: 'var(--radius-xl)',
          padding: '32px 36px', position: 'relative', overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '60%' }}>
          <div className="badge" style={{ background: 'var(--brand-dim)', color: 'var(--brand)', marginBottom: '16px', border: '1px solid var(--border-brand)' }}>
            <Zap size={10} /> Daily Check-in
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.04em', marginBottom: '8px', lineHeight: 1.2 }}>
            Good evening, Alex 👋<br />
            <span className="gradient-text-brand">How are you feeling today?</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '24px', fontSize: '0.95rem' }}>
            Yesterday's session showed <strong style={{ color: 'var(--accent-emerald)' }}>+18% positive expression</strong>.
            Your AI companion has a new insight ready.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" onClick={() => setActiveTab('journal')}>
              <Video size={16} /> Start Sign Journal
            </button>
            <button className="btn btn-ghost" onClick={() => setActiveTab('insights')}>
              View AI Insights <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* Decorative */}
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '280px', height: '280px', background: 'radial-gradient(circle, rgba(91,141,238,0.15) 0%, transparent 70%)', borderRadius: '50%', zIndex: 1 }} />
        <div style={{ position: 'absolute', right: '80px', bottom: '-20px', width: '180px', height: '180px', background: 'radial-gradient(circle, rgba(124,92,252,0.1) 0%, transparent 70%)', borderRadius: '50%', zIndex: 1 }} />
      </motion.div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { value: '14', label: 'Day Streak', color: 'var(--accent-amber)', tooltipName: 'Current Streak', tooltipDesc: 'Consecutive days you have completed at least one journaling or therapy session. Keep it going!' },
          { value: '87%', label: 'Mood Stability', color: 'var(--accent-emerald)', tooltipName: 'Mood Stability Score', tooltipDesc: 'A weekly aggregate of your facial expression data analyzed by our AI. Higher = more balanced emotional range.' },
          { value: '28', label: 'Sessions Total', color: 'var(--brand)', tooltipName: 'Total Sessions', tooltipDesc: 'Total number of sign journal recordings and therapy exercise sessions completed since onboarding.' },
          { value: '3', label: 'Insights Today', color: 'var(--accent-violet)', tooltipName: 'AI Insights', tooltipDesc: 'New personalized recommendations from your AI companion based on your recent session data.' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            custom={i + 1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}
          >
            <Tooltip title={{ name: stat.tooltipName, desc: stat.tooltipDesc }}>
              <div style={{ cursor: 'help' }}>
                <p className="value" style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.04em', color: stat.color }}>{stat.value}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{stat.label}</p>
              </div>
            </Tooltip>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        {/* Weekly Mood Chart */}
        <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Weekly Expression Moods</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>From AI facial analysis across sessions</p>
            </div>
            <span className="badge" style={{ background: 'var(--accent-emerald-dim)', color: 'var(--accent-emerald)', border: '1px solid var(--accent-emerald-glow)' }}>
              <TrendingUp size={10} /> +12%
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '88px' }}>
            {weekMoods.map((m, i) => <MoodBar key={i} {...m} />)}
          </div>
        </motion.div>

        {/* Today's Plan */}
        <motion.div custom={6} variants={cardVariants} initial="hidden" animate="visible"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Today's Plan</h3>
          {[
            { label: 'Sign Journal Entry', done: true, color: 'var(--brand)' },
            { label: 'Color Breathing (5 min)', done: false, color: 'var(--accent-teal)' },
            { label: 'Review AI Insights', done: false, color: 'var(--accent-violet)' },
          ].map((task, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none'
            }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                background: task.done ? task.color : 'transparent',
                border: `2px solid ${task.done ? task.color : 'var(--border-strong)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {task.done && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
              </div>
              <span style={{ fontSize: '0.875rem', color: task.done ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: task.done ? 'line-through' : 'none', flex: 1 }}>
                {task.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Eye size={16} /> Explore Features
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <QuickActionCard index={7} icon={Video} label="Sign Journal" desc="Record your feelings in ASL with AI expression tracking." color="var(--brand)" colorDim="var(--brand-dim)" onClick={() => setActiveTab('journal')}
            tooltipInfo={{ name: 'Sign Journal', desc: 'Use your camera to journal in ASL. AI will track facial expressions and log your emotional arc automatically.' }} />
          <QuickActionCard index={8} icon={Heart} label="Visual Therapy" desc="Breathing, grounding, and ASL affirmation exercises." color="var(--accent-rose)" colorDim="var(--accent-rose-dim)" onClick={() => setActiveTab('therapy')}
            tooltipInfo={{ name: 'Visual Therapy', desc: 'Guided therapy modules that are 100% visual — no audio track ever plays. Designed for DHH accessibility from the ground up.' }} />
          <QuickActionCard index={9} icon={BarChart3} label="AI Insights" desc="Deep analysis of expression trends and mood arcs." color="var(--accent-violet)" colorDim="var(--accent-violet-dim)" onClick={() => setActiveTab('insights')}
            tooltipInfo={{ name: 'AI Insights', desc: 'Your AI companion surfaces patterns in your emotions over time, giving personalized recommendations each week.' }} />
          <QuickActionCard index={10} icon={Users} label="DHH Community" desc="Peer support and resources, just for DHH users." color="var(--accent-teal)" colorDim="var(--accent-teal-dim)" onClick={() => setActiveTab('community')}
            tooltipInfo={{ name: 'DHH Community', desc: 'A moderated, private space for Deaf and Hard-of-Hearing individuals to connect, share stories, and find peer support.' }} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
