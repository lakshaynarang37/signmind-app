import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, Heart, MessageSquare, BookMarked, Globe, Shield, Award, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

const POSTS = [
  { id: 1, author: "Maya R.", initials: "MR", color: "from-violet-500 to-indigo-600", time: "2h ago", content: "Just completed my first week using the color breathing exercise every morning. The visual approach is exactly what I needed — no more feeling left out of audio-based meditation apps! 🌊", likes: 24, tags: ["breathing", "milestone"], category: "milestone" },
  { id: 2, author: "Jordan K.", initials: "JK", color: "from-teal-500 to-cyan-600", time: "5h ago", content: "Navigating a new job with hearing coworkers is exhausting. Communication fatigue is real. Has anyone found good strategies for setting boundaries about communication methods politely?", likes: 31, tags: ["work", "communication"], category: "question" },
  { id: 3, author: "Sam T.", initials: "ST", color: "from-amber-500 to-orange-600", time: "1d ago", content: "PSA: The National Deaf Center (nationaldeafcenter.org) has incredible mental health resources. They have licensed therapists who are DHH-affirming. It took me 2 years to find this. Sharing so you don't have to search as long.", likes: 87, tags: ["resources", "therapy"], category: "resource" },
  { id: 4, author: "Riley C.", initials: "RC", color: "from-rose-500 to-pink-600", time: "1d ago", content: "Reminder that communication fatigue is a legitimate mental health challenge. If you're hard of hearing and constantly 'switching on' extra concentration to lip-read or process audio — that's real labor. Be gentle with yourself today. ❤️", likes: 112, tags: ["self-care", "validation"], category: "support" },
  { id: 5, author: "Alex B.", initials: "AB", color: "from-emerald-500 to-teal-600", time: "2d ago", content: "Question for the community: Do you prefer to disclose your hearing loss at the start of new relationships/friendships, or wait until it becomes relevant? How has it gone for you?", likes: 45, tags: ["identity", "relationships"], category: "question" },
];

const RESOURCES = [
  { name: "National Deaf Center", desc: "Mental health, education, and career resources for DHH adults", url: "https://nationaldeafcenter.org", category: "Mental Health" },
  { name: "Hands & Voices", desc: "Family support organization for families with DHH children", url: "https://www.handsandvoices.org", category: "Family" },
  { name: "NAMI DHH Resources", desc: "Mental health resources adapted for Deaf communities", url: "https://nami.org", category: "Mental Health" },
  { name: "DeafMental Health", desc: "Culturally-affirmative therapy and crisis support", url: "https://www.deafmh.org", category: "Crisis" },
  { name: "Crisis Text Line (text HOME)", desc: "Free 24/7 crisis support via text — DHH accessible", url: "https://www.crisistextline.org", category: "Crisis" },
];

const CATEGORIES = ["all", "milestone", "question", "resource", "support"];

const Post = ({ post }) => {
  const [liked, setLiked] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -1 }}>
      <Card className="border-border/50 hover:border-border transition-colors duration-200">
        <CardContent className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${post.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{post.initials}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">{post.author}</p>
                <span className="text-[10px] text-muted-foreground">{post.time}</span>
              </div>
              <div className="flex gap-1 mt-0.5">
                {post.tags.map((t) => <Badge key={t} variant="secondary" className="text-[9px] px-1.5 py-0">{t}</Badge>)}
              </div>
            </div>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed mb-3">{post.content}</p>
          <div className="flex items-center gap-3 text-muted-foreground">
            <button onClick={() => setLiked((l) => !l)} className={`flex items-center gap-1.5 text-xs hover:text-rose-400 transition-colors ${liked ? "text-rose-400" : ""}`}>
              <Heart size={13} fill={liked ? "currentColor" : "none"} /> {post.likes + (liked ? 1 : 0)}
            </button>
            <button className="flex items-center gap-1.5 text-xs hover:text-violet-400 transition-colors">
              <MessageSquare size={13} /> Reply
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Community = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTab, setActiveTabLocal] = useState("feed");

  const filtered = activeCategory === "all" ? POSTS : POSTS.filter((p) => p.category === activeCategory);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold mb-1">DHH Community</h2>
        <p className="text-muted-foreground text-sm">A safe space for Deaf and Hard-of-Hearing individuals to connect, share, and support each other.</p>
      </div>

      {/* Community stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Members", value: "2.4K", icon: Users, color: "text-violet-400", bg: "bg-violet-500/10" },
          { label: "Posts Today", value: "38", icon: MessageSquare, color: "text-teal-400", bg: "bg-teal-500/10" },
          { label: "Resources", value: "120+", icon: BookMarked, color: "text-amber-400", bg: "bg-amber-500/10" },
        ].map((s, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.bg}`}><s.icon size={14} className={s.color} /></div>
              <div><p className={`text-lg font-display font-bold ${s.color} leading-tight`}>{s.value}</p><p className="text-[10px] text-muted-foreground">{s.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-1">
        {["feed", "resources"].map((t) => (
          <button key={t} onClick={() => setActiveTabLocal(t)}
            className={`text-sm font-medium px-3 py-1.5 rounded-lg capitalize transition-all duration-200 ${activeTab === t ? "bg-violet-500/15 text-violet-400 border border-violet-500/25" : "text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === "feed" ? (
        <>
          {/* Category filters */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-all duration-150 ${activeCategory === cat ? "border-violet-500/50 bg-violet-500/15 text-violet-400" : "border-border text-muted-foreground hover:text-foreground"}`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Posts */}
          <div className="space-y-3">
            {filtered.map((post) => <Post key={post.id} post={post} />)}
          </div>

          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-full px-4 py-2">
              <Shield size={11} /> Posts are moderated. Community is private to signed-up DHH users only.
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Curated resources specifically for the DHH community, reviewed by DHH mental health advocates.</p>
          {RESOURCES.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="border-border/50 hover:border-border transition-colors duration-200">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0"><Globe size={15} className="text-teal-400" /></div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{r.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                      </div>
                      <Badge variant={r.category === "Crisis" ? "rose" : "teal"} className="flex-shrink-0">{r.category}</Badge>
                    </div>
                  </div>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-violet-400 transition-colors mt-1">
                    <ExternalLink size={14} />
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Community;
