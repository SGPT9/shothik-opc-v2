"use client";

import React, { useState } from "react";
import {
  Users,
  MessageSquare,
  Sparkles,
  Heart,
  Share2,
  TrendingUp,
  Filter,
  Plus,
  CheckCircle2,
  Tag,
  ArrowUpRight,
  ExternalLink
} from "lucide-react";
import { LiquidGlassCard } from "@/components/chat/LiquidGlassCard";
import { cn } from "@/lib/utils";

interface CommunityItem {
  id: string;
  title: string;
  author: string;
  authorHandle: string;
  badge: string;
  category: "Prompt" | "Slide Deck" | "Financial Model" | "Book Plan";
  description: string;
  likes: number;
  comments: number;
  forks: number;
  tags: string[];
}

const COMMUNITY_POSTS: CommunityItem[] = [
  {
    id: "comm-01",
    title: "📊 10-Slide Investor Pitch Deck (South Asian F-Commerce)",
    author: "Tanveer Ahmed",
    authorHandle: "@tanveer_bd",
    badge: "Featured",
    category: "Slide Deck",
    description: "Battle-tested 16:9 pitch deck template with unit economics, Steadfast courier logistics model, and bKash transaction TAM slides.",
    likes: 142,
    comments: 28,
    forks: 54,
    tags: ["pitch-deck", "ecommerce", "bangladesh", "venture"],
  },
  {
    id: "comm-02",
    title: "⚖️ NBR Income Tax Act 2023 Section 78 Rebate Calculator",
    author: "Barrister Rafiq",
    authorHandle: "@rafiq_legal",
    badge: "Verified Law",
    category: "Financial Model",
    description: "Spreadsheet artifact calculating personal income tax brackets, corporate VAT deductions, and statutory investment rebates under current Bangladesh law.",
    likes: 89,
    comments: 14,
    forks: 32,
    tags: ["nbr", "tax", "bangladesh-law", "finance"],
  },
  {
    id: "comm-03",
    title: "📖 অমর একুশে ঐতিহাসিক উপন্যাস আউটলাইন (Historical Fiction Scaffold)",
    author: "Nusrat Jahan",
    authorHandle: "@nusrat_writes",
    badge: "Top Author",
    category: "Book Plan",
    description: "Chapter-by-chapter beat sheet for a 1952 Language Movement novel designed for Nilkhet 6x9 Royal Demy printing specs.",
    likes: 210,
    comments: 45,
    forks: 67,
    tags: ["boimela", "novel", "bangla-literature", "nilkhet"],
  },
  {
    id: "comm-04",
    title: "⚡ bKash & Nagad Speculative Gatekeeper Node.js Express Template",
    author: "Dev Fahim",
    authorHandle: "@fahim_dev",
    badge: "Developer Tool",
    category: "Prompt",
    description: "Zero-latency Cloudflare OS style Gatekeeper interceptor with TrxID idempotency and automatic SMS settlement callbacks.",
    likes: 178,
    comments: 31,
    forks: 92,
    tags: ["gatekeeper", "mfs", "bkash", "nodejs"],
  },
];

export function CommunityArtifact({
  onForkArtifact,
}: {
  onForkArtifact?: (item: CommunityItem) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const toggleLike = (id: string) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = COMMUNITY_POSTS.filter((post) => {
    if (selectedCategory === "ALL") return true;
    return post.category === selectedCategory;
  });

  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Users className="h-4 w-4 text-brand" />
              <span>Community Showcase & Public Artifacts</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand/10 text-brand border border-brand/20">
              Live Hub
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Discover, fork, and remix AI-generated slide decks, financial models, legal formulas, and book plans
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/community"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand text-brand-foreground hover:opacity-90 transition"
          >
            <span>Full Community Forum</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {["ALL", "Slide Deck", "Financial Model", "Book Plan", "Prompt"].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0",
              selectedCategory === cat
                ? "bg-brand text-brand-foreground shadow-sm"
                : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Community Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const isLiked = likedPosts[item.id];

          return (
            <LiquidGlassCard
              key={item.id}
              palette="indigo"
              className="p-4 space-y-3 border border-border/60 hover:border-brand/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-foreground leading-tight">{item.title}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    {item.badge}
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
                  {item.description}
                </p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {item.tags.map((t) => (
                    <span key={t} className="px-1.5 py-0.5 rounded bg-muted/60 text-[9px] font-mono text-muted-foreground">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Meta & Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground">{item.author}</span>
                  <span className="text-[10px] font-mono text-muted-foreground/70">{item.authorHandle}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleLike(item.id)}
                    className={cn(
                      "flex items-center gap-1 text-[11px] font-mono transition cursor-pointer",
                      isLiked ? "text-rose-400 font-bold" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Heart className={cn("h-3 w-3", isLiked && "fill-current")} />
                    <span>{item.likes + (isLiked ? 1 : 0)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onForkArtifact && onForkArtifact(item)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-brand/10 hover:bg-brand/20 border border-brand/20 text-brand text-[11px] font-semibold transition cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Fork ({item.forks})</span>
                  </button>
                </div>
              </div>
            </LiquidGlassCard>
          );
        })}
      </div>
    </div>
  );
}

export default CommunityArtifact;
