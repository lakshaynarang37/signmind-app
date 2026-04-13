import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  BookMarked,
  Globe,
  Shield,
  ExternalLink,
  Plus,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { createCommunityPost, getCommunityPosts } from "../services/backendApi";

const RESOURCES = [
  {
    name: "National Deaf Center",
    desc: "Mental health, education, and career resources for DHH adults",
    url: "https://nationaldeafcenter.org",
    category: "Mental Health",
  },
  {
    name: "Hands & Voices",
    desc: "Family support organization for families with DHH children",
    url: "https://www.handsandvoices.org",
    category: "Family",
  },
  {
    name: "NAMI DHH Resources",
    desc: "Mental health resources adapted for Deaf communities",
    url: "https://nami.org",
    category: "Mental Health",
  },
  {
    name: "DeafMental Health",
    desc: "Culturally-affirmative therapy and crisis support",
    url: "https://www.deafmh.org",
    category: "Crisis",
  },
  {
    name: "Crisis Text Line (text HOME)",
    desc: "Free 24/7 crisis support via text — DHH accessible",
    url: "https://www.crisistextline.org",
    category: "Crisis",
  },
];

const timeAgo = (isoTime) => {
  if (!isoTime) return "just now";
  const deltaMs = Date.now() - new Date(isoTime).getTime();
  const minutes = Math.max(1, Math.floor(deltaMs / (1000 * 60)));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const avatarFromName = (name = "User") => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return initials || "U";
};

const Post = ({ post }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1 }}
    >
      <Card className="border-border/50 hover:border-border transition-colors duration-200">
        <CardContent className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[linear-gradient(135deg,var(--brand-start),var(--brand-end))] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {avatarFromName(post.authorName)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  {post.authorName}
                </p>
                <span className="text-[10px] text-muted-foreground">
                  {timeAgo(post.createdAt)}
                </span>
              </div>
              {Array.isArray(post.tags) && post.tags.length > 0 ? (
                <div className="flex gap-1 mt-0.5">
                  {post.tags.map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className="text-[9px] px-1.5 py-0"
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {post.content}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Community = ({ token }) => {
  const [activeTab, setActiveTabLocal] = useState("feed");
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState("");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [newPostTags, setNewPostTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uniqueMembers = useMemo(
    () => new Set(posts.map((post) => post.userId)).size,
    [posts],
  );

  const loadPosts = async () => {
    setLoadingPosts(true);
    setError("");
    try {
      const data = await getCommunityPosts(token);
      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch (err) {
      setError(err.message || "Failed to load community feed.");
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [token]);

  const submitPost = async () => {
    const content = newPostText.trim();
    if (content.length < 3) return;
    setIsSubmitting(true);
    setError("");

    try {
      const tags = newPostTags
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 5);

      const data = await createCommunityPost(token, { content, tags });
      if (data?.post) {
        setPosts((prev) => [data.post, ...prev]);
      }
      setNewPostText("");
      setNewPostTags("");
      setIsComposerOpen(false);
    } catch (err) {
      setError(err.message || "Could not publish post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const postCountToday = posts.filter((post) => {
    const created = new Date(post.createdAt);
    const today = new Date();
    return (
      created.getFullYear() === today.getFullYear() &&
      created.getMonth() === today.getMonth() &&
      created.getDate() === today.getDate()
    );
  }).length;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold mb-1">DHH Community</h2>
        <p className="text-muted-foreground text-sm">
          A safe space for Deaf and Hard-of-Hearing individuals to connect,
          share, and support each other.
        </p>
      </div>

      {/* Community stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Members",
            value: String(uniqueMembers),
            icon: MessageSquare,
            color: "text-violet-400",
            bg: "bg-violet-500/10",
          },
          {
            label: "Posts Today",
            value: String(postCountToday),
            icon: MessageSquare,
            color: "text-teal-400",
            bg: "bg-teal-500/10",
          },
          {
            label: "Resources",
            value: String(RESOURCES.length),
            icon: BookMarked,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
        ].map((s, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.bg}`}>
                <s.icon size={14} className={s.color} />
              </div>
              <div>
                <p
                  className={`text-lg font-display font-bold ${s.color} leading-tight`}
                >
                  {s.value}
                </p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-1">
        {["feed", "resources"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTabLocal(t)}
            className={`text-sm font-medium px-3 py-1.5 rounded-lg capitalize transition-all duration-200 ${activeTab === t ? "bg-violet-500/15 text-violet-400 border border-violet-500/25" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === "feed" ? (
        <>
          <div className="flex justify-end">
            <Button onClick={() => setIsComposerOpen((v) => !v)}>
              <Plus size={14} className="mr-1.5" />
              {isComposerOpen ? "Close" : "Post"}
            </Button>
          </div>

          {isComposerOpen ? (
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  Share with the community
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <textarea
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  rows={4}
                  placeholder="Write your post here..."
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  value={newPostTags}
                  onChange={(e) => setNewPostTags(e.target.value)}
                  placeholder="Tags (comma separated, optional)"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={submitPost}
                    disabled={isSubmitting || newPostText.trim().length < 3}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={14} className="mr-1.5 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Publish Post"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Posts */}
          <div className="space-y-3">
            {loadingPosts ? (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Loading posts...
              </div>
            ) : posts.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="p-5 text-sm text-muted-foreground">
                  No community posts yet. Be the first to post.
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => <Post key={post.id} post={post} />)
            )}
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-full px-4 py-2">
              <Shield size={11} /> Posts are shown from real signed-in users
              stored in backend.
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Curated resources specifically for the DHH community, reviewed by
            DHH mental health advocates.
          </p>
          {RESOURCES.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="border-border/50 hover:border-border transition-colors duration-200">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
                    <Globe size={15} className="text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {r.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {r.desc}
                        </p>
                      </div>
                      <Badge
                        variant={r.category === "Crisis" ? "rose" : "teal"}
                        className="shrink-0"
                      >
                        {r.category}
                      </Badge>
                    </div>
                  </div>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-violet-400 transition-colors mt-1"
                  >
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
