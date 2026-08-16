import React from "react";
import { ShieldCheck, Star, Users, CheckCircle2, ShoppingBag, GitFork, ArrowUpRight } from "lucide-react";
import { EpistemicProvenanceBadge, type EpistemicStatus } from "@/components/chat/EpistemicProvenanceBadge";

export interface AgentReputationProps {
  id: string;
  name: string;
  creator: string;
  category: "F-Commerce" | "Tax & Legal" | "Logistics" | "Publishing" | "Research";
  trustScore: number; // e.g. 98.6
  ordersCompleted: number;
  totalVolumeBdt: number;
  status: EpistemicStatus;
  forkPriceBdt: number; // e.g. 100 or 350
  modelName: string;
  description: string;
  onFork?: (agentId: string) => void;
  onChatWith?: (agentId: string) => void;
}

export function AgentReputationCard({
  id,
  name,
  creator,
  category,
  trustScore,
  ordersCompleted,
  totalVolumeBdt,
  status,
  forkPriceBdt,
  modelName,
  description,
  onFork,
  onChatWith,
}: AgentReputationProps) {
  return (
    <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-sm hover:shadow-md transition-all duration-200 space-y-3">
      {/* Header with Category & Provenance Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
            {category}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            by @{creator}
          </span>
        </div>
        <EpistemicProvenanceBadge
          status={status}
          provenance={{
            confidenceScore: trustScore,
            modelHandle: modelName,
            sourceCount: ordersCompleted,
          }}
        />
      </div>

      {/* Title & Description */}
      <div>
        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          {name}
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" />
        </h4>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Trust & Activity Metrics */}
      <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl bg-secondary/40 border border-border/30 text-center font-mono">
        <div>
          <span className="block text-[9px] text-muted-foreground uppercase">Trust Score</span>
          <span className="text-xs font-bold text-emerald-500">{trustScore}%</span>
        </div>
        <div>
          <span className="block text-[9px] text-muted-foreground uppercase">Orders</span>
          <span className="text-xs font-bold text-foreground">{ordersCompleted.toLocaleString()}</span>
        </div>
        <div>
          <span className="block text-[9px] text-muted-foreground uppercase">Volume</span>
          <span className="text-xs font-bold text-foreground">৳{totalVolumeBdt.toLocaleString()}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => onChatWith?.(id)}
          className="flex-1 py-1.5 px-3 rounded-xl bg-secondary/80 hover:bg-secondary text-xs font-semibold text-foreground transition flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>Chat</span>
          <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
        </button>

        <button
          type="button"
          onClick={() => onFork?.(id)}
          className="flex-1 py-1.5 px-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer shadow-xs"
        >
          <GitFork className="w-3 h-3" />
          <span>Fork (৳{forkPriceBdt})</span>
        </button>
      </div>
    </div>
  );
}
