import React, { useMemo } from "react";
import {
  FileText,
  Table2,
  Code2,
  Image as ImageIcon,
  File,
  X,
  Coins,
  AlertTriangle,
} from "lucide-react";

export interface RichComposerAttachment {
  id: string;
  name: string;
  sizeBytes?: number;
  mimeType?: string;
  preview?: string;
  status?: "ready" | "uploading" | "error";
  error?: string;
  estimatedTokens?: number;
}

export interface FileAttachmentBarProps {
  attachments: RichComposerAttachment[];
  onRemoveAttachment: (id: string) => void;
  maxContextTokens?: number;
  className?: string;
}

/**
 * Estimates token count based on file size and extension
 */
export function estimateFileTokens(name: string, sizeBytes?: number): number {
  if (!sizeBytes || sizeBytes <= 0) return 150; // baseline placeholder
  const ext = name.split(".").pop()?.toLowerCase();

  // Images in multimodal context have standard tile pricing (~85-255 tokens)
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext || "")) {
    return 258;
  }

  // Text / Code / CSV / Markdown files average ~4 bytes per token
  if (["txt", "md", "csv", "json", "ts", "js", "py", "html", "css"].includes(ext || "")) {
    return Math.max(10, Math.round(sizeBytes / 4));
  }

  // PDFs include formatting overhead, average ~3 bytes per token of extracted text
  if (ext === "pdf") {
    return Math.max(50, Math.round(sizeBytes / 3.2));
  }

  return Math.max(20, Math.round(sizeBytes / 4.5));
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileCategory(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext)) {
    return { label: ext.toUpperCase(), color: "bg-purple-500/15 text-purple-400 border-purple-500/30", Icon: ImageIcon };
  }
  if (["pdf"].includes(ext)) {
    return { label: "PDF", color: "bg-rose-500/15 text-rose-400 border-rose-500/30", Icon: FileText };
  }
  if (["csv", "tsv", "xlsx", "xls"].includes(ext)) {
    return { label: ext.toUpperCase(), color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", Icon: Table2 };
  }
  if (["ts", "tsx", "js", "jsx", "py", "json", "rs", "go", "sql"].includes(ext)) {
    return { label: ext.toUpperCase(), color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30", Icon: Code2 };
  }
  return { label: (ext || "FILE").toUpperCase(), color: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30", Icon: File };
}

export function FileAttachmentBar({
  attachments,
  onRemoveAttachment,
  maxContextTokens = 128000,
  className = "",
}: FileAttachmentBarProps) {
  if (!attachments || attachments.length === 0) return null;

  const totalEstimatedTokens = useMemo(() => {
    return attachments.reduce((acc, att) => {
      const tokens = att.estimatedTokens ?? estimateFileTokens(att.name, att.sizeBytes);
      return acc + tokens;
    }, 0);
  }, [attachments]);

  const contextUsagePercent = Math.min(100, (totalEstimatedTokens / maxContextTokens) * 100);
  const isHighTokenLoad = contextUsagePercent > 70;

  return (
    <div className={`px-3.5 pt-2.5 pb-2 space-y-2 select-none border-b border-border/40 bg-muted/20 ${className}`}>
      {/* File Card Carousel / Grid */}
      <div className="flex flex-wrap gap-2 items-center">
        {attachments.map((att) => {
          const cat = getFileCategory(att.name);
          const Icon = cat.Icon;
          const tokens = att.estimatedTokens ?? estimateFileTokens(att.name, att.sizeBytes);

          return (
            <div
              key={att.id}
              className="relative group flex items-center gap-2 p-1.5 pr-2 rounded-xl bg-card border border-border/80 shadow-2xs hover:border-border transition max-w-[240px]"
            >
              {/* Thumbnail or File Icon */}
              {att.preview ? (
                <img
                  src={att.preview}
                  alt={att.name}
                  className="h-9 w-9 object-cover rounded-lg shrink-0 border border-border/50"
                />
              ) : (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${cat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              )}

              {/* Metadata */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-xs font-semibold text-foreground">
                    {att.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                  {att.sizeBytes ? <span>{formatFileSize(att.sizeBytes)}</span> : null}
                  {att.sizeBytes ? <span>•</span> : null}
                  <span className="text-emerald-500 font-semibold">~{tokens.toLocaleString()} tok</span>
                </div>
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => onRemoveAttachment(att.id)}
                aria-label={`Remove ${att.name}`}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Aggregate Token Footprint Bar (LibreChat-Style) */}
      <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-0.5">
        <span className="flex items-center gap-1.5">
          <Coins className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {attachments.length} file{attachments.length > 1 ? "s" : ""} • ~
            <strong className="text-foreground">{totalEstimatedTokens.toLocaleString()}</strong> tokens
            ({contextUsagePercent.toFixed(1)}% of {Math.round(maxContextTokens / 1000)}k window)
          </span>
        </span>

        {isHighTokenLoad && (
          <span className="flex items-center gap-1 text-amber-400 font-semibold text-[10px]">
            <AlertTriangle className="w-3 h-3" />
            <span>High context footprint</span>
          </span>
        )}
      </div>
    </div>
  );
}
