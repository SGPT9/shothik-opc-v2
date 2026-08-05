import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Download, Code, Presentation, Table as TableIcon, X, File, FileCode2, ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";

export interface ArtifactPaneProps {
  isOpen: boolean;
  onClose: () => void;
  artifactType?: "markdown" | "slides" | "sheet" | "pdf";
  content?: string;
  title?: string;
}

const DEMO_MARKDOWN = `
# Global Market Analysis

This document outlines the quarterly performance of the top 3 technology sectors.

## Key Findings
1. **AI & Machine Learning**: 45% growth YoY.
2. **Cloud Infrastructure**: 22% growth YoY.
3. **Cybersecurity**: 18% growth YoY.

> "The shift towards generative models has accelerated adoption across all enterprise sizes."

### Recommendations
* Increase R&D budget by 15%
* Expand cloud footprint in APAC
* Launch security audit program
`;

const DEMO_SLIDES = [
  { title: "Market Analysis", subtitle: "Q3 Performance Review", bg: "bg-emerald-900/40" },
  { title: "Key Growth Areas", subtitle: "AI & Cloud leading the pack", bg: "bg-indigo-900/40" },
  { title: "Strategic Roadmap", subtitle: "Path to 2025", bg: "bg-slate-900/40" }
];

export function ArtifactPane({
  isOpen,
  onClose,
  artifactType = "markdown",
  content,
  title = "Untitled Artifact"
}: ArtifactPaneProps) {
  if (!isOpen) return null;

  const displayContent = content || (artifactType === "markdown" ? DEMO_MARKDOWN : undefined);

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
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg" title="Export">
            <Download className="w-4 h-4" />
          </Button>
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
            <div className="flex flex-col h-full bg-slate-950">
              {/* Main Slide Viewer */}
              <div className="flex-1 flex items-center justify-center p-8 relative">
                <div className="aspect-video w-full max-w-2xl bg-indigo-900/40 rounded-xl shadow-2xl border border-indigo-500/20 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
                  <h2 className="text-4xl font-bold text-white mb-4 z-10">Market Analysis</h2>
                  <p className="text-xl text-indigo-200 z-10">Q3 Performance Review</p>
                </div>
                <Button size="icon" variant="ghost" className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/50 hover:bg-background/80">
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button size="icon" variant="ghost" className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/50 hover:bg-background/80">
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </div>
              
              {/* Thumbnail Rail */}
              <div className="h-32 border-t border-border bg-slate-900/50 flex items-center gap-4 px-4 overflow-x-auto shrink-0">
                {DEMO_SLIDES.map((slide, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5 shrink-0 cursor-pointer group">
                    <div className={"w-40 aspect-video rounded-md border-2 " + (idx === 0 ? "border-brand" : "border-border group-hover:border-border/80") + " " + slide.bg + " flex flex-col items-center justify-center p-2 text-center"}>
                      <span className="text-[10px] font-bold text-white leading-tight">{slide.title}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground text-center">Slide {idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : artifactType === "sheet" ? (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2 p-2 border-b border-border bg-muted/20 shrink-0">
                <Button variant="ghost" size="sm" className="h-7 text-xs"><LayoutGrid className="w-3.5 h-3.5 mr-1.5"/> Grid View</Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs">Summary</Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs">Charts</Button>
              </div>
              <div className="flex-1 overflow-auto bg-card">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="text-xs text-muted-foreground bg-muted/50 sticky top-0 z-10">
                    <tr>
                      <th className="border-b border-r border-border px-4 py-2 font-medium">Metric</th>
                      <th className="border-b border-r border-border px-4 py-2 font-medium">Q1 2024</th>
                      <th className="border-b border-r border-border px-4 py-2 font-medium">Q2 2024</th>
                      <th className="border-b border-border px-4 py-2 font-medium">Growth YoY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { m: "Revenue", q1: "$1.2M", q2: "$1.5M", g: "+25%" },
                      { m: "Active Users", q1: "45,000", q2: "62,000", g: "+37%" },
                      { m: "Churn Rate", q1: "4.2%", q2: "3.8%", g: "-10%" },
                      { m: "CAC", q1: "$45", q2: "$42", g: "-6%" },
                      { m: "LTV", q1: "$450", q2: "$480", g: "+7%" },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-border hover:bg-muted/20">
                        <td className="border-r border-border px-4 py-2 font-medium text-foreground">{row.m}</td>
                        <td className="border-r border-border px-4 py-2 text-muted-foreground">{row.q1}</td>
                        <td className="border-r border-border px-4 py-2 text-muted-foreground">{row.q2}</td>
                        <td className="px-4 py-2 text-emerald-500 font-medium">{row.g}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : artifactType === "pdf" ? (
             <div className="flex-1 flex flex-col items-center bg-muted/30 p-4">
               <div className="w-full max-w-3xl flex-1 bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-border flex flex-col">
                 <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-muted/50 rounded-t-lg shrink-0">
                    <span className="text-xs font-medium text-muted-foreground">Page 1 of 12</span>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronLeft className="w-4 h-4"/></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronRight className="w-4 h-4"/></Button>
                    </div>
                 </div>
                 <div className="flex-1 p-12 overflow-y-auto">
                    <h1 className="text-3xl font-serif font-bold text-foreground mb-6">Annual Report 2024</h1>
                    <div className="space-y-4 text-foreground/80 font-serif leading-relaxed">
                      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                      <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                      <div className="h-48 bg-muted/50 rounded mt-8 border border-border"></div>
                    </div>
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