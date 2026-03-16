import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RefreshCw, ChevronLeft, Info, Clock, Zap, Wind, Eye } from 'lucide-react';

const MODULES = [
  {
    id: 'breathe',
    icon: Wind,
    title: 'Color Breathing Sync',
    tag: '5 min · Beginner',
    desc: 'A fully visual breathing exercise using expanding color rings. Evidence-based paced breathing designed to reduce anxiety by activating the parasympathetic nervous system.',
    tooltipDesc: 'Shown to reduce acute anxiety in 5–10 minutes. No audio cues — everything is guided by visual motion.',
    color: 'var(--accent-teal)',
    colorDim: 'var(--accent-teal-dim)',
  },
  {
    id: 'ground',
    icon: Eye,
    title: 'Grounding Through Shapes',
    tag: '10 min · Intermediate',
    desc: 'Use gaze-focus on morphing geometric patterns to interrupt dissociation and anxiety spirals. Based on the 5-4-3-2-1 grounding technique, adapted visually for DHH users.',
    tooltipDesc: 'An adaptation of the clinical 5-4-3-2-1 grounding method that typically relies on verbal cues, reimagined as a purely visual interaction.',
    color: 'var(--brand)',
    colorDim: 'var(--brand-dim)',
  },
  {
    id: 'asl',
    icon: Zap,
    title: 'ASL Affirmation Loop',
    tag: '3 min · All levels',
    desc: 'A continuous loop of positive affirmations performed in native ASL by a DHH counselor. No text overlays, no audio track — just meaning in your first language.',
    tooltipDesc: 'Unlike text-based affirmations that require reading English (a second language for many DHH users), this is delivered natively in ASL.',
    color: 'var(--accent-violet)',
    colorDim: 'var(--accent-violet-dim)',
  },
  {
    id: 'scan',
    icon: Clock,
    title: 'Visual Body Scan',
    tag: '8 min · Beginner',
    desc: 'A guided mindful body scan that uses gentle color halos moving across a body silhouette — fully visual, zero narration. Helps with somatic awareness and grounding.',
    tooltipDesc: 'Traditional body scan meditations rely heavily on audio narration. This reimagines the entire experience as a silent visual journey.',
    color: 'var(--accent-rose)',
    colorDim: 'var(--accent-rose-dim)',
  },
];

const BreathingVisual = ({ isPlaying }) => {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', background: '#060810' }}>
      {/* Background ambient glow */}
      <motion.div
        animate={isPlaying ? { scale: [1, 1.8, 1], opacity: [0.2, 0.05, 0.2] } : { scale: 1, opacity: 0.1 }}
        transition={{ duration: 7, ease: 'easeInOut', repeat: Infinity }}
        style={{ position: 'absolute', width: '260px', height: '260px', borderRadius: '50%', background: 'var(--accent-teal)', filter: 'blur(60px)' }}
      />
      {/* Outer ring */}
      <motion.div
        animate={isPlaying ? { scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] } : { scale: 1 }}
        transition={{ duration: 7, ease: 'easeInOut', repeat: Infinity }}
        style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', border: '1px solid rgba(0,212,170,0.3)' }}
      />
      {/* Middle ring */}
      <motion.div
        animate={isPlaying ? { scale: [1, 1.35, 1] } : { scale: 1 }}
        transition={{ duration: 7, ease: 'easeInOut', repeat: Infinity, delay: 0.5 }}
        style={{ position: 'absolute', width: '140px', height: '140px', borderRadius: '50%', border: '1.5px solid rgba(0,212,170,0.5)', background: 'rgba(0,212,170,0.04)' }}
      />
      {/* Center */}
      <motion.div
        animate={isPlaying ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 7, ease: 'easeInOut', repeat: Infinity, delay: 1 }}
        style={{
          width: '96px', height: '96px', borderRadius: '50%',
          background: 'rgba(0,212,170,0.12)', border: '2px solid var(--accent-teal)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}
      >
        <motion.p
          animate={isPlaying ? { opacity: [1, 0, 1] } : {}}
          transition={{ duration: 7, ease: 'easeInOut', repeat: Infinity }}
          style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-teal)', textAlign: 'center' }}
        >
          {isPlaying ? 'Inhale' : 'Ready'}
        </motion.p>
      </motion.div>

      {/* Instruction */}
      {isPlaying && (
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ position: 'absolute', bottom: '40px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}
        >
          Follow the circle · 7s in · 4s hold · 8s out
        </motion.p>
      )}
    </div>
  );
};

