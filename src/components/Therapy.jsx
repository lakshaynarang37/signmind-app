/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RefreshCw,
  ChevronLeft,
  Info,
  Clock,
  Zap,
  Wind,
  Eye,
} from "lucide-react";
import useIsMobile from "../hooks/useIsMobile";

const AFFIRMATION_LINES = [
  "You are safe in this moment.",
  "Your pace is enough.",
  "Your feelings are valid.",
  "Progress can be gentle.",
];

const MODULES = [
  {
    id: "breathe",
    icon: Wind,
    title: "Color Breathing Sync",
    tag: "5 min · Beginner",
    desc: "A visual breathing exercise using expanding color rings to help slow breathing and settle anxiety.",
    tooltipDesc:
      "No audio cues are needed. Everything is guided through simple visual motion.",
    color: "var(--accent-teal)",
    colorDim: "var(--accent-teal-dim)",
    durationSec: 300,
  },
  {
    id: "ground",
    icon: Eye,
    title: "Grounding Through Shapes",
    tag: "10 min · Intermediate",
    desc: "Use moving shapes as a focus point to interrupt spiraling thoughts and come back to the present.",
    tooltipDesc:
      "Inspired by the 5-4-3-2-1 grounding method, adapted into a visual format.",
    color: "var(--brand)",
    colorDim: "var(--brand-dim)",
    durationSec: 600,
  },
  {
    id: "asl",
    icon: Zap,
    title: "ASL Affirmation Loop",
    tag: "3 min · All levels",
    desc: "A short loop of positive affirmations in a visual-first format designed for DHH users.",
    tooltipDesc:
      "Made for users who prefer a visual experience over long text or audio-only exercises.",
    color: "var(--accent-violet)",
    colorDim: "var(--accent-violet-dim)",
    durationSec: 180,
  },
  {
    id: "scan",
    icon: Clock,
    title: "Visual Body Scan",
    tag: "8 min · Beginner",
    desc: "A guided body scan with gentle visual cues to help notice tension and return to calm.",
    tooltipDesc:
      "A silent body-scan option for people who prefer visual guidance over narration.",
    color: "var(--accent-rose)",
    colorDim: "var(--accent-rose-dim)",
    durationSec: 480,
  },
];

const BreathingVisual = ({ isPlaying }) => {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        background: "#141920",
      }}
    >
      {/* Background ambient glow */}
      <motion.div
        animate={
          isPlaying
            ? { scale: [1, 1.8, 1], opacity: [0.2, 0.05, 0.2] }
            : { scale: 1, opacity: 0.1 }
        }
        transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
        style={{
          position: "absolute",
          width: "260px",
          height: "260px",
          borderRadius: "50%",
          background: "var(--accent-teal)",
          filter: "blur(60px)",
        }}
      />
      {/* Outer ring */}
      <motion.div
        animate={
          isPlaying
            ? { scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }
            : { scale: 1 }
        }
        transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
        style={{
          position: "absolute",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          border:
            "1px solid color-mix(in srgb, var(--accent-teal) 40%, transparent)",
        }}
      />
      {/* Middle ring */}
      <motion.div
        animate={isPlaying ? { scale: [1, 1.35, 1] } : { scale: 1 }}
        transition={{
          duration: 7,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 0.5,
        }}
        style={{
          position: "absolute",
          width: "140px",
          height: "140px",
          borderRadius: "50%",
          border:
            "1.5px solid color-mix(in srgb, var(--accent-teal) 60%, transparent)",
          background: "color-mix(in srgb, var(--accent-teal) 10%, transparent)",
        }}
      />
      {/* Center */}
      <motion.div
        animate={isPlaying ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={{
          duration: 7,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 1,
        }}
        style={{
          width: "96px",
          height: "96px",
          borderRadius: "50%",
          background: "color-mix(in srgb, var(--accent-teal) 22%, transparent)",
          border: "2px solid var(--accent-teal)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(4px)",
        }}
      >
        <motion.p
          animate={isPlaying ? { opacity: [1, 0, 1] } : {}}
          transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
          style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "var(--accent-teal)",
            textAlign: "center",
          }}
        >
          {isPlaying ? "Inhale" : "Ready"}
        </motion.p>
      </motion.div>

      {/* Instruction */}
      {isPlaying && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            position: "absolute",
            bottom: "40px",
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
          }}
        >
          Follow the circle · 7s in · 4s hold · 8s out
        </motion.p>
      )}
    </div>
  );
};

const GroundingVisual = ({ isPlaying }) => (
  <div
    style={{
      flex: 1,
      display: "grid",
      placeItems: "center",
      background: "#151a21",
    }}
  >
    <motion.div
      animate={
        isPlaying
          ? { rotate: [0, 10, -10, 0], scale: [1, 1.06, 0.96, 1] }
          : { rotate: 0, scale: 1 }
      }
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      style={{
        width: 160,
        height: 160,
        borderRadius: 26,
        border: "2px solid var(--brand)",
        background: "var(--brand-dim)",
      }}
    />
  </div>
);

const AffirmationVisual = ({ isPlaying }) => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }
    const timer = setInterval(() => {
      setIdx((current) => (current + 1) % AFFIRMATION_LINES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <div
      style={{
        flex: 1,
        display: "grid",
        placeItems: "center",
        background: "#181d24",
        padding: "20px",
      }}
    >
      <motion.p
        key={idx}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          fontSize: "1.1rem",
          color: "var(--text-primary)",
          textAlign: "center",
          maxWidth: 480,
        }}
      >
        {AFFIRMATION_LINES[idx]}
      </motion.p>
    </div>
  );
};

