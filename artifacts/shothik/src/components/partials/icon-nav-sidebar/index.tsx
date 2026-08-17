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
} from "lucide-react";
import { useSelector } from "react-redux";
import { useChatSession } from "@/components/agents/hooks/useChatSession";
import {
  getChatSessions,
  deleteChatSession,
  pinChatSession,
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
  const { conversationId: currentConvId } = useChatSession();

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
    router.push(`/agents/chat?conversationId=${newId}`);
  };

  return (
    <>
      <aside className={cn(
        "hidden md:flex flex-col h-screen bg-zinc-50 dark:bg-[#121314] text-zinc-700 dark:text-[#e3e3e3] border-r border-zinc-200 dark:border-white/[0.06] z-40 overflow-hidden flex-shrink-0 select-none transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {/* ── Top Header: Logo + Collapse Toggle ── */}
        <div className={cn("flex items-center h-13 pt-3 pb-2 flex-shrink-0", isCollapsed ? "justify-center px-2" : "justify-between px-4")}>
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2 no-underline">
              <img
                src="/moscot.png"
                alt="Shothik AI"
                width={24}
                height={24}
                className="object-contain"
              />
              <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-white/90">Shothik</span>
            </Link>
          )}
          <button
            type="button"
            onClick={toggleCollapse}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-white rounded-md hover:bg-zinc-200/50 dark:hover:bg-white/[0.05] transition cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3 custom-scrollbar">
          {/* ── Primary Action: + New Chat ── */}
          <button
            type="button"
            onClick={startNewChat}
            className={cn(
              "flex items-center h-9 rounded-lg bg-zinc-200/80 hover:bg-zinc-300/80 dark:bg-white/[0.07] dark:hover:bg-white/[0.12] text-zinc-900 dark:text-white text-xs font-medium transition-all active:scale-[0.99] cursor-pointer shadow-xs",
              isCollapsed ? "justify-center w-full px-0" : "w-full justify-start gap-2 px-3"
            )}
            title="New Chat"
          >
            <Plus className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-300" />
            {!isCollapsed && <span>New Chat</span>}
          </button>

          {/* ── Core Navigation: Twin, Writing Suite, Connectors, Files, Saved Reports ── */}
          <div className="space-y-0.5">
            {/* 1. Twin AI Cofounder */}
            <Link
              href="/twin"
              title="Twin AI"
              className={cn(
                "flex items-center rounded-lg text-xs font-medium transition-colors no-underline",
                isCollapsed ? "justify-center px-0 py-2" : "gap-2.5 px-3 py-2",
                isActive('/twin')
                  ? "bg-zinc-200 dark:bg-white/[0.1] text-zinc-900 dark:text-white font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-white/[0.05] hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <Brain className="h-4 w-4 shrink-0 text-purple-500 dark:text-purple-400" />
              {!isCollapsed && <span>Twin AI</span>}
            </Link>

            {/* 2. Writing Suite */}
            {!isCollapsed ? (
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => setIsWritingSuiteOpen(!isWritingSuiteOpen)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                    isWritingSuiteOpen || pathname.includes('/writing-studio') || pathname.includes('/paraphrase')
                      ? "text-zinc-900 dark:text-zinc-200 bg-zinc-200/60 dark:bg-white/[0.03]"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-white/[0.05] hover:text-zinc-900 dark:hover:text-zinc-200"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <PenTool className="h-4 w-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
                    <span>Writing Suite</span>
                  </div>
                  {isWritingSuiteOpen ? <ChevronDown className="h-3.5 w-3.5 text-zinc-400" /> : <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />}
                </button>

                {isWritingSuiteOpen && (
                  <div className="pl-6 space-y-0.5 mt-0.5 border-l border-zinc-200 dark:border-white/[0.08] ml-4.5">
                    <Link
                      href="/writing-studio"
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors no-underline",
                        isActive('/writing-studio') ? "bg-zinc-200 dark:bg-white/[0.1] text-zinc-900 dark:text-white font-semibold" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/40 dark:hover:bg-white/[0.04] hover:text-zinc-900 dark:hover:text-zinc-200"
                      )}
                    >
                      <span>Writing Studio</span>
                    </Link>
                    <Link
                      href="/paraphrase"
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors no-underline",
                        isActive('/paraphrase') ? "bg-zinc-200 dark:bg-white/[0.1] text-zinc-900 dark:text-white font-semibold" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/40 dark:hover:bg-white/[0.04] hover:text-zinc-900 dark:hover:text-zinc-200"
                      )}
                    >
                      <span>Paraphrasing</span>
                    </Link>
                    <Link
                      href="/ai-detector"
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors no-underline",
                        isActive('/ai-detector') ? "bg-zinc-200 dark:bg-white/[0.1] text-zinc-900 dark:text-white font-semibold" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/40 dark:hover:bg-white/[0.04] hover:text-zinc-900 dark:hover:text-zinc-200"
                      )}
                    >
                      <span>AI Detector</span>
                    </Link>
                    <Link
                      href="/humanize-gpt"
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors no-underline",
                        isActive('/humanize-gpt') ? "bg-zinc-200 dark:bg-white/[0.1] text-zinc-900 dark:text-white font-semibold" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/40 dark:hover:bg-white/[0.04] hover:text-zinc-900 dark:hover:text-zinc-200"
                      )}
                    >
                      <span>Humanize GPT</span>
                    </Link>
                    <Link
                      href="/plagiarism-checker"
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors no-underline",
                        isActive('/plagiarism-checker') ? "bg-zinc-200 dark:bg-white/[0.1] text-zinc-900 dark:text-white font-semibold" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/40 dark:hover:bg-white/[0.04] hover:text-zinc-900 dark:hover:text-zinc-200"
                      )}
                    >
                      <span>Plagiarism Check</span>
                    </Link>
                    <Link
                      href="/summarize"
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors no-underline",
                        isActive('/summarize') ? "bg-zinc-200 dark:bg-white/[0.1] text-zinc-900 dark:text-white font-semibold" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/40 dark:hover:bg-white/[0.04] hover:text-zinc-900 dark:hover:text-zinc-200"
                      )}
                    >
                      <span>Summarizer</span>
                    </Link>
                    <Link
                      href="/grammar-checker"
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors no-underline",
                        isActive('/grammar-checker') ? "bg-zinc-200 dark:bg-white/[0.1] text-zinc-900 dark:text-white font-semibold" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/40 dark:hover:bg-white/[0.04] hover:text-zinc-900 dark:hover:text-zinc-200"
                      )}
                    >
                      <span>Grammar Fix</span>
                    </Link>
                    <Link
                      href="/translator"
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors no-underline",
                        isActive('/translator') ? "bg-zinc-200 dark:bg-white/[0.1] text-zinc-900 dark:text-white font-semibold" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/40 dark:hover:bg-white/[0.04] hover:text-zinc-900 dark:hover:text-zinc-200"
                      )}
                    >
                      <span>Translator</span>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/writing-studio"
                title="Writing Studio"
                className={cn(
                  "flex items-center justify-center rounded-lg text-xs font-medium transition-colors no-underline py-2",
                  isActive('/writing-studio') || isActive('/paraphrase')
                    ? "bg-zinc-200 dark:bg-white/[0.1] text-zinc-900 dark:text-white font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-white/[0.05] hover:text-zinc-900 dark:hover:text-zinc-200"
                )}
              >
                <PenTool className="h-4 w-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
              </Link>
            )}

            {/* 3. Connectors */}
            <Link
              href="/connectors"
              title="Connectors"
              className={cn(
                "flex items-center rounded-lg text-xs font-medium transition-colors no-underline",
                isCollapsed ? "justify-center px-0 py-2" : "gap-2.5 px-3 py-2",
                isActive('/connectors')
                  ? "bg-zinc-200 dark:bg-white/[0.1] text-zinc-900 dark:text-white font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-white/[0.05] hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <Link2 className="h-4 w-4 shrink-0 text-teal-500 dark:text-teal-400" />
              {!isCollapsed && <span>Connectors</span>}
            </Link>

            {/* 4. Files */}
            <Link
              href="/files"
              title="Files"
              className={cn(
                "flex items-center rounded-lg text-xs font-medium transition-colors no-underline",
                isCollapsed ? "justify-center px-0 py-2" : "gap-2.5 px-3 py-2",
                isActive('/files')
                  ? "bg-zinc-200 dark:bg-white/[0.1] text-zinc-900 dark:text-white font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-white/[0.05] hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <FolderOpen className="h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400" />
              {!isCollapsed && <span>Files</span>}
            </Link>

            {/* 5. Saved Reports */}
            <Link
              href="/saved-reports"
              title="Saved Reports"
              className={cn(
                "flex items-center rounded-lg text-xs font-medium transition-colors no-underline",
                isCollapsed ? "justify-center px-0 py-2" : "gap-2.5 px-3 py-2",
                isActive('/saved-reports')
                  ? "bg-zinc-200 dark:bg-white/[0.1] text-zinc-900 dark:text-white font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-white/[0.05] hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <FileText className="h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400" />
              {!isCollapsed && <span>Saved Reports</span>}
            </Link>
          </div>

          {/* ── Projects Section (with Create Project Modal) ── */}
          {!isCollapsed && (
            <div className="space-y-2 pt-1 border-t border-zinc-200 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => setIsProjectsOpen(!isProjectsOpen)}
                className="flex items-center justify-between w-full px-2 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition cursor-pointer"
              >
                <span>Projects</span>
                {isProjectsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>

              {isProjectsOpen && (
                <div className="px-1 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreateProjectOpen(true)}
                    className="flex items-center gap-1.5 w-full px-2.5 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-white/[0.05] hover:text-zinc-900 dark:hover:text-zinc-200 text-xs font-medium transition cursor-pointer"
                  >
                    <FolderPlus className="h-3.5 w-3.5 shrink-0" />
                    <span>Create project</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Sessions Section ── */}
          {!isCollapsed && (
            <div className="space-y-1 pt-1 border-t border-zinc-200 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => setIsSessionsOpen(!isSessionsOpen)}
                className="flex items-center justify-between w-full px-2 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition cursor-pointer"
              >
                <span>Sessions</span>
                {isSessionsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>

              {isSessionsOpen && (
                <div className="space-y-1 pt-1">
                  {/* Quick Search Filter if > 3 sessions */}
                  {sessions.length > 3 && (
                    <div className="px-1 pb-1">
                      <div className="relative">
                        <Search className="w-3 h-3 text-zinc-400 absolute left-2 top-2 pointer-events-none" />
                        <input
                          type="text"
                          value={sessionSearch}
                          onChange={(e) => setSessionSearch(e.target.value)}
                          placeholder="Search chats..."
                          className="w-full h-7 pl-6 pr-2 rounded-lg bg-zinc-100 dark:bg-white/[0.04] text-[11px] text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 border border-zinc-200 dark:border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-brand/50 transition"
                        />
                      </div>
                    </div>
                  )}

                  {sessions
                    .filter((chat) => chat.title.toLowerCase().includes(sessionSearch.toLowerCase()))
                    .map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => router.push(`/agents/chat?conversationId=${chat.id}`)}
                        className={cn(
                          "group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer select-none",
                          currentConvId === chat.id
                            ? "bg-zinc-200 dark:bg-white/[0.08] text-zinc-900 dark:text-white font-medium"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-white/[0.04] hover:text-zinc-900 dark:hover:text-zinc-200"
                        )}
                      >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {chat.pinned && <Pin className="w-2.5 h-2.5 text-amber-500 dark:text-amber-400 shrink-0 rotate-45" />}
                        <span className="truncate">{chat.title}</span>
                      </div>

                      <div className="hidden group-hover:flex items-center gap-1 shrink-0 pl-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            pinChatSession(chat.id, !chat.pinned);
                          }}
                          className="p-1 text-zinc-400 hover:text-amber-500 rounded transition"
                          title={chat.pinned ? "Unpin" : "Pin"}
                        >
                          <Pin className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChatSession(chat.id);
                          }}
                          className="p-1 text-zinc-400 hover:text-rose-500 rounded transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Community & Settings ── */}
          <div className="space-y-0.5 pt-1 border-t border-zinc-200 dark:border-white/[0.06]">
            <Link
              href="/community"
              title="Community"
              className={cn(
                "flex items-center rounded-lg text-xs font-medium transition-colors no-underline",
                isCollapsed ? "justify-center px-0 py-2" : "gap-2.5 px-3 py-2",
                isActive('/community')
                  ? "bg-zinc-200 dark:bg-white/[0.1] text-zinc-900 dark:text-white font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-white/[0.05] hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <Users className="h-4 w-4 shrink-0 text-indigo-500 dark:text-indigo-400" />
              {!isCollapsed && <span>Community</span>}
            </Link>

            <Link
              href="/settings"
              title="Settings"
              className={cn(
                "flex items-center rounded-lg text-xs font-medium transition-colors no-underline",
                isCollapsed ? "justify-center px-0 py-2" : "gap-2.5 px-3 py-2",
                isActive('/settings')
                  ? "bg-zinc-200 dark:bg-white/[0.1] text-zinc-900 dark:text-white font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-white/[0.05] hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <Settings className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400" />
              {!isCollapsed && <span>Settings</span>}
            </Link>
          </div>
        </div>

        {/* ── Credit Wallet & Micro-Pass ── */}
        {!isCollapsed ? (
          <div className="mx-3 mb-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-amber-500/20 dark:border-amber-400/20 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <Zap className="w-3.5 h-3.5 fill-amber-500/30" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 font-mono leading-tight">550 Credits</span>
                <span className="text-[9px] text-zinc-500 dark:text-zinc-400">Micro-Pass Active</span>
              </div>
            </div>
            <Link
              href="/pricing"
              className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 transition hover:scale-105"
            >
              + Top Up
            </Link>
          </div>
        ) : (
          <Link
            href="/pricing"
            title="Wallet: 550 Credits (+ Top Up)"
            className="mx-auto mb-2 w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 hover:bg-amber-500/20 transition"
          >
            <Zap className="w-4 h-4 fill-amber-500/30" />
          </Link>
        )}

        {/* ── Bottom Profile Section ── */}
        <div className={cn("border-t border-zinc-200 dark:border-white/[0.06] mt-auto", isCollapsed ? "p-2 flex flex-col items-center gap-2" : "p-3 space-y-2")}>
          <div className={cn("flex items-center w-full", isCollapsed ? "justify-center" : "justify-between")}>
            <Link href="/account" title={user?.name || "Account Profile"} className={cn("flex items-center min-w-0 no-underline group cursor-pointer", isCollapsed ? "justify-center" : "gap-2.5 flex-1")}>
              <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-white/[0.1] flex items-center justify-center text-xs font-semibold text-zinc-700 dark:text-zinc-300 group-hover:border-zinc-500 dark:group-hover:border-white/30 transition shrink-0">
                {user?.name?.[0]?.toUpperCase() || "A"}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate group-hover:text-zinc-950 dark:group-hover:text-white transition">
                    {user?.email ? user.email.split("@")[0] : "ahsan91927374"}
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono truncate">
                    {user?.package ? `${user.package.toUpperCase()} PRO` : "Enterprise Pro"}
                  </span>
                </div>
              )}
            </Link>

            {!isCollapsed && (
              masterId ? (
                <NotificationBell masterId={masterId} />
              ) : (
                <button
                  type="button"
                  className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-md hover:bg-zinc-200/50 dark:hover:bg-white/[0.05] transition"
                  title="Notifications"
                >
                  <Bell className="h-3.5 w-3.5" />
                </button>
              )
            )}
          </div>

          {/* Workspace Switcher Stub (DeepSeek-close: sidebar owns workspace navigation) */}
          {!isCollapsed && (
            <div className="pt-1.5 border-t border-zinc-200 dark:border-white/[0.04] flex items-center gap-1.5 text-xs">
              <div className="flex items-center gap-1.5 flex-1 truncate px-1 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition cursor-pointer">
                <Layers className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-medium truncate">
                  {user?.name || "Personal Workspace"}
                </span>
                <ChevronDown className="h-3 w-3 text-zinc-400 dark:text-zinc-500 shrink-0 ml-auto" />
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
            router.push('/agents/chat');
          }}
        />
      )}
    </>
  );
}