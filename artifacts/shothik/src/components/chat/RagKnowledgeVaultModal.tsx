import React, { useState, useEffect } from "react";
import {
  Database,
  Search,
  Plus,
  Trash2,
  FileText,
  CheckCircle2,
  Sparkles,
  Loader2,
  X,
  ExternalLink,
  BookOpen,
  Zap,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface RagKnowledgeVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export function RagKnowledgeVaultModal({
  isOpen,
  onClose,
  userId = "usr_default",
}: RagKnowledgeVaultModalProps) {
  const [activeTab, setActiveTab] = useState<"documents" | "search" | "ingest">("documents");
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Ingest form state
  const [docTitle, setDocTitle] = useState("");
  const [docContent, setDocContent] = useState("");
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestSuccess, setIngestSuccess] = useState(false);

  // Query search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const fetchDocuments = () => {
    setLoadingDocs(true);
    fetch("/api/v1/rag/documents", {
      headers: { "x-user-id": userId },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.documents)) {
          setDocuments(data.documents);
        }
      })
      .catch((err) => console.warn("[rag] Failed to fetch documents:", err))
      .finally(() => setLoadingDocs(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen, userId]);

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) return;

    setIsIngesting(true);
    setIngestSuccess(false);

    try {
      const res = await fetch("/api/v1/rag/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          title: docTitle,
          content: docContent,
          sourceType: "user_upload",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIngestSuccess(true);
        setDocTitle("");
        setDocContent("");
        fetchDocuments();
        setTimeout(() => setIngestSuccess(false), 2500);
      }
    } catch (err) {
      console.error("[rag] Ingest error:", err);
    } finally {
      setIsIngesting(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch("/api/v1/rag/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          query: searchQuery,
          topK: 4,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        setSearchResults(data.results);
      }
    } catch (err) {
      console.error("[rag] Query error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      await fetch(`/api/v1/rag/documents/${encodeURIComponent(docId)}`, {
        method: "DELETE",
      });
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      console.error("[rag] Delete error:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-zinc-950/95 border-zinc-800 text-white shadow-2xl p-0 overflow-hidden rounded-2xl backdrop-blur-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-white">
                RAG Knowledge Vault & Vector Index
              </DialogTitle>
              <p className="text-[11px] font-mono text-zinc-400">
                Hybrid dense embeddings + NeMo Reranker semantic retrieval
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-5 py-2 border-b border-zinc-800/80 bg-zinc-900/30 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5",
              activeTab === "documents"
                ? "bg-zinc-800 text-white shadow-xs"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            )}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Vault Documents ({documents.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("search")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5",
              activeTab === "search"
                ? "bg-zinc-800 text-white shadow-xs"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            )}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Semantic Search</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ingest")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5",
              activeTab === "ingest"
                ? "bg-zinc-800 text-white shadow-xs"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            )}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ingest Manuscript / Docs</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {/* TAB 1: DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="space-y-3">
              {loadingDocs ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-400 font-mono text-xs">
                  <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                  <span>Loading indexed knowledge documents...</span>
                </div>
              ) : documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex items-center justify-between gap-3 group hover:border-zinc-700 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-white truncate">{doc.title}</h5>
                          <p className="text-[10px] text-zinc-400 font-mono">
                            {doc.chunkCount || 1} Chunks · {doc.sourceType || "Text"} · Indexed
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Delete from knowledge vault"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-zinc-400 space-y-3">
                  <Database className="w-8 h-8 mx-auto text-zinc-600" />
                  <p>No knowledge documents ingested yet.</p>
                  <Button
                    size="sm"
                    onClick={() => setActiveTab("ingest")}
                    className="bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold"
                  >
                    Ingest Your First Document
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SEARCH */}
          {activeTab === "search" && (
            <div className="space-y-4">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search across vector knowledge base..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-900 rounded-xl border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-sans"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs"
                >
                  {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Query"}
                </Button>
              </form>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-mono text-zinc-400">
                    Found {searchResults.length} relevant vector passages:
                  </div>
                  {searchResults.map((res, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="font-bold text-cyan-400">{res.title || "Passage"}</span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Match: {Math.round((res.score || 0.95) * 100)}%
                        </span>
                      </div>
                      <p className="text-zinc-300 leading-relaxed font-sans text-[11px]">
                        {res.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INGEST */}
          {activeTab === "ingest" && (
            <form onSubmit={handleIngest} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Bangladesh Logistics Regulatory Framework 2026"
                  className="w-full px-3 py-2 text-xs bg-zinc-900 rounded-xl border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Document Content (Markdown / Text)
                </label>
                <textarea
                  required
                  rows={6}
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder="Paste manuscript chapter, research whitepaper, or business notes..."
                  className="w-full px-3 py-2 text-xs bg-zinc-900 rounded-xl border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono leading-relaxed"
                />
              </div>

              {ingestSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Document ingested into vector store & index updated!</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isIngesting || !docTitle.trim() || !docContent.trim()}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs gap-1.5"
              >
                {isIngesting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{isIngesting ? "Chunking & Embedding..." : "Ingest into Vector Vault"}</span>
              </Button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-800 bg-zinc-900/80 text-xs">
          <span className="text-zinc-500 font-mono">
            NVIDIA AI-Q Dense Retrieval + Hybrid Keyword Engine
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs border-zinc-700 text-zinc-300 hover:text-white"
          >
            Close Vault
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
