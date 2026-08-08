import React from "react";
import { FolderTree, BookOpen, CheckCircle2, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ChapterItem } from "../hooks/useBookManuscript";

export interface BookLeftChapterTreeProps {
  chapters: ChapterItem[];
  activeChapterId: string;
  onSelectChapter: (id: string) => void;
  onAddChapter?: () => void;
  totalWords: number;
}

export function BookLeftChapterTree({
  chapters,
  activeChapterId,
  onSelectChapter,
  onAddChapter,
  totalWords,
}: BookLeftChapterTreeProps) {
  return (
    <div className="flex h-full flex-col p-3 space-y-3 bg-muted/20 border-r border-border/80">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-foreground">
          <FolderTree className="h-4 w-4 text-indigo-400" />
          <span>Chapter Tree</span>
        </div>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-lg" onClick={onAddChapter}>
          <Plus className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </div>

      {/* Progress Counter Badge */}
      <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3 text-xs space-y-1">
        <div className="flex justify-between font-mono font-bold">
          <span className="text-muted-foreground">Words Written:</span>
          <span className="text-indigo-400 font-mono">{totalWords.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
          <span>Sources Verified: <strong className="text-emerald-400">47</strong></span>
          <span>Chapters: <strong className="text-foreground">{chapters.length}</strong></span>
        </div>
      </div>

      {/* Chapter Items List */}
      <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {chapters.map((ch) => (
          <button
            key={ch.id}
            onClick={() => onSelectChapter(ch.id)}
            className={cn(
              "flex w-full items-center justify-between rounded-xl border p-2.5 text-left text-xs font-medium transition",
              ch.id === activeChapterId
                ? "border-indigo-500 bg-indigo-500/10 text-indigo-400 font-semibold"
                : "border-border/80 bg-background text-foreground hover:bg-muted/60"
            )}
          >
            <div className="flex items-center gap-2 truncate">
              <BookOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{ch.title}</span>
            </div>
            {ch.id === activeChapterId && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-indigo-400" />}
          </button>
        ))}
      </div>

      {/* Team Roles */}
      <div className="pt-2 border-t border-border/80 text-[10px] space-y-1 font-mono text-muted-foreground">
        <p className="font-semibold text-foreground uppercase tracking-wider">Team Roles</p>
        <div className="flex justify-between items-center">
          <span>Nadia Rahman</span>
          <Badge variant="outline" className="text-[9px] py-0 px-1 border-indigo-500/30 text-indigo-400">Editor</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span>Sam Osei</span>
          <Badge variant="outline" className="text-[9px] py-0 px-1 border-cyan-500/30 text-cyan-400">Reviewer</Badge>
        </div>
      </div>
    </div>
  );
}
