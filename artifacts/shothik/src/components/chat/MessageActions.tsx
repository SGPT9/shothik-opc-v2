/**
 * Enhanced Message Actions Component (Subsystem 2)
 * Supports: Copy, Edit, Regenerate, Retry, Continue, Stop, Like/Dislike, Bookmark, Share, Export, Branch
 */

import { useState } from "react";
import {
  Copy,
  Check,
  RotateCcw,
  Square,
  Trash2,
  Edit3,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Share2,
  Download,
  GitBranch,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MessageActionsProps {
  messageId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  canRegenerate?: boolean;
  canStop?: boolean;
  canContinue?: boolean;
  isBookmarked?: boolean;
  userReaction?: 'like' | 'dislike' | null;
  onCopy?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onRegenerate?: () => void;
  onRetry?: () => void;
  onContinue?: () => void;
  onStop?: () => void;
  onReaction?: (reaction: 'like' | 'dislike') => void;
  onBookmark?: () => void;
  onShare?: () => void;
  onExport?: (format: 'markdown' | 'json' | 'text') => void;
  onBranch?: () => void;
}

export function MessageActions({
  messageId,
  role,
  content,
  canRegenerate,
  canStop,
  canContinue,
  isBookmarked = false,
  userReaction = null,
  onCopy,
  onDelete,
  onEdit,
  onRegenerate,
  onRetry,
  onContinue,
  onStop,
  onReaction,
  onBookmark,
  onShare,
  onExport,
  onBranch,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [reaction, setReaction] = useState<'like' | 'dislike' | null>(userReaction);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
    } else {
      navigator.clipboard.writeText(content);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    onBookmark?.();
  };

  const handleReaction = (type: 'like' | 'dislike') => {
    const nextReaction = reaction === type ? null : type;
    setReaction(nextReaction);
    if (type) {
      onReaction?.(type);
    }
  };

  const handleExport = (format: 'markdown' | 'json' | 'text') => {
    setShowExportMenu(false);
    if (onExport) {
      onExport(format);
    } else {
      let data = content;
      let filename = `message-${messageId}.${format === 'markdown' ? 'md' : format}`;
      if (format === 'json') {
        data = JSON.stringify({ messageId, role, content, timestamp: new Date().toISOString() }, null, 2);
      }
      const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity bg-neutral-900/60 backdrop-blur-md p-1 rounded-lg border border-neutral-800/60 shadow-sm text-xs text-neutral-400">
      {/* Copy */}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={handleCopy}
        aria-label="Copy message"
        title={copied ? "Copied" : "Copy text"}
        className="h-7 w-7 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>

      {/* Edit User Message */}
      {role === 'user' && onEdit ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onEdit}
          aria-label="Edit message"
          title="Edit prompt"
          className="h-7 w-7 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80"
        >
          <Edit3 className="h-3.5 w-3.5" />
        </Button>
      ) : null}

      {/* Assistant Specific Actions */}
      {role === 'assistant' ? (
        <>
          {/* Like / Dislike */}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => handleReaction('like')}
            aria-label="Like response"
            title="Good response"
            className={cn(
              "h-7 w-7 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80",
              reaction === 'like' && "text-emerald-400 bg-emerald-950/30"
            )}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => handleReaction('dislike')}
            aria-label="Dislike response"
            title="Poor response"
            className={cn(
              "h-7 w-7 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80",
              reaction === 'dislike' && "text-rose-400 bg-rose-950/30"
            )}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </Button>

          {/* Continue Generation */}
          {canContinue ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onContinue}
              aria-label="Continue response"
              title="Continue generation"
              className="h-7 w-7 text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/30"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
            </Button>
          ) : null}

          {/* Regenerate */}
          {canRegenerate ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onRegenerate || onRetry}
              aria-label="Regenerate response"
              title="Regenerate"
              className="h-7 w-7 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          ) : null}

          {/* Branch Conversation */}
          {onBranch ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onBranch}
              aria-label="Branch conversation"
              title="Fork conversation from here"
              className="h-7 w-7 text-purple-400 hover:text-purple-200 hover:bg-purple-950/30"
            >
              <GitBranch className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </>
      ) : null}

      {/* Stop Streaming */}
      {canStop ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onStop}
          aria-label="Stop response"
          title="Stop generating"
          className="h-7 w-7 text-rose-400 hover:text-rose-200 hover:bg-rose-950/40"
        >
          <Square className="h-3.5 w-3.5 fill-current" />
        </Button>
      ) : null}

      {/* Bookmark */}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={handleBookmark}
        aria-label="Bookmark message"
        title={bookmarked ? "Bookmarked" : "Save bookmark"}
        className={cn(
          "h-7 w-7 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80",
          bookmarked && "text-amber-400 fill-amber-400/20"
        )}
      >
        <Bookmark className={cn("h-3.5 w-3.5", bookmarked && "fill-current")} />
      </Button>

      {/* Share */}
      {onShare ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onShare}
          aria-label="Share message"
          title="Share message excerpt"
          className="h-7 w-7 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80"
        >
          <Share2 className="h-3.5 w-3.5" />
        </Button>
      ) : null}

      {/* Export */}
      <div className="relative">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setShowExportMenu(!showExportMenu)}
          aria-label="Export message"
          title="Export message"
          className="h-7 w-7 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80"
        >
          <Download className="h-3.5 w-3.5" />
        </Button>

        {showExportMenu ? (
          <div className="absolute right-0 bottom-full mb-1 w-32 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl py-1 z-50 text-xs">
            <button
              onClick={() => handleExport('markdown')}
              className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 text-neutral-300 transition-colors"
            >
              Export as .MD
            </button>
            <button
              onClick={() => handleExport('text')}
              className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 text-neutral-300 transition-colors"
            >
              Export as Plain Text
            </button>
            <button
              onClick={() => handleExport('json')}
              className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 text-neutral-300 transition-colors"
            >
              Export as JSON
            </button>
          </div>
        ) : null}
      </div>

      {/* Delete */}
      {onDelete ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          aria-label="Delete message"
          title="Delete message"
          className="h-7 w-7 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/30"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ) : null}
    </div>
  );
}
