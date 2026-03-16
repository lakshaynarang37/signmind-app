import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, X, ShieldAlert, PhoneOff, MessageSquareText, Clock, User } from 'lucide-react';

const CrisisModal = ({ onClose }) => {
  const [state, setState] = useState('connecting'); // connecting | connected

  useEffect(() => {
    const t = setTimeout(() => setState('connected'), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(4, 5, 10, 0.92)',
          backdropFilter: 'blur(20px)'
        }}
      />

      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        style={{
          position: 'relative',
          width: '100%', maxWidth: '980px',
          height: '82vh',
          background: 'var(--bg-secondary)',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 0 60px rgba(244, 63, 94, 0.08)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          background: 'rgba(244, 63, 94, 0.05)',
          borderBottom: '1px solid rgba(244, 63, 94, 0.15)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="pulse-red" style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--danger)' }} />
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={18} /> Silent Crisis Connect
              </h2>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '4px 10px', borderRadius: 'var(--radius-full)',
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)'
            }}>
              <PhoneOff size={12} color="var(--text-muted)" />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Video Only · No Calls</span>
            </div>
          </div>

          <button onClick={onClose} style={{
            width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-card)',
            border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-secondary)'
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
          <AnimatePresence mode="wait">
            {state === 'connecting' && (
              <motion.div
                key="connecting"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}
              >
                <div style={{ position: 'relative' }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    style={{
                      width: '60px', height: '60px',
                      border: '3px solid transparent',
                      borderTop: '3px solid var(--danger)',
                      borderRadius: '50%'
                    }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <User size={22} color="var(--danger)" />
                  </div>
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.03em' }}>Finding an ASL Counselor...</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', maxWidth: '360px', lineHeight: 1.6 }}>
                  You are not alone. We are connecting you with a trained Deaf counselor who understands. Please hold on.
                </p>
                <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                  {['✓ No voice call ever', '✓ ASL-fluent counselor', '✓ 100% confidential'].map(f => (
                    <span key={f} style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', background: 'var(--accent-emerald-dim)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                      {f}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {state === 'connected' && (
              <motion.div
                key="connected"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ flex: 1, display: 'flex', overflow: 'hidden' }}
              >
                {/* Counselor main feed */}
                <div style={{ flex: 2, position: 'relative', background: '#03040a' }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'url("https://images.unsplash.com/photo-1551836022-4c4c79ecde51?q=80&w=2000")',
                    backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.7
                  }} />

                  {/* Counselor label */}
                  <div style={{
                    position: 'absolute', bottom: '24px', left: '24px',
                    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)',
                    padding: '12px 18px', borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '1rem' }}>Sarah M., LCSW</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>ASL Fluent · Crisis Counselor · Deaf Ally</p>
                    </div>
                  </div>

                  {/* Timer */}
                  <div style={{
                    position: 'absolute', top: '20px', right: '20px',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                    padding: '6px 12px', borderRadius: 'var(--radius-full)',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}>
                    <Clock size={12} color="var(--text-secondary)" />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>00:12</span>
                  </div>
                </div>

                {/* Right panel */}
                <div style={{ width: '300px', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)' }}>
                  {/* Self view */}
                  <div style={{ height: '38%', position: 'relative', background: '#0a0c14', borderBottom: '1px solid var(--border)' }}>
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'url("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2000")',
                      backgroundSize: 'cover', backgroundPosition: 'center',
                      transform: 'scaleX(-1)', opacity: 0.65
                    }} />
                    <div style={{
                      position: 'absolute', top: '10px', left: '10px',
                      background: 'rgba(0,0,0,0.5)', padding: '3px 8px', borderRadius: 'var(--radius-full)',
                      fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      <Video size={11} color="var(--brand)" /> You
                    </div>
                  </div>

                  {/* Text fallback */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MessageSquareText size={12} /> Text backup (optional)
                    </p>

                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '8px' }}>
                      <div style={{
                        alignSelf: 'flex-start', background: 'var(--bg-card)',
                        padding: '10px 14px', borderRadius: '0 12px 12px 12px',
                        border: '1px solid var(--border)', maxWidth: '90%'
                      }}>
                        <p style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>Hello, I'm here with you. Take all the time you need. You can sign or type below — I understand both.</p>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Sarah · 10:42 AM</span>
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Type if you prefer..."
                      style={{
                        width: '100%', padding: '10px 14px',
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                        outline: 'none', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif'
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default CrisisModal;