const BodyScanVisual = ({ isPlaying, progressPct }) => (
  <div
    style={{
      flex: 1,
      display: "grid",
      placeItems: "center",
      background: "#161b22",
      padding: "20px",
    }}
  >
    <div style={{ width: "100%", maxWidth: 460 }}>
      <div
        style={{
          height: 10,
          borderRadius: 10,
          background: "var(--bg-surface)",
          overflow: "hidden",
          border: "1px solid var(--border)",
        }}
      >
        <motion.div
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            height: "100%",
            background:
              "linear-gradient(90deg, var(--accent-rose), var(--accent-amber))",
          }}
        />
      </div>
      <p
        style={{
          marginTop: 10,
          color: "var(--text-secondary)",
          fontSize: "0.86rem",
        }}
      >
        {isPlaying
          ? "Scanning from head to toe with slow visual cues..."
          : "Ready for guided body scan"}
      </p>
    </div>
  </div>
);

const Therapy = () => {
  const isMobile = useIsMobile(900);

  const [activeModule, setActiveModule] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  const mod = MODULES.find((m) => m.id === activeModule);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((value) => {
        if (value <= 1) {
          setIsPlaying(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const progressPct = mod?.durationSec
    ? ((mod.durationSec - remainingSeconds) / mod.durationSec) * 100
    : 0;

  const formatTime = (total) => {
    const min = Math.floor(total / 60)
      .toString()
      .padStart(2, "0");
    const sec = (total % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        maxWidth: "1100px",
      }}
    >
      {!activeModule ? (
        <>
          <div>
            <h2
              style={{
                fontSize: "1.4rem",
                fontWeight: 700,
                letterSpacing: "-0.03em",
              }}
            >
              Visual Therapy
            </h2>
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                marginTop: "2px",
              }}
            >
              100% visual and audio-free. Built for DHH users from day one.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
              gap: "16px",
            }}
          >
            {MODULES.map((module) => {
              const Icon = module.icon;
              return (
                <motion.div
                  key={module.id}
                  whileHover={{ y: -4, scale: 1.01 }}
                  onHoverStart={() => setHoveredCard(module.id)}
                  onHoverEnd={() => setHoveredCard(null)}
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-xl)",
                    padding: "28px",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    transition: "border-color 0.2s",
                    borderColor:
                      hoveredCard === module.id
                        ? "var(--border-strong)"
                        : "var(--border)",
                  }}
                  onClick={() => {
                    setActiveModule(module.id);
                    setIsPlaying(false);
                    setRemainingSeconds(module.durationSec || 300);
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "var(--radius-md)",
                        background: module.colorDim,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={20} style={{ color: module.color }} />
                    </div>
                    <span
                      className="badge"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                        height: "fit-content",
                      }}
                    >
                      {module.tag}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: "1.15rem",
                      fontWeight: 600,
                      marginBottom: "10px",
                    }}
                  >
                    {module.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.65,
                      marginBottom: "20px",
                    }}
                  >
                    {module.desc}
                  </p>

                  {/* DHH-exclusive callout */}
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "var(--radius-sm)",
                      background: `${module.color}10`,
                      border: `1px solid ${module.color}25`,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                  >
                    <Info
                      size={13}
                      style={{
                        color: module.color,
                        flexShrink: 0,
                        marginTop: "1px",
                      }}
                    />
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                        lineHeight: 1.5,
                      }}
                    >
                      {module.tooltipDesc}
                    </p>
                  </div>

                  <div
                    style={{
                      position: "absolute",
                      bottom: "-40px",
                      right: "-40px",
                      width: "140px",
                      height: "140px",
                      background: module.color,
                      filter: "blur(70px)",
                      opacity: 0.12,
                      borderRadius: "50%",
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <button
              className="btn btn-ghost"
              onClick={() => {
                setActiveModule(null);
                setIsPlaying(false);
                setRemainingSeconds(0);
              }}
            >
              <ChevronLeft size={16} /> All Modules
            </button>
            <div>
              <h2
                style={{
                  fontSize: isMobile ? "1rem" : "1.2rem",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                {mod?.title}
              </h2>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-secondary)",
                  textAlign: "center",
                }}
              >
                {mod?.tag}
              </p>
            </div>
            <div style={{ width: "100px" }} />
          </div>

          <div
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              height: isMobile ? "340px" : "420px",
            }}
          >
            {activeModule === "breathe" && (
              <BreathingVisual isPlaying={isPlaying} />
            )}
            {activeModule === "ground" && (
              <GroundingVisual isPlaying={isPlaying} />
            )}
            {activeModule === "asl" && (
              <AffirmationVisual isPlaying={isPlaying} />
            )}
            {activeModule === "scan" && (
              <BodyScanVisual isPlaying={isPlaying} progressPct={progressPct} />
            )}

            {/* Player controls */}
            <div
              style={{
                padding: "18px 32px",
                background: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(12px)",
                borderTop: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "28px",
              }}
            >
              <button
                onClick={() => setIsPlaying(false)}
                className="btn btn-ghost"
                style={{
                  width: "40px",
                  height: "40px",
                  padding: 0,
                  borderRadius: "50%",
                }}
              >
                <RefreshCw size={16} color="var(--text-secondary)" />
              </button>
              <button
                onClick={() => setIsPlaying((p) => !p)}
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  border: "none",
                  background: "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.35)",
                }}
              >
                {isPlaying ? (
                  <Pause size={22} fill="#252b34" color="#252b34" />
                ) : (
                  <Play
                    size={22}
                    fill="#252b34"
                    color="#252b34"
                    style={{ marginLeft: "2px" }}
                  />
                )}
              </button>
              <div
                style={{
                  padding: "6px 14px",
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  fontFamily: "monospace",
                }}
              >
                {formatTime(remainingSeconds || mod?.durationSec || 300)}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Therapy;
