import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Journaling from './components/Journaling';
import Therapy from './components/Therapy';
import Insights from './components/Insights';
import Community from './components/Community';
import CrisisModal from './components/CrisisModal';
import { AnimatePresence, motion } from 'framer-motion';

const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard setActiveTab={setActiveTab} />;
      case 'journal':   return <Journaling />;
      case 'therapy':   return <Therapy />;
      case 'insights':  return <Insights />;
      case 'community': return <Community />;
      default:          return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onCrisisClick={() => setIsCrisisModalOpen(true)}
      />

      {/* Main scroll area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Header */}
        <header style={{
          height: 'var(--header-h)',
          minHeight: 'var(--header-h)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(6, 8, 16, 0.8)',
          backdropFilter: 'blur(12px)',
          zIndex: 10,
          position: 'sticky',
          top: 0
        }}>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 600, letterSpacing: '-0.02em' }}>
              {activeTab === 'dashboard' && 'Overview'}
              {activeTab === 'journal'   && 'Sign Journal'}
              {activeTab === 'therapy'   && 'Visual Therapy'}
              {activeTab === 'insights'  && 'AI Insights'}
              {activeTab === 'community' && 'DHH Community'}
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
              Monday, March 16 · Week 12
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Streak badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: 'var(--radius-full)',
              background: 'var(--accent-amber-dim)', border: '1px solid rgba(245,158,11,0.2)'
            }}>
              <span style={{ fontSize: '0.9rem' }}>🔥</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-amber)' }}>14-day streak</span>
            </div>

            {/* AI active indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: 'var(--radius-full)',
              background: 'var(--accent-emerald-dim)', border: '1px solid rgba(16,185,129,0.2)'
            }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent-emerald)', boxShadow: 'var(--shadow-teal)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--accent-emerald)' }}>AI Active</span>
            </div>

            {/* Avatar */}
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--brand), var(--accent-violet))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: 700, color: '#fff',
              border: '2px solid var(--border-strong)', cursor: 'pointer'
            }}>
              AJ
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} variants={pageVariants} initial="hidden" animate="visible" exit="exit">
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {isCrisisModalOpen && (
          <CrisisModal onClose={() => setIsCrisisModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
