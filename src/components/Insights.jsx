import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, Minus, ChevronRight, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  })
};

const EmotionArcs = () => {
  const emotions = [
    { name: 'Anxiety', values: [80, 75, 60, 55, 40, 38, 35], trend: 'down', color: 'var(--accent-rose)' },
    { name: 'Calm', values: [20, 25, 40, 45, 60, 62, 65], trend: 'up', color: 'var(--accent-teal)' },
    { name: 'Sadness', values: [50, 45, 50, 40, 35, 38, 30], trend: 'down', color: 'var(--brand)' },
    { name: 'Happiness', values: [30, 32, 40, 50, 55, 60, 68], trend: 'up', color: 'var(--accent-emerald)' },
  ];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div style={{ position: 'relative', height: '140px', marginTop: '12px' }}>
      <svg width="100%" height="140" viewBox="0 0 700 140" preserveAspectRatio="none">
        <defs>
          {emotions.map(e => (
            <linearGradient key={e.name} id={`grad-${e.name}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={e.color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={e.color} stopOpacity="1" />
            </linearGradient>
          ))}
        </defs>
        {emotions.map((e) => {
          const pts = e.values.map((v, i) => {
            const x = (i / 6) * 700;
            const y = 130 - (v / 100) * 120;
            return `${x},${y}`;
          }).join(' ');
          const areaPoints = e.values.map((v, i) => {
            const x = (i / 6) * 700;
            const y = 130 - (v / 100) * 120;
            return `${x},${y}`;
          });
          const areaPath = `M0,130 L${areaPoints.join(' L')} L700,130 Z`;

          return (
            <g key={e.name}>
              <path d={areaPath} fill={e.color} fillOpacity="0.03" />
              <polyline points={pts} fill="none" stroke={e.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
            </g>
          );
        })}
        {/* X-axis labels */}
        {days.map((d, i) => (
          <text key={d} x={(i / 6) * 700} y="138" fill="var(--text-muted)" fontSize="10" textAnchor="middle">{d}</text>
        ))}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
        {emotions.map(e => (
          <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '20px', height: '2px', background: e.color, borderRadius: '1px' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{e.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Insights = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const recommendations = [
    {
      type: 'positive',
      icon: CheckCircle,
      color: 'var(--accent-emerald)',
      colorDim: 'var(--accent-emerald-dim)',
      title: 'Anxiety Declining Steadily',
      body: 'Your sign journal sessions show a 43% decrease in anxiety expression markers over 7 days. Evening sessions (7–9 PM) correlate with lowest tension readings — consider scheduling future sessions then.'
    },
    {
      type: 'warning',
      icon: AlertCircle,
      color: 'var(--accent-amber)',
      colorDim: 'var(--accent-amber-dim)',
      title: 'Mood Dip on Wednesdays',
      body: "We've detected a consistent dip in positive expressions every Wednesday. This may correlate with a predictable stressor. Consider scheduling a short Visual Therapy session on Wednesday mornings."
    },
    {
      type: 'insight',
      icon: Lightbulb,
      color: 'var(--brand)',
      colorDim: 'var(--brand-dim)',
      title: 'ASL Affirmations High Impact',
      body: 'Sessions where you viewed the ASL Affirmation Loop were followed by 28% longer calm expression windows on average. This module appears to be your highest-impact therapy exercise.'
    },
  ];

  const emotionSummary = [
    { name: 'Anxiety', change: -43, trend: 'down', color: 'var(--accent-emerald)', period: 'vs last week' },
    { name: 'Calm', change: +31, trend: 'up', color: 'var(--accent-teal)', period: 'vs last week' },
    { name: 'Sadness', change: -18, trend: 'down', color: 'var(--accent-emerald)', period: 'vs last week' },
    { name: 'Happiness', change: +22, trend: 'up', color: 'var(--accent-emerald)', period: 'vs last week' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="badge" style={{ background: 'var(--brand-dim)', color: 'var(--brand)', marginBottom: '8px', border: '1px solid var(--border-brand)' }}>
            <Brain size={10} /> AI-Powered
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.03em' }}>Expression Insights</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Deep analysis of your emotion patterns across all sessions</p>
        </div>

        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '4px' }}>
          {['week', 'month', 'all'].map(p => (
            <button key={p} onClick={() => setSelectedPeriod(p)}
              style={{
                padding: '6px 14px', borderRadius: 'var(--radius-sm)', border: 'none',
                background: selectedPeriod === p ? 'var(--brand)' : 'transparent',
                color: selectedPeriod === p ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: selectedPeriod === p ? 600 : 400,
                transition: 'all 0.15s ease'
              }}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Emotion Change Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        {emotionSummary.map((e, i) => {
          const TrendIcon = e.trend === 'up' ? TrendingUp : e.trend === 'down' ? TrendingDown : Minus;
          return (
            <motion.div
              key={e.name}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px' }}
            >
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{e.name}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <p style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: e.color, letterSpacing: '-0.04em' }}>
                  {e.change > 0 ? '+' : ''}{e.change}%
                </p>
                <TrendIcon size={18} style={{ color: e.color }} />
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>{e.period}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Chart */}
      <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>7-Day Emotion Arcs</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Derived from facial expression AI, session by session</p>
          </div>
          <span className="badge" style={{ background: 'var(--accent-emerald-dim)', color: 'var(--accent-emerald)', border: '1px solid var(--accent-emerald-glow)' }}>
            <TrendingUp size={10} /> Positive Trend
          </span>
        </div>
        <EmotionArcs />
      </motion.div>

      {/* AI Recommendations */}
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '14px', color: 'var(--text-secondary)' }}>AI Recommendations</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recommendations.map((rec, i) => {
            const Icon = rec.icon;
            return (
              <motion.div
                key={i}
                custom={i + 5}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ x: 4 }}
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                  padding: '20px', display: 'flex', gap: '16px', cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                  background: rec.colorDim, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Icon size={20} color={rec.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '6px' }}>{rec.title}</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{rec.body}</p>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--text-muted)', flexShrink: 0, alignSelf: 'center' }} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Insights;
