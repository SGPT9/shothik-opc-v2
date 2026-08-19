import { useState } from "react";
import { Copy, Check, Share2, Globe, MessageSquare, Linkedin, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareArtifactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  artifactType?: string;
  slug?: string;
}

export function ShareArtifactModal({
  open,
  onOpenChange,
  title = "Shothik AI Generated Workspace",
  artifactType = "report",
  slug = "shared-session",
}: ShareArtifactModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/share/${slug}?t=${Date.now().toString(36)}`
    : `https://shothik-web-mirror-v2.vercel.app/share/${slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Check out this ${artifactType} generated with Shothik AI: ${title}\n\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleLinkedInShare = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-popover/95 backdrop-blur-2xl border border-border/80 p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Share Public Link</h3>
              <p className="text-[11px] text-muted-foreground">Anyone with this link can view this artifact</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Public URL Box */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            Public Web Link
          </label>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/60 border border-border">
            <Globe className="h-4 w-4 text-brand shrink-0" />
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent text-xs text-foreground outline-none font-mono truncate"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer shrink-0 shadow-xs",
                copied
                  ? "bg-emerald-500 text-zinc-950 font-bold"
                  : "bg-brand hover:bg-brand/90 text-white"
              )}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 1-Tap Social Share Channels */}
        <div className="pt-2 border-t border-border/40 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            1-Tap Social Broadcast
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" />
              <span>WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={handleLinkedInShare}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-semibold transition cursor-pointer"
            >
              <Linkedin className="h-4 w-4" />
              <span>LinkedIn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
