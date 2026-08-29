

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ClipboardPaste } from "lucide-react";

import { toast } from "react-toastify";

const ButtonPasteText = ({
  className = "",
  onApply,
  onClick = undefined,
  isTooltip = true,
  children = null,
  ...props
}) => {
  const handlePaste = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          onApply?.(text);
          toast.success("Pasted from clipboard");
          return;
        }
      }
      toast.info("Please paste text using Ctrl+V or Cmd+V");
    } catch (error) {
      console.warn("Failed to read clipboard:", error);
      toast.info("Please paste text using Ctrl+V or Cmd+V");
    }
  };

  const button = (
    <Button
      variant="outline"
      size="sm"
      className={cn("shrink-0 whitespace-nowrap", className)}
      onClick={(e) => {
        handlePaste();
        onClick?.(e);
      }}
      {...props}
    >
      <ClipboardPaste className="size-4" />
      Paste Text
    </Button>
  );

  if (!isTooltip) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="top">
        <p>Paste text</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default ButtonPasteText;
