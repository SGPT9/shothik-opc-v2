import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AskOption {
  label: string;
  value: string;
  description?: string;
}

export interface AskOptionsProps {
  options: AskOption[];
  multiSelect?: boolean;
  selectedValues?: string[];
  locked?: boolean;
  onSelectOption: (value: string) => void;
  onSubmitBatch?: (values: string[]) => void;
  className?: string;
}

/**
 * Interactive choice pill component adapted from LibreChat.
 * Renders structured options when the assistant asks a clarification or multiple-choice question.
 */
export function AskOptions({
  options,
  multiSelect = false,
  selectedValues = [],
  locked = false,
  onSelectOption,
  onSubmitBatch,
  className,
}: AskOptionsProps) {
  const [internalSelected, setInternalSelected] = React.useState<string[]>(selectedValues);

  const handleToggle = (value: string) => {
    if (locked) return;
    if (multiSelect) {
      const next = internalSelected.includes(value)
        ? internalSelected.filter((v) => v !== value)
        : [...internalSelected, value];
      setInternalSelected(next);
      onSelectOption(value);
    } else {
      setInternalSelected([value]);
      onSelectOption(value);
    }
  };

  const handleBatchConfirm = () => {
    if (locked || internalSelected.length === 0) return;
    onSubmitBatch?.(internalSelected);
  };

  return (
    <div className={cn("mt-3 space-y-2 select-none", className)}>
      <div className="flex flex-wrap gap-2">
        {options.map((option, index) => {
          const isSelected = internalSelected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              disabled={locked}
              onClick={() => handleToggle(option.value)}
              className={cn(
                "group inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all shadow-2xs",
                isSelected
                  ? "border-brand bg-brand/10 text-brand dark:border-brand/80 dark:bg-brand/20 dark:text-brand"
                  : "border-border/80 bg-background/80 hover:bg-muted/60 text-foreground/80 hover:text-foreground hover:border-border",
                locked && "opacity-60 cursor-not-allowed pointer-events-none",
              )}
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-md text-[10px] font-mono",
                  isSelected
                    ? "bg-brand text-brand-foreground"
                    : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/20",
                )}
              >
                {isSelected ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : index + 1}
              </span>
              <span>{option.label}</span>
              {option.description && (
                <span className="text-[10px] text-muted-foreground opacity-80 font-normal">
                  ({option.description})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {multiSelect && internalSelected.length > 0 && !locked && (
        <div className="flex justify-start pt-1">
          <button
            type="button"
            onClick={handleBatchConfirm}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1 text-xs font-semibold text-brand-foreground shadow-xs hover:bg-brand/90 transition"
          >
            <span>Confirm Selections</span>
            <span className="text-[10px] opacity-80 font-mono">({internalSelected.length})</span>
          </button>
        </div>
      )}
    </div>
  );
}
