"use client";

import React, { useState, useEffect } from "react";
import { Link, usePathname, useRouter } from "@/lib/navigation";
import {
  Plus,
  Brain,
  PenTool,
  Link2,
  FolderOpen,
  FileText,
  FolderPlus,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  Pin,
  Trash2,
  Bell,
  UserPlus,
  PanelLeft,
  Search,
  Layers,
  Zap,
  Pencil,
  Check,
  X,
  BookOpen,
  Landmark,
} from "lucide-react";
import { useSelector } from "react-redux";
import {
  getChatSessions,
  deleteChatSession,
  pinChatSession,
  renameChatSession,
  StoredChatSession,
  subscribeChatSessions,
} from "@/lib/chat-sessions-store";
import CreateProjectModal from "@/components/tools/writing-studio/dashboard/CreateProjectModal";
import NotificationBell from "@/components/forum/NotificationBell";
import { cn } from "@/lib/utils";

export default function IconNavSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useSelector((state: any) => state.auth?.user);
  const masterId = user?._id || user?.email || "";

  const isWritingRoute = pathname.includes('/writing-studio') ||
    pathname.includes('/paraphrase') ||
    pathname.includes('/humanize-gpt') ||
    pathname.includes('/ai-detector') ||
    pathname.includes('/plagiarism-checker') ||
    pathname.includes('/summarize') ||
    pathname.includes('/grammar-checker') ||
    pathname.includes('/translator');

  // Collapsible sections state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("shothik_sidebar_collapsed") === "true";
    }
    return false;
  });
  const [isHovering, setIsHovering] = useState(false);
  const effectiveCollapsed = isCollapsed && !isHovering;
  const [isWritingSuiteOpen, setIsWritingSuiteOpen] = useState(isWritingRoute);
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const [isSessionsOpen, setIsSessionsOpen] = useState(true);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [sessionSearch, setSessionSearch] = useState("");

  useEffect(() => {
    if (isWritingRoute) {
      setIsWritingSuiteOpen(true);
    }
  }, [pathname, isWritingRoute]);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("shothik_sidebar_collapsed", String(next));
    }
  };

  // Sessions state synced across tabs
  const [sessions, setSessions] = useState<StoredChatSession[]>([]);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const currentConvId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("conversationId") : null;

  const handleStartRename = (e: React.MouseEvent, chat: StoredChatSession) => {
    e.stopPropagation();
    setEditingSessionId(chat.id);
    setEditingTitle(chat.title);
  };

  const handleSaveRename = (id: string) => {
    if (editingTitle.trim()) {
      renameChatSession(id, editingTitle.trim());
    }
    setEditingSessionId(null);
    setEditingTitle("");
  };

  const handleCancelRename = () => {
    setEditingSessionId(null);
    setEditingTitle("");
  };

  useEffect(() => {
    // Initial fetch
    setSessions(getChatSessions());

    // Live subscription
    const unsubscribe = subscribeChatSessions((updated) => {
      setSessions(updated);
    });

    return unsubscribe;
  }, []);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const startNewChat = () => {
    const newId = `conv_${Date.now()}`;
    router.push(`/?conversationId=${newId}`);
  };

  return (
    <>
      {isCollapsed && isHovering && <div className="hidden md:block w-16 h-screen flex-shrink-0" />}
      <aside 
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={cn(
        "hidden md:flex flex-col h-screen bg-zinc-50 dark:bg-[#0b0f17] text-zinc-700 dark:text-[#e3e3e3] border-r border-zinc-200 dark:border-zinc-800/90 z-50 overflow-hidden flex-shrink-0 select-none transition-all duration-300",
        (isCollapsed && isHovering) ? "absolute left-0 top-0 shadow-2xl w-[264px]" : 
        effectiveCollapsed ? "w-16 relative" : "w-[264px] relative"
      )}>
        {/* ── Top Header: Logo + Collapse Toggle ── */}
        <div className={cn("flex items-center h-14 pt-3 pb-2 flex-shrink-0", effectiveCollapsed ? "justify-center px-2" : "justify-between px-4")}>
          {!effectiveCollapsed && (
            <Link href="/" className="flex items-center gap-2.5 no-underline">
              <img
                src="/moscot.png"
                alt="Shothik AI"
                width={28}
                height={28}
                className="object-contain"
              />
              <span className="font-bold text-base tracking-tight text-zinc-950 dark:text-white">Shothik</span>
            </Link>
          )}
          <button
            type="button"
            onClick={toggleCollapse}
            className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-md hover:bg-zinc-200/60 dark:hover:bg-white/[0.08] transition cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <PanelLeft className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-3.5 custom-scrollbar">
          {/* ── Primary Action: + New Chat ── */}
          <button
            type="button"
            onClick={startNewChat}
            className={cn(
              "flex items-center h-10 rounded-xl bg-zinc-200/90 hover:bg-zinc-300 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-zinc-950 dark:text-white text-sm font-bold transition-all active:scale-[0.99] cursor-pointer shadow-xs",
              effectiveCollapsed ? "justify-center w-full px-0" : "w-full justify-start gap-3 px-3.5"
            )}
            title="New Chat"
          >
            <Plus className="h-4.5 w-4.5 text-zinc-900 dark:text-zinc-100" />
            {!effectiveCollapsed && <span>New Chat</span>}
          </button>

          {/* ── Core Navigation: Twin, Writing Suite, Connectors, Files, Saved Reports ── */}
          <div className="space-y-1">
            {/* 1. Twin AI Cofounder */}
            <Link
              href={typeof window !== "undefined" && (localStorage.getItem("shothik_active_company") || localStorage.getItem("shothik_twin_has_setup")) ? "/twin" : "/twin/new"}
              title="Twin AI"
              className={cn(
                "flex items-center rounded-xl text-sm font-semibold transition-colors no-underline group",
                effectiveCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3.5 py-2.5",
                isActive('/twin')
                  ? "bg-zinc-200/90 dark:bg-white/[0.08] text-zinc-950 dark:text-white font-bold border border-zinc-300 dark:border-white/[0.12] shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-white/[0.05] hover:text-zinc-950 dark:hover:text-white"
              )}
            >
              <Brain className="h-5 w-5 shrink-0 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
              {!effectiveCollapsed && <span>Twin AI</span>}
            </Link>

            {/* 2. Writing Suite (Expandable) */}
            <div className="space-y-0.5">
              <div
                className={cn(
                  "flex items-center rounded-xl text-sm font-semibold transition-colors group",
                  effectiveCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3.5 py-2.5",
                  isWritingRoute
                    ? "bg-zinc-200/90 dark:bg-white/[0.08] text-zinc-950 dark:text-white font-bold border border-zinc-300 dark:border-white/[0.12] shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-white/[0.05] hover:text-zinc-950 dark:hover:text-white"
                )}
              >
                <Link
                  href="/writing-studio"
                  title="Writing Suite"
                  className="flex items-center gap-3 flex-1 min-w-0 no-underline text-inherit"
                >
                  <PenTool className="h-5 w-5 shrink-0 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                  {!effectiveCollapsed && <span>Writing Suite</span>}
                </Link>
                {!effectiveCollapsed && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsWritingSuiteOpen(!isWritingSuiteOpen);
                    }}
                    className="p-1 rounded-md text-zinc-500 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-300/50 dark:hover:bg-white/[0.1] transition cursor-pointer"
                    title={isWritingSuiteOpen ? "Collapse writing tools" : "Expand writing tools"}
                  >
                    {isWritingSuiteOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>

              {!effectiveCollapsed && isWritingSuiteOpen && (
                <div className="pl-3.5 pr-1 py-1 space-y-0.5 animate-in fade-in duration-100 border-l border-zinc-300 dark:border-white/[0.1] ml-5 my-0.5">
                  {[
                    { label: "Writing Studio", path: "/writing-studio" },
                    { label: "Paraphrase", path: "/paraphrase" },
                    { label: "Humanize GPT", path: "/humanize-gpt" },
                    { label: "Grammar Fix", path: "/grammar-checker" },
                    { label: "AI Detector", path: "/ai-detector" },
                    { label: "Plagiarism Checker", path: "/plagiarism-checker" },
                    { label: "Summarizer", path: "/summarize" },
                    { label: "Translator", path: "/translator" },
                  ].map((tool) => (
                    <Link
                      key={tool.path}
                      href={tool.path}
                      className={cn(
                        "block px-2.5 py-1.5 rounded-lg text-xs transition-colors no-underline",
                        isActive(tool.path)
                          ? "bg-brand/10 text-brand font-semibold"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-white/[0.05] hover:text-zinc-950 dark:hover:text-white"
                      )}
                    >
                      {tool.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Connectors */}
            <Link
              href="/connectors"
              title="Connectors"
              className={cn(
                "flex items-center rounded-xl text-sm font-semibold transition-colors no-underline group",
                effectiveCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3.5 py-2.5",
                isActive('/connectors')
                  ? "bg-zinc-200/90 dark:bg-white/[0.08] text-zinc-950 dark:text-white font-bold border border-zinc-300 dark:border-white/[0.12] shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-white/[0.05] hover:text-zinc-950 dark:hover:text-white"
              )}
            >
              <Link2 className="h-5 w-5 shrink-0 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
              {!effectiveCollapsed && <span>Connectors</span>}
            </Link>

            {/* 4. Files */}
            <Link
              href="/files"
              title="Files"
              className={cn(
                "flex items-center rounded-xl text-sm font-semibold transition-colors no-underline group",
                effectiveCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3.5 py-2.5",
                isActive('/files')
                  ? "bg-zinc-200/90 dark:bg-white/[0.08] text-zinc-950 dark:text-white font-bold border border-zinc-300 dark:border-white/[0.12] shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-white/[0.05] hover:text-zinc-950 dark:hover:text-white"
              )}
            >
              <FolderOpen className="h-5 w-5 shrink-0 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
              {!effectiveCollapsed && <span>Files</span>}
            </Link>

            {/* 5. Saved Reports */}
            <Link
              href="/saved-reports"
              title="Saved Reports"
              className={cn(
                "flex items-center rounded-xl text-sm font-semibold transition-colors no-underline group",
                effectiveCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3.5 py-2.5",
                isActive('/saved-reports')
                  ? "bg-zinc-200/90 dark:bg-white/[0.08] text-zinc-950 dark:text-white font-bold border border-zinc-300 dark:border-white/[0.12] shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-white/[0.05] hover:text-zinc-950 dark:hover:text-white"
              )}
            >
              <FileText className="h-5 w-5 shrink-0 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
              {!effectiveCollapsed && <span>Saved Reports</span>}
            </Link>

            {/* 6. মহাবিহার (Mahavihara) — Ancient Citadel of Knowledge & Study Standards */}
            <Link
              href="/marketplace"
              title="মহাবিহার (Mahavihara) — Study Standards & Knowledge Citadel"
              className={cn(
                "flex items-center rounded-xl text-sm font-semibold transition-colors no-underline group",
                effectiveCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3.5 py-2.5",
                isActive('/marketplace')
                  ? "bg-zinc-200/90 dark:bg-white/[0.08] text-zinc-950 dark:text-white font-bold border border-zinc-300 dark:border-white/[0.12] shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-white/[0.05] hover:text-zinc-950 dark:hover:text-white"
              )}
            >
              <Landmark className="h-5 w-5 shrink-0 text-amber-500 dark:text-amber-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
              {!effectiveCollapsed && <span>মহাবিহার (Mahavihara)</span>}
            </Link>
          </div>

          {/* ── Projects Section (with Create Project Modal) ── */}
          {!effectiveCollapsed && (
            <div className="space-y-2 pt-2 border-t border-zinc-300 dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => setIsProjectsOpen(!isProjectsOpen)}
                className="flex items-center justify-between w-full px-2 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition cursor-pointer"
              >
                <span>Projects</span>
                {isProjectsOpen ? <ChevronDown className="h-4 w-4 text-zinc-500" /> : <ChevronRight className="h-4 w-4 text-zinc-500" />}
              </button>

              {isProjectsOpen && (
                <div className="px-1 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreateProjectOpen(true)}
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-white/[0.06] hover:text-zinc-950 dark:hover:text-white text-sm font-medium transition cursor-pointer group"
                  >
                    <FolderPlus className="h-4.5 w-4.5 shrink-0 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                    <span>Create project</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Sessions Section ── */}
          {!effectiveCollapsed && (
            <div className="space-y-1.5 pt-2 border-t border-zinc-300 dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => setIsSessionsOpen(!isSessionsOpen)}
                className="flex items-center justify-between w-full px-2 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition cursor-pointer"
              >
                <span>Sessions</span>
                {isSessionsOpen ? <ChevronDown className="h-4 w-4 text-zinc-500" /> : <ChevronRight className="h-4 w-4 text-zinc-500" />}
              </button>

              {isSessionsOpen && (
                <div className="space-y-1 pt-1">
                  {/* Quick Search Filter if > 3 sessions */}
                  {sessions.length > 3 && (
                    <div className="px-1 pb-1">
                      <div className="relative">
                        <Search className="w-4 h-4 text-zinc-500 dark:text-zinc-400 absolute left-2.5 top-2 pointer-events-none" />
                        <input
                          id="search-chats-input"
                          name="session-search"
                          aria-label="Search chat sessions"
                          type="text"
                          value={sessionSearch}
                          onChange={(e) => setSessionSearch(e.target.value)}
                          placeholder="Search chats..."
                          className="w-full h-8 pl-8 pr-2 rounded-lg bg-zinc-100 dark:bg-white/[0.06] text-xs text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-500 border border-zinc-300 dark:border-white/[0.1] focus:outline-none focus:ring-1 focus:ring-brand/50 transition"
                        />
                      </div>
                    </div>
                  )}

                  {sessions.filter((chat) => chat.title.toLowerCase().includes(sessionSearch.toLowerCase())).length === 0 ? (
                    <div className="px-3 py-3 text-center text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                      No chats matching "{sessionSearch}"
                    </div>
                  ) : (
                    sessions
                      .filter((chat) => chat.title.toLowerCase().includes(sessionSearch.toLowerCase()))
                      .map((chat) => (
                        <div
                          key={chat.id}
                          onClick={() => {
                            if (editingSessionId !== chat.id) {
                              router.push(`/?conversationId=${chat.id}`);
                            }
                          }}
                          onDoubleClick={(e) => handleStartRename(e, chat)}
                          className={cn(
                            "group flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer select-none",
                            currentConvId === chat.id
                              ? "bg-zinc-200/90 dark:bg-white/[0.12] text-zinc-950 dark:text-white font-semibold shadow-xs"
                              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-white/[0.05] hover:text-zinc-950 dark:hover:text-white"
                          )}
                        >
                          {editingSessionId === chat.id ? (
                            <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                              <input
                                autoFocus
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveRename(chat.id);
                                  if (e.key === "Escape") handleCancelRename();
                                }}
                                className="flex-1 min-w-0 bg-background text-foreground text-xs px-2 py-1 rounded border border-brand/50 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveRename(chat.id)}
                                className="p-1 text-emerald-600 hover:bg-emerald-500/10 rounded transition"
                                title="Save"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelRename}
                                className="p-1 text-zinc-500 hover:bg-muted/50 rounded transition"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                {chat.pinned && <Pin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 rotate-45" />}
                                <span className="truncate" title={chat.title}>{chat.title}</span>
                              </div>

                              <div className="hidden group-hover:flex items-center gap-1 shrink-0 pl-1">
                                <button
                                  type="button"
                                  onClick={(e) => handleStartRename(e, chat)}
                                  className="p-1 text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 rounded transition"
                                  title="Rename"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    pinChatSession(chat.id, !chat.pinned);
                                  }}
                                  className="p-1 text-zinc-500 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-400 rounded transition"
                                  title={chat.pinned ? "Unpin" : "Pin"}
                                >
                                  <Pin className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteChatSession(chat.id);
                                  }}
                                  className="p-1 text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 rounded transition"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Community & Settings ── */}
          <div className="space-y-1 pt-2 border-t border-zinc-300 dark:border-white/[0.08]">
            <Link
              href="/community"
              title="Community"
              className={cn(
                "flex items-center rounded-xl text-sm font-semibold transition-colors no-underline",
                effectiveCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3.5 py-2.5",
                isActive('/community')
                  ? "bg-zinc-200/90 dark:bg-white/[0.12] text-zinc-950 dark:text-white font-bold shadow-xs"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-white/[0.06] hover:text-zinc-950 dark:hover:text-white"
              )}
            >
              <Users className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
              {!effectiveCollapsed && <span>Community</span>}
            </Link>

            <Link
              href="/settings"
              title="Settings"
              className={cn(
                "flex items-center rounded-xl text-sm font-semibold transition-colors no-underline",
                effectiveCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3.5 py-2.5",
                isActive('/settings')
                  ? "bg-zinc-200/90 dark:bg-white/[0.12] text-zinc-950 dark:text-white font-bold shadow-xs"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-white/[0.06] hover:text-zinc-950 dark:hover:text-white"
              )}
            >
              <Settings className="h-5 w-5 shrink-0 text-zinc-600 dark:text-zinc-300" />
              {!effectiveCollapsed && <span>Settings</span>}
            </Link>
          </div>
        </div>

        {/* ── Credit Wallet & Micro-Pass ── */}
        {!isCollapsed ? (
          <div className="mx-3.5 mb-2.5 p-3 rounded-xl bg-zinc-100/90 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                <Zap className="w-3.5 h-3.5 fill-amber-500/30" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-zinc-950 dark:text-zinc-100 font-mono leading-tight">550 Credits</span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Micro-Pass Active</span>
              </div>
            </div>
            <Link
              href="/pricing"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 transition hover:bg-emerald-500/20"
            >
              + Top Up
            </Link>
          </div>
        ) : (
          <Link
            href="/pricing"
            title="Wallet: 550 Credits (+ Top Up)"
            className="mx-auto mb-2 w-9 h-9 rounded-lg bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] flex items-center justify-center text-amber-500 dark:text-amber-400 hover:bg-zinc-200 dark:hover:bg-white/[0.08] transition"
          >
            <Zap className="w-4 h-4 fill-amber-500/30" />
          </Link>
        )}

        {/* ── Bottom Profile Section ── */}
        <div className={cn("border-t border-zinc-300 dark:border-white/[0.08] mt-auto", isCollapsed ? "p-2 flex flex-col items-center gap-2" : "p-3.5 space-y-2.5")}>
          <div className={cn("flex items-center w-full", effectiveCollapsed ? "justify-center" : "justify-between")}>
            <Link href="/account" title={user?.name || "Account Profile"} className={cn("flex items-center min-w-0 no-underline group cursor-pointer", effectiveCollapsed ? "justify-center" : "gap-3 flex-1")}>
              <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-white/[0.15] flex items-center justify-center text-sm font-bold text-zinc-800 dark:text-zinc-200 group-hover:border-zinc-500 dark:group-hover:border-white/40 transition shrink-0">
                {user?.name?.[0]?.toUpperCase() || "A"}
              </div>
              {!effectiveCollapsed && (
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-zinc-950 dark:group-hover:text-white transition">
                    {user?.email ? user.email.split("@")[0] : "ahsan91927374"}
                  </span>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium font-mono truncate">
                    {user?.package ? `${user.package.toUpperCase()} PRO` : "Enterprise Pro"}
                  </span>
                </div>
              )}
            </Link>

            {!effectiveCollapsed && (
              masterId ? (
                <NotificationBell masterId={masterId} />
              ) : (
                <button
                  type="button"
                  className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white rounded-md hover:bg-zinc-200/60 dark:hover:bg-white/[0.08] transition"
                  title="Notifications"
                >
                  <Bell className="h-4.5 w-4.5" />
                </button>
              )
            )}
          </div>

          {/* Workspace Switcher Stub */}
          {!effectiveCollapsed && (
            <div className="pt-2 border-t border-zinc-300 dark:border-white/[0.06] flex items-center gap-1.5 text-xs">
              <div className="flex items-center gap-2.5 flex-1 truncate px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition cursor-pointer">
                <Layers className="h-4 w-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
                <span className="text-xs text-zinc-800 dark:text-zinc-200 font-semibold truncate">
                  {user?.name || "Personal Workspace"}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400 shrink-0 ml-auto" />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Create Project Modal ── */}
      {isCreateProjectOpen && (
        <CreateProjectModal
          onClose={() => setIsCreateProjectOpen(false)}
          createProject={async (data: any) => data}
          onProjectCreated={(project: any) => {
            setIsCreateProjectOpen(false);
            if (project?.id) {
              router.push(`/writing-studio?projectId=${project.id}`);
            }
          }}
          onStartAgentFlow={(_type: any) => {
            setIsCreateProjectOpen(false);
            router.push('/');
          }}
        />
      )}
    </>
  );
}