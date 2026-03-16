import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, MicOff, Play, Square, ChevronRight, Sparkles, Clock, BookOpen, Smile } from 'lucide-react';

const Journaling = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [timer, setTimer] = useState(null);
  const [showPrompt, setShowPrompt] = useState(true);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      const t = setInterval(() => setElapsed(s => s + 1), 1000);
      setTimer(t);
    } else {
      setIsRecording(false);
      clearInterval(timer);
      setTimer(null);
      setElapsed(0);
    }
  };

  const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const pastEntries = [
    { date: 'Yesterday, 8:14 PM', duration: '03:42', mood: 'Stressed', moodClr: 'var(--accent-amber)', tags: ['Work', 'Anxiety'] },
    { date: 'Monday, Oct 13', duration: '05:15', mood: 'Calm', moodClr: 'var(--accent-emerald)', tags: ['Rest', 'Relaxed'] },
    { date: 'Sunday, Oct 12', duration: '02:30', mood: 'Anxious', moodClr: 'var(--accent-rose)', tags: ['Social', 'Uncertain'] },
  ];

  const prompts = [
    'What moment from today made you feel the most connected?',
    'Describe a challenge you faced and how you navigated it.',
    'What is one thing you want to release before the week ends?',
  ];

  return (
    <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - var(--header-h) - 56px)', maxWidth: '1200px' }}>
      {/* Main recorder */}
      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Info bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.03em' }}>Sign Language Journal</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Express freely in ASL — your AI companion watches for emotion patterns
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: 'var(--radius-full)', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <MicOff size={13} color="var(--accent-emerald)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', fontWeight: 500 }}>Audio Disabled · Privacy First</span>
          </div>
        </div>

        {/* Camera View */}
        <div style={{
          flex: 1,
          borderRadius: 'var(--radius-xl)',
          position: 'relative',
          overflow: 'hidden',
          background: '#080a14',
          border: isRecording ? '1.5px solid rgba(244,63,94,0.4)' : '1px solid var(--border)',
          boxShadow: isRecording ? 'var(--shadow-danger)' : 'none',
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
          minHeight: '340px'
        }}>
          {/* Simulated camera */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'url("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2000")',
            backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: 0.55, filter: 'grayscale(0.15)'
          }} />

          {/* Recording badge */}
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                position: 'absolute', top: '18px', left: '18px',
                background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                padding: '6px 14px', borderRadius: 'var(--radius-full)',
                display: 'flex', alignItems: 'center', gap: '8px',
                border: '1px solid rgba(244,63,94,0.3)'
              }}
            >
              <motion.div
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)' }}
              />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--danger)' }}>REC {fmtTime(elapsed)}</span>
            </motion.div>
          )}

          {/* AI Feature overlays */}
          {isRecording && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              style={{
                position: 'absolute', top: '18px', right: '18px',
                background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                padding: '12px 16px', borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(0,212,170,0.2)', width: '200px'
              }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 500 }}>AI Expression Tracking</p>
              {[
                { label: 'Tension', pct: 62, clr: 'var(--accent-amber)' },
                { label: 'Calm', pct: 30, clr: 'var(--accent-teal)' },
                { label: 'Sadness', pct: 18, clr: 'var(--brand)' },
              ].map((e, i) => (
                <div key={i} style={{ marginBottom: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                    <span>{e.label}</span><span>{e.pct}%</span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${e.pct}%` }} transition={{ delay: 1.2, duration: 0.8 }}
                      style={{ height: '100%', background: e.clr, borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Sign language zone indicator */}
          {isRecording && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{
                position: 'absolute',
                left: '50%', top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '160px', height: '200px',
                border: '1.5px dashed rgba(91,141,238,0.5)',
                borderRadius: '80px / 100px',
                pointerEvents: 'none'
              }}
            />
          )}

          {/* Controls */}
          <div style={{
            position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center', gap: '20px',
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)',
            padding: '12px 28px', borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <button
              onClick={toggleRecording}
              style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: isRecording ? 'rgba(244,63,94,0.15)' : 'var(--danger)',
                border: isRecording ? '2px solid var(--danger)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s ease',
                boxShadow: isRecording ? 'none' : 'var(--shadow-danger)'
              }}
            >
              {isRecording
                ? <Square size={20} fill="var(--danger)" color="var(--danger)" />
                : <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', display: 'block' }} />
              }
            </button>
          </div>
        </div>

        {/* AI Prompt Suggestion */}
        <AnimatePresence>
          {showPrompt && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                background: 'var(--brand-dim)', border: '1px solid var(--border-brand)',
                borderRadius: 'var(--radius-md)', padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: '12px'
              }}
            >
              <Sparkles size={18} color="var(--brand)" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', flex: 1, lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--text-primary)' }}>AI Prompt: </strong>
                "{prompts[0]}"
              </p>
              <button onClick={() => setShowPrompt(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>×</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sidebar */}
      <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Feature tags */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '12px' }}>Features Active</h3>
          {[
            { icon: <Smile size={14} />, label: 'Facial Expression AI', color: 'var(--brand)' },
            { icon: <BookOpen size={14} />, label: 'Auto-mood Tagging', color: 'var(--accent-violet)' },
            { icon: <Clock size={14} />, label: 'Session Timestamps', color: 'var(--accent-teal)' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ color: f.color }}>{f.icon}</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{f.label}</span>
            </div>
          ))}
        </div>

        {/* Past entries */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px', flex: 1 }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '14px' }}>Past Journals</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pastEntries.map((entry, i) => (
              <div key={i} style={{
                padding: '12px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                cursor: 'pointer', transition: 'border-color 0.2s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{entry.date}</span>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <Play size={14} />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span className="badge" style={{ background: `${entry.moodClr}15`, color: entry.moodClr }}>
                    {entry.mood}
                  </span>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}>
                    {entry.duration}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journaling;
