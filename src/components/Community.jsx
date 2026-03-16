import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, BookOpen, Heart, Pin, Shield, ThumbsUp, ChevronRight, Globe } from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] } })
};

const Community = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const posts = [
    {
      author: 'Maya R.', avatar: 'MR', role: 'DHH Member',
      time: '2h ago', tag: 'Story', tagColor: 'var(--brand)',
      title: 'How SignMind helped me get through a panic attack without calling anyone',
      body: "Last Tuesday I felt it coming — the spiral. I opened the Color Breathing exercise and focused on the rings instead of reaching for my phone. It passed. First time in years I managed it without involving a hearing person who couldn't fully understand anyway.",
      likes: 47, comments: 12, pinned: true
    },
    {
      author: 'James T.', avatar: 'JT', role: 'Hard of Hearing',
      time: '5h ago', tag: 'Question', tagColor: 'var(--accent-violet)',
      title: 'Does the AI pick up on BSL (British Sign Language) or only ASL?',
      body: 'I live in the UK and was wondering if the facial expression AI is language-agnostic since it tracks facial movements, or if it is calibrated only for ASL signers. Has anyone tested this?',
      likes: 23, comments: 8, pinned: false
    },
    {
      author: 'Priya N.', avatar: 'PN', role: 'Deaf Community Leader',
      time: '1d ago', tag: 'Resource', tagColor: 'var(--accent-teal)',
      title: '5 research-backed techniques for managing DHH-specific social anxiety',
      body: "I've compiled a visual-first guide based on the latest DHH mental health research (post-2020). None of these require you to call a hotline or use voice chat. Sharing here with permission from the researchers.",
      likes: 134, comments: 29, pinned: false
    },
  ];

  const resources = [
    { icon: BookOpen, label: 'DHH Mental Health Research Hub', color: 'var(--brand)', desc: 'Peer-reviewed papers, 2018–present' },
    { icon: Globe, label: 'Find a DHH Therapist Near You', color: 'var(--accent-teal)', desc: 'Directory of ASL-fluent clinicians' },
    { icon: Shield, label: 'Legal Rights for DHH Patients', color: 'var(--accent-amber)', desc: 'Know your ADA and accessibility rights' },
  ];

  return (
    <div style={{ display: 'flex', gap: '20px', maxWidth: '1100px' }}>
      {/* Feed */}
      <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.03em' }}>DHH Community</h2>
            <span className="badge" style={{ background: 'var(--accent-emerald-dim)', color: 'var(--accent-emerald)', border: '1px solid var(--accent-emerald-glow)' }}>
              <Shield size={10} /> Moderated
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            A private space for Deaf and Hard-of-Hearing people. No hearing-centric advice, no audio links, no phone numbers.
          </p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['all', 'stories', 'questions', 'resources', 'research'].map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} style={{
              padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)',
              background: activeFilter === f ? 'var(--brand)' : 'transparent',
              color: activeFilter === f ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.15s'
            }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Posts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {posts.map((post, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ x: 2 }}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '20px',
                cursor: 'pointer', position: 'relative',
                transition: 'border-color 0.2s ease'
              }}
            >
              {post.pinned && (
                <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--accent-amber)' }}>
                  <Pin size={11} /> Pinned
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--brand), var(--accent-violet))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: 700, color: '#fff', flexShrink: 0
                }}>
                  {post.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{post.author}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{post.role} · {post.time}</div>
                </div>
                <span className="badge" style={{ background: `${post.tagColor}15`, color: post.tagColor }}>
                  {post.tag}
                </span>
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px', lineHeight: 1.4 }}>{post.title}</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '16px' }}>{post.body}</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>
                  <ThumbsUp size={14} /> {post.likes}
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>
                  <MessageSquare size={14} /> {post.comments}
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>
                  <Heart size={14} /> Save
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Stats */}
        <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '16px' }}>Community Stats</h3>
          {[
            { label: 'Active Members', value: '4,200+', color: 'var(--brand)' },
            { label: 'Weekly Posts', value: '280', color: 'var(--accent-teal)' },
            { label: 'Peer Support Threads', value: '1,140', color: 'var(--accent-violet)' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.label}</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: s.color, fontFamily: 'Outfit, sans-serif' }}>{s.value}</span>
            </div>
          ))}
        </motion.div>

        {/* Resources */}
        <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '14px' }}>DHH Resources</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {resources.map((r, i) => {
              const Icon = r.icon;
              return (
                <div key={i} style={{
                  display: 'flex', gap: '12px', padding: '12px', borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  cursor: 'pointer', alignItems: 'center'
                }}>
                  <div style={{ flexShrink: 0, color: r.color }}><Icon size={16} /></div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 500, marginBottom: '2px' }}>{r.label}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.desc}</p>
                  </div>
                  <ChevronRight size={14} color="var(--text-muted)" />
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Community;