const Therapy = () => {
  const [activeModule, setActiveModule] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  const mod = MODULES.find(m => m.id === activeModule);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1100px' }}>
      {!activeModule ? (
        <>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.03em' }}>Visual Therapy</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              100% visual — zero audio. Every module is built from scratch for DHH users, not adapted from hearing-first apps.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {MODULES.map((module) => {
              const Icon = module.icon;
              return (
                <motion.div
                  key={module.id}
                  whileHover={{ y: -4, scale: 1.01 }}
                  onHoverStart={() => setHoveredCard(module.id)}
                  onHoverEnd={() => setHoveredCard(null)}
                  style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-xl)', padding: '28px',
                    cursor: 'pointer', position: 'relative', overflow: 'hidden',
                    transition: 'border-color 0.2s',
                    borderColor: hoveredCard === module.id ? 'var(--border-strong)' : 'var(--border)'
                  }}
                  onClick={() => setActiveModule(module.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                      background: module.colorDim, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Icon size={20} style={{ color: module.color }} />
                    </div>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border)', height: 'fit-content' }}>
                      {module.tag}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '10px' }}>{module.title}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '20px' }}>{module.desc}</p>

                  {/* DHH-exclusive callout */}
                  <div style={{
                    padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                    background: `${module.color}10`, border: `1px solid ${module.color}25`,
                    display: 'flex', alignItems: 'flex-start', gap: '8px'
                  }}>
                    <Info size={13} style={{ color: module.color, flexShrink: 0, marginTop: '1px' }} />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{module.tooltipDesc}</p>
                  </div>

                  <div style={{ position: 'absolute', bottom: '-40px', right: '-40px', width: '140px', height: '140px', background: module.color, filter: 'blur(70px)', opacity: 0.12, borderRadius: '50%' }} />
                </motion.div>
              );
            })}
          </div>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn btn-ghost" onClick={() => { setActiveModule(null); setIsPlaying(false); }}>
              <ChevronLeft size={16} /> All Modules
            </button>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, textAlign: 'center' }}>{mod?.title}</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center' }}>{mod?.tag}</p>
            </div>
            <div style={{ width: '100px' }} />
          </div>

          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', height: '420px'
          }}>
            {activeModule === 'breathe' && <BreathingVisual isPlaying={isPlaying} />}
            {activeModule !== 'breathe' && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: mod?.colorDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {mod && <mod.icon size={28} style={{ color: mod.color }} />}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{isPlaying ? 'Session in progress...' : 'Press play to begin'}</p>
              </div>
            )}

            {/* Player controls */}
            <div style={{
              padding: '18px 32px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)',
              borderTop: '1px solid var(--border)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '28px'
            }}>
              <button onClick={() => setIsPlaying(false)} className="btn btn-ghost" style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%' }}>
                <RefreshCw size={16} color="var(--text-secondary)" />
              </button>
              <button
                onClick={() => setIsPlaying(p => !p)}
                style={{
                  width: '56px', height: '56px', borderRadius: '50%', border: 'none',
                  background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,255,255,0.15)'
                }}
              >
                {isPlaying ? <Pause size={22} fill="#060810" color="#060810" /> : <Play size={22} fill="#060810" color="#060810" style={{ marginLeft: '2px' }} />}
              </button>
              <div style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                05:00
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Therapy;
