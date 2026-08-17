import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Download, Presentation, Table as TableIcon, X, File, FileCode2, ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";

export interface PdfPage {
  content: string;
}

export interface ArtifactPaneProps {
  isOpen: boolean;
  onClose: () => void;
  artifactType?: "markdown" | "slides" | "sheet" | "pdf";
  content?: string;
  /** Structured PDF pages; when provided, pagination controls are shown. */
  pdfPages?: PdfPage[];
  title?: string;
}

function ArtifactEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center border border-border border-dashed">
        <FileCode2 className="w-8 h-8 text-muted-foreground/50" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-foreground">Waiting for artifact</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
          The generated document, slide deck, or sheet will appear here.
        </p>
      </div>
    </div>
  );
}

export function ArtifactPane({
  isOpen,
  onClose,
  artifactType = "markdown",
  content,
  pdfPages,
  title = "Untitled Artifact"
}: ArtifactPaneProps) {
  const [pdfPageIndex, setPdfPageIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displayContent = content;

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-border bg-muted/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand/10 text-brand">
            {artifactType === "markdown" && <FileText className="w-4 h-4" />}
            {artifactType === "slides" && <Presentation className="w-4 h-4" />}
            {artifactType === "sheet" && <TableIcon className="w-4 h-4" />}
            {artifactType === "pdf" && <File className="w-4 h-4" />}
          </div>
          <span className="font-semibold text-sm truncate">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          {displayContent ? (
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 rounded-lg"
              title="Export"
              onClick={() => {
                const ext = artifactType === "markdown" || artifactType === "slides" ? "md" : artifactType === "sheet" ? "csv" : "txt";
                const blob = new Blob([displayContent], { type: "text/plain;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${title.replace(/[^\w.-]+/g, "_") || "artifact"}.${ext}`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="w-4 h-4" />
            </Button>
          ) : null}
          <Button variant="ghost" size="icon" onClick={onClose} className="w-8 h-8 rounded-lg">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <Tabs defaultValue="preview" className="flex-1 flex flex-col min-h-0">
        <div className="px-4 py-2 border-b border-border bg-muted/5 shrink-0">
          <TabsList className="bg-muted/50 border border-border/50">
            <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
            <TabsTrigger value="source" className="text-xs">Source</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="preview" className="flex-1 overflow-hidden m-0 data-[state=active]:flex flex-col">
          {artifactType === "slides" ? (
            displayContent ? (
              <ScrollArea className="flex-1">
                <div className="p-6">
                  <div className="prose dark:prose-invert prose-sm max-w-none prose-headings:text-foreground prose-a:text-brand prose-strong:text-foreground">
                    <ReactMarkdown>{displayContent}</ReactMarkdown>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <ScrollArea className="flex-1">
                <div className="p-6">
                  <ArtifactEmptyState />
                </div>
              </ScrollArea>
            )
          ) : artifactType === "sheet" ? (
            displayContent ? (
              <ScrollArea className="flex-1">
                <div className="p-6">
                  <div className="prose dark:prose-invert prose-sm max-w-none prose-headings:text-foreground prose-a:text-brand prose-strong:text-foreground prose-table:border prose-th:border prose-th:border-border prose-th:px-3 prose-th:py-1.5 prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-1.5">
                    <ReactMarkdown>{displayContent}</ReactMarkdown>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <ScrollArea className="flex-1">
                <div className="p-6">
                  <ArtifactEmptyState />
                </div>
              </ScrollArea>
            )
          ) : artifactType === "pdf" ? (
             <div className="flex-1 flex flex-col items-center bg-muted/30 p-4">
               <div className="w-full max-w-3xl flex-1 bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-border flex flex-col">
                 {pdfPages && pdfPages.length > 0 && (
                   <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-muted/50 rounded-t-lg shrink-0">
                      <span className="text-xs font-medium text-muted-foreground">
                        Page {pdfPageIndex + 1} of {pdfPages.length}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          disabled={pdfPageIndex === 0}
                          onClick={() => setPdfPageIndex((i) => Math.max(0, i - 1))}
                        >
                          <ChevronLeft className="w-4 h-4"/>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          disabled={pdfPageIndex >= pdfPages.length - 1}
                          onClick={() => setPdfPageIndex((i) => Math.min(pdfPages.length - 1, i + 1))}
                        >
                          <ChevronRight className="w-4 h-4"/>
                        </Button>
                      </div>
                   </div>
                 )}
                 <div className="flex-1 p-12 overflow-y-auto">
                    {pdfPages && pdfPages.length > 0 ? (
                      <div className="prose dark:prose-invert prose-sm max-w-none font-serif prose-headings:text-foreground prose-a:text-brand prose-strong:text-foreground">
                        <ReactMarkdown>{pdfPages[pdfPageIndex]?.content || ""}</ReactMarkdown>
                      </div>
                    ) : displayContent ? (
                      <div className="prose dark:prose-invert prose-sm max-w-none font-serif prose-headings:text-foreground prose-a:text-brand prose-strong:text-foreground">
                        <ReactMarkdown>{displayContent}</ReactMarkdown>
                      </div>
                    ) : (
                      <ArtifactEmptyState />
                    )}
                 </div>
               </div>
             </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="p-6">
                {displayContent ? (
                  <div className="prose dark:prose-invert prose-sm max-w-none prose-headings:text-foreground prose-a:text-brand prose-strong:text-foreground">
                    <ReactMarkdown>{displayContent}</ReactMarkdown>
                  </div>
                ) : (
                  <ArtifactEmptyState />
                )}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="source" className="flex-1 overflow-hidden m-0 data-[state=active]:flex flex-col">
          <ScrollArea className="flex-1 bg-muted/20">
            <div className="p-6">
              <pre className="text-[11px] text-muted-foreground font-mono whitespace-pre-wrap leading-relaxed">
                {content || "No source code available."}
              </pre>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}