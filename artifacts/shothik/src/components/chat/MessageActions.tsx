

import { useState } from "react";
import { Copy, Check, RotateCcw, Square, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageActionsProps {
  canRegenerate?: boolean;
  canStop?: boolean;
  onCopy?: () => void;
  onDelete?: () => void;
  onRegenerate?: () => void;
  onStop?: () => void;
}

export function MessageActions({
  canRegenerate,
  canStop,
  onCopy,
  onDelete,
  onRegenerate,
  onStop,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={handleCopy}
        aria-label="Copy message"
        title={copied ? "Copied" : "Copy message"}
      >
        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
      </Button>
      {canRegenerate ? (
        <Button type="button" variant="ghost" size="icon-sm" onClick={onRegenerate} aria-label="Regenerate response" title="Regenerate response">
          <RotateCcw className="h-4 w-4" />
        </Button>
      ) : null}
      {canStop ? (
        <Button type="button" variant="ghost" size="icon-sm" onClick={onStop} aria-label="Stop response" title="Stop response">
          <Square className="h-4 w-4" />
        </Button>
      ) : null}
      <Button type="button" variant="ghost" size="icon-sm" onClick={onDelete} aria-label="Delete message" title="Delete message">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
