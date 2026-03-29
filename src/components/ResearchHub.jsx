import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FlaskConical, ExternalLink, Calendar, BookOpen, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { getResearchArticles } from "../services/backendApi";

const ResearchHub = () => {
  const [articles, setArticles] = useState([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getResearchArticles()
      .then((d) => { setArticles(d.items || []); setSource(d.source || ""); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold mb-1">Research Hub</h2>
          <p className="text-muted-foreground text-sm">Peer-reviewed research on Deaf mental health, psychotherapy, and accessibility in healthcare.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </Button>
      </div>

      {/* Source badge */}
      <div className="flex items-center gap-2">
        <Badge variant={source === "europe-pmc" ? "emerald" : "secondary"}>
          {source === "europe-pmc" ? "🟢 Live from EuropePMC" : "⚪ Fallback data"}
        </Badge>
        <span className="text-xs text-muted-foreground">Updated in real time from Europe PMC database</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-xl shimmer-bg" />)}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FlaskConical size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No articles found. Try refreshing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {articles.map((article, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50 hover:border-border transition-colors duration-200">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <BookOpen size={15} className="text-teal-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground leading-snug mb-1.5 line-clamp-2">{article.title}</h3>
                      {article.abstract && <p className="text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-2">{article.abstract}</p>}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="teal" className="text-[10px]">
                          <Calendar size={9} /> {article.year || "N/A"}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground truncate">{article.publisher}</span>
                        {article.doi && (
                          <Badge variant="outline" className="text-[10px]">DOI</Badge>
                        )}
                      </div>
                    </div>
                    {article.url && (
                      <a href={article.url} target="_blank" rel="noopener noreferrer"
                        className="flex-shrink-0 p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-violet-400 transition-colors">
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <div className="text-center text-xs text-muted-foreground/50 pt-2">
        Articles are sourced from Europe PubMed Central — open access peer-reviewed research
      </div>
    </div>
  );
};

export default ResearchHub;
