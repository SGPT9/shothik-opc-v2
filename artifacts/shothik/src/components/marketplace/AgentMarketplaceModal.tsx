import React, { useState } from "react";
import {
  Store,
  Search,
  Sparkles,
  Download,
  CheckCircle2,
  Star,
  ShieldCheck,
  Video,
  FileText,
  BookOpen,
  Code,
  Zap,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { agentMarketplaceService, AgentMarketplaceItem } from "@/lib/marketplace/agent-marketplace-service";

export interface AgentMarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AgentMarketplaceModal({ isOpen, onClose }: AgentMarketplaceModalProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [installedMap, setInstalledMap] = useState<Record<string, boolean>>({});

  const catalog = agentMarketplaceService.getCatalog(activeCategory, searchQuery);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Video":
        return <Video className="w-5 h-5 text-rose-400" />;
      case "FileText":
        return <FileText className="w-5 h-5 text-amber-400" />;
      case "BookOpen":
        return <BookOpen className="w-5 h-5 text-emerald-400" />;
      default:
        return <Code className="w-5 h-5 text-cyan-400" />;
    }
  };

  const handleInstall = async (item: AgentMarketplaceItem) => {
    try {
      await agentMarketplaceService.installAgentWithCredits(item.id);
      setInstalledMap((prev) => ({ ...prev, [item.id]: true }));
    } catch (err: any) {
      console.warn("Marketplace install error:", err?.message || err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl bg-zinc-950/95 border-zinc-800 text-white shadow-2xl p-0 overflow-hidden rounded-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/70">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-md">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                Emporium — Agentic Books, Standards & Creations
                <Badge variant="outline" className="border-violet-500/40 text-violet-400 text-[10px]">
                  Shothik Emporium
                </Badge>
              </DialogTitle>
              <p className="text-xs text-zinc-400">
                Discover 1-click domain AI agents with 80/20 bKash creator revenue monetization
              </p>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-5 border-b border-zinc-800/80 bg-zinc-900/30 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            {["all", "f-commerce", "vat-tax", "nilkhet-publishing", "developer-swarm"].map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={activeCategory === cat ? "default" : "ghost"}
                onClick={() => setActiveCategory(cat)}
                className={
                  activeCategory === cat
                    ? "bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs"
                    : "text-zinc-400 hover:text-white text-xs"
                }
              >
                {cat === "all"
                  ? "All Emporium Presets"
                  : cat === "f-commerce"
                  ? "F-Commerce"
                  : cat === "vat-tax"
                  ? "Tax & VAT"
                  : cat === "nilkhet-publishing"
                  ? "Nilkhet Books"
                  : "Dev Swarm"}
              </Button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-900 rounded-xl border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              placeholder="Search Emporium agents & skills..."
            />
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
          {catalog.map((item) => {
            const isInstalled = Boolean(installedMap[item.id]);

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-zinc-800/80 border border-zinc-700/50">
                        {getIcon(item.iconName)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{item.name}</h4>
                        <p className="text-[11px] text-zinc-400">By {item.authorName}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-zinc-800 text-amber-400 text-[10px] flex items-center gap-1 font-mono">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {item.rating}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">{item.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50 text-xs">
                  <div className="flex items-center gap-3 text-zinc-400 text-[11px] font-mono">
                    <span>{item.installsCount.toLocaleString()} installs</span>
                    <span className="text-emerald-400 font-bold">
                      {item.priceCredits === 0 ? "FREE" : `৳${item.priceCredits}`}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleInstall(item)}
                    disabled={isInstalled}
                    className={
                      isInstalled
                        ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[11px] h-7"
                        : "bg-violet-600 hover:bg-violet-500 text-white font-bold text-[11px] h-7"
                    }
                  >
                    {isInstalled ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Installed
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3 mr-1" />
                        Install to Emporium
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-800 bg-zinc-900/80 text-xs">
          <span className="text-zinc-500 font-mono flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-violet-400" />
            Emporium 80/20 Creator Revenue Split Active (Settles via bKash / Nagad)
          </span>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-zinc-400 hover:text-white">
            Close Emporium
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
