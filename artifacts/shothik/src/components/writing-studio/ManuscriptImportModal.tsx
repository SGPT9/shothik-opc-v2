import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  Check,
  X,
  Sparkles,
  Layers,
  ArrowRight,
  Languages,
  BookOpen,
  FileUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseRawManuscript, type ParsedManuscript } from "@/lib/manuscriptParser";
import { cn } from "@/lib/utils";

interface ManuscriptImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (projectData: {
    title: string;
    chapters: Array<{
      id: string;
      title: string;
      synopsis: string;
      content: string;
      wordCount: number;
    }>;
  }) => void;
}

export function ManuscriptImportModal({
  isOpen,
  onClose,
  onImport,
}: ManuscriptImportModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedManuscript | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const text = await file.text();
      const result = parseRawManuscript(text, file.name);
      setParsedResult(result);
      setCustomTitle(result.title);
    } catch (e: any) {
      console.error("Failed to read file:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedResult) return;
    onImport({
      title: customTitle.trim() || parsedResult.title,
      chapters: parsedResult.chapters,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileUp className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Import Existing Manuscript</h2>
              <p className="text-xs text-muted-foreground">
                Drop Word documents, text files, or Bijoy drafts to auto-split chapters.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {!parsedResult ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-4",
                dragActive
                  ? "border-indigo-500 bg-indigo-500/10 scale-[0.99]"
                  : "border-border/80 hover:border-indigo-500/50 hover:bg-muted/30"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.docx,.doc,.pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />

              <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Upload className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  Click to upload or drag and drop manuscript
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports <strong>.txt, .md, .docx, .doc, and Bijoy ANSI</strong> files
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 text-[11px] text-muted-foreground font-mono">
                <span className="bg-muted px-2 py-0.5 rounded">Smart Chapter Splitter</span>
                <span>•</span>
                <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">Bijoy Auto-Convert</span>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Title & Metadata */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Book Title</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2 text-sm font-semibold text-foreground outline-none focus:border-indigo-500"
                  placeholder="Enter book title…"
                />
              </div>

              {/* Detected Format Badge */}
              <div className="flex items-center justify-between bg-muted/30 border border-border/80 rounded-xl px-4 py-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-400" />
                  <span className="font-semibold text-foreground">
                    {parsedResult.chapters.length} Chapters Detected
                  </span>
                  <span className="text-muted-foreground">({parsedResult.totalWords} words)</span>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  {parsedResult.detectedFormat === "bijoy_ansi" && (
                    <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Languages className="h-3 w-3" /> Bijoy ➔ Unicode Converted
                    </span>
                  )}
                  {parsedResult.detectedFormat === "unicode" && (
                    <span className="bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                      Unicode Bengali / English
                    </span>
                  )}
                  {parsedResult.detectedFormat === "markdown" && (
                    <span className="bg-purple-500/15 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full">
                      Markdown Headings
                    </span>
                  )}
                </div>
              </div>

              {/* Parsed Chapter List Preview */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Extracted Outline</label>
                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                  {parsedResult.chapters.map((ch, idx) => (
                    <div
                      key={ch.id}
                      className="flex items-start justify-between bg-card border border-border/60 rounded-xl p-3 text-xs"
                    >
                      <div className="space-y-1 min-w-0 flex-1 pr-3">
                        <p className="font-bold text-foreground truncate">{ch.title}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 italic">
                          {ch.synopsis || "No synopsis extracted."}
                        </p>
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground shrink-0 bg-muted px-2 py-1 rounded-md">
                        {ch.wordCount} words
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between">
          {parsedResult ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setParsedResult(null)}
              className="text-xs cursor-pointer"
            >
              Upload Different File
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs cursor-pointer">
              Cancel
            </Button>
            {parsedResult && (
              <Button
                size="sm"
                onClick={handleConfirmImport}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
              >
                <span>Open in Writing Studio</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManuscriptImportModal;
