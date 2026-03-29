import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, MessageSquare, Video, ShieldAlert, ExternalLink } from "lucide-react";

const CRISIS_RESOURCES = [
  {
    name: "ISLRTC Video Relay (India)",
    description: "Emergency Indian Sign Language support via WhatsApp Video call.",
    contact: "8929667579",
    type: "video",
    link: "https://wa.me/918929667579",
    hours: "Mon-Fri (10AM-1PM, 2PM-5PM)"
  },
  {
    name: "iCALL (TISS) Chat",
    description: "Professional mental health counseling via email and chat for DHH.",
    contact: "icall@tiss.edu",
    type: "chat",
    link: "mailto:icall@tiss.edu",
    hours: "Mon-Sat (10AM-8PM)"
  },
  {
    name: "Tele-MANAS (Govt of India)",
    description: "24/7 National mental health helpline. Dial 14416.",
    contact: "14416",
    type: "phone",
    link: "tel:14416",
    hours: "24/7 Available"
  },
  {
    name: "Crisis Text Line India",
    description: "Text-based support for emotional distress and suicidal thoughts.",
    contact: "TEXT 741741",
    type: "chat",
    link: "https://www.crisistextline.org/",
    hours: "24/7 Available"
  }
];

export default function CrisisModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg glass-strong rounded-3xl overflow-hidden shadow-2xl border border-rose-500/20"
      >
        {/* Header */}
        <div className="p-6 border-b border-border bg-rose-500/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
              <h2 className="text-xl font-display font-bold">Silent Crisis Support</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            If you are in immediate danger or need urgent help, these resources provide text and sign-language based assistance in India.
          </p>
        </div>

        {/* Resources Scroll Area */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {CRISIS_RESOURCES.map((resource, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-secondary/50 border border-border hover:border-rose-500/30 transition-all group"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-background border border-border text-rose-400">
                    {resource.type === "video" ? <Video size={18} /> : resource.type === "chat" ? <MessageSquare size={18} /> : <Phone size={18} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground group-hover:text-rose-400 transition-colors uppercase text-xs tracking-wider">
                      {resource.name}
                    </h3>
                    <p className="text-[10px] text-rose-400/80 font-medium">
                      {resource.hours}
                    </p>
                  </div>
                </div>
                <a
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {resource.description}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs font-mono text-foreground font-bold bg-background/50 px-3 py-1.5 rounded-lg border border-border w-fit">
                {resource.contact}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 bg-secondary/30 text-center">
          <p className="text-xs text-muted-foreground">
            Remember: Your life is valuable. Reach out to someone you trust or use these professional services.
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 rounded-xl bg-background border border-border text-sm font-medium hover:bg-accent transition-colors"
          >
            I understand, close this modal
          </button>
        </div>
      </motion.div>
    </div>
  );
}
