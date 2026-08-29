

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";

const ButtonSampleText = ({
  className = "",
  sample = "",
  onApply,
  onClick = undefined,
  isTooltip = true,
  children = null,
  ...props
}) => {
  const handleSampleText = () => {
    try {
      const defaultSample =
        "The city buzzed with energy as crowds assembled for the annual parade. Vibrant floats and lively marching bands infused the atmosphere with music and joy, while spectators lined the streets, applauding and waving as the procession moved along.";
      const textToApply = sample || defaultSample;
      onApply?.(textToApply);
    } catch (error) {
      console.error("Failed to apply sample text:", error);
    }
  };

  const button = (
    <Button
      variant="outline"
      size="sm"
      className={cn("shrink-0 whitespace-nowrap", className)}
      onClick={(e) => {
        handleSampleText();
        onClick?.(e);
      }}
      {...props}
    >
      <FileText className="size-4" />
      Try Sample
    </Button>
  );

  if (!isTooltip) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="top">
        <p>Try sample text</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default ButtonSampleText;
