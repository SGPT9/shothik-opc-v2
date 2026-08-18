

import { useState, useMemo } from "react";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Pin, 
  Trash2, 
  Edit3, 
  Globe, 
  Table, 
  Presentation, 
  BookOpen, 
  Clock, 
  MoreVertical,
  ChevronRight,
  Sparkles
} from "lucide-react";
export interface ChatSidebarItem {
  _id: string;
  title: string;
  _creationTime?: number;
  updatedAt?: number;
  pinned?: boolean;
  modelHandle?: string;
  lastMessageSnippet?: string;
  messageCount?: number;
}

export interface ChatSidebarProps {
  conversations: ChatSidebarItem[];
  activeConversationId?: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation?: (id: string, newTitle: string) => void;
  onDeleteConversation?: (id: string) => void;
  onPinConversation?: (id: string, pinned: boolean) => void;
  onOpenParallelSpace?: () => void;
  onOpenDataSheet?: () => void;
  onOpenSlideDeck?: () => void;
  onOpenWritingStudio?: () => void;
  /** Called before switching conversation so the caller can abort any in-flight stream. */
  onAbortStream?: () => void;
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  onPinConversation,
  onOpenParallelSpace,
  onOpenDataSheet,
  onOpenSlideDeck,
  onOpenWritingStudio,
  onAbortStream,
}: ChatSidebarProps) {
  // Wrapped handlers that abort any in-flight stream before navigating
  const handleSelectConversation = (id: string) => {
    onAbortStream?.();
    onSelectConversation(id);
  };
  const handleNewChat = () => {
    onAbortStream?.();
    onNewChat?.();
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const [isWritingSuiteOpen, setIsWritingSuiteOpen] = useState(false);

  // Filter conversations by search query
  const filteredConversations = useMemo(() => {
    const list = Array.isArray(conversations) ? conversations : [];
    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase().trim();
    return list.filter(c => (c.title || "").toLowerCase().includes(query));
  }, [conversations, searchQuery]);

  // Group conversations by date (Today, Yesterday, Previous 7 Days, Older)
  const groupedConversations = useMemo(() => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    const today: ChatSidebarItem[] = [];
    const yesterday: ChatSidebarItem[] = [];
    const past7Days: ChatSidebarItem[] = [];
    const older: ChatSidebarItem[] = [];

    (filteredConversations || []).forEach(chat => {
      if (!chat) return;
      const updatedAt = chat.updatedAt || chat._creationTime || now;
      const diffDays = (now - updatedAt) / oneDayMs;

      if (diffDays < 1) today.push(chat);
      else if (diffDays < 2) yesterday.push(chat);
      else if (diffDays < 7) past7Days.push(chat);
      else older.push(chat);
    });

    return { today, yesterday, past7Days, older };
  }, [filteredConversations]);

  return (
    <div className="flex flex-col h-full w-72 sm:w-80 bg-slate-950 dark:bg-black border-r border-slate-800 dark:border-zinc-800/90 text-slate-100 font-sans transition-all duration-300 select-none">
      
      {/* Header & New Chat Button */}
      <div className="p-3.5 border-b border-slate-800 dark:border-zinc-800/90 space-y-2.5">
        <button
          type="button"
          onClick={handleNewChat}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-100 font-bold text-sm shadow-xs transition group cursor-pointer select-none"
        >
          <span className="flex items-center gap-2.5">
            <Plus className="w-4.5 h-4.5 text-zinc-950 group-hover:rotate-90 transition-transform duration-300" />
            <span>New Chat</span>
          </span>
          <Sparkles className="w-4 h-4 text-zinc-600" />
        </button>

        {/* Twin AI Direct Link */}
        <a
          href="/twin"
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-200 text-sm font-semibold transition no-underline shadow-xs cursor-pointer select-none group"
        >
          <span className="flex items-center gap-2.5">
            <Sparkles className="w-4.5 h-4.5 text-zinc-400 group-hover:text-white transition-colors" />
            <span className="text-zinc-200 group-hover:text-white">Twin AI</span>
          </span>
          <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
        </a>

        {/* Quick Search Bar */}
        <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/20 transition">
          <Search className="w-4 h-4 text-zinc-400 shrink-0 mr-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setSearchQuery("");
            }}
            placeholder="Search chats..."
            className="w-full bg-transparent text-xs text-zinc-100 outline-none placeholder:text-zinc-500 font-sans"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-zinc-400 hover:text-white text-xs px-1.5 cursor-pointer select-none"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Grouped Session List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 custom-scrollbar">
        
        {/* Helper Group Renderer */}
        {renderGroup("Today", groupedConversations.today)}
        {renderGroup("Yesterday", groupedConversations.yesterday)}
        {renderGroup("Previous 7 Days", groupedConversations.past7Days)}
        {renderGroup("Older", groupedConversations.older)}

        {filteredConversations.length === 0 && (
          <div className="text-center py-8 px-4 text-zinc-500 text-xs font-mono">
            No chat sessions found
          </div>
        )}
      </div>

      {/* Quick Agentic Workspace Shortcuts Footer */}
      <div className="p-3.5 border-t border-white/[0.08] bg-black/60 space-y-1.5 text-xs">
        <span className="text-[11px] font-mono text-zinc-400 uppercase px-2 font-bold tracking-wider select-none">Workspaces</span>

        {onOpenParallelSpace && (
          <button
            type="button"
            onClick={onOpenParallelSpace}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/[0.06] transition cursor-pointer select-none group"
          >
            <span className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-zinc-400 group-hover:text-white" />
              <span className="text-sm font-medium">Parallel Web Space</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
          </button>
        )}

        {onOpenDataSheet && (
          <button
            type="button"
            onClick={onOpenDataSheet}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/[0.06] transition cursor-pointer select-none group"
          >
            <span className="flex items-center gap-2.5">
              <Table className="w-4 h-4 text-zinc-400 group-hover:text-white" />
              <span className="text-sm font-medium">Data Sheet Canvas</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
          </button>
        )}

        {onOpenSlideDeck && (
          <button
            type="button"
            onClick={onOpenSlideDeck}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/[0.06] transition cursor-pointer select-none group"
          >
            <span className="flex items-center gap-2.5">
              <Presentation className="w-4 h-4 text-zinc-400 group-hover:text-white" />
              <span className="text-sm font-medium">Slide Generator</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
          </button>
        )}

        {/* Collapsible Writing Suite */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setIsWritingSuiteOpen(!isWritingSuiteOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/[0.06] transition cursor-pointer select-none group"
          >
            <span className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-zinc-400 group-hover:text-white" />
              <span className="text-sm font-medium text-zinc-200">Writing Suite</span>
            </span>
            <ChevronRight className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${isWritingSuiteOpen ? "rotate-90" : ""}`} />
          </button>
          
          {isWritingSuiteOpen && (
            <div className="pl-6 space-y-1 text-xs text-zinc-400 border-l-2 border-white/[0.08] ml-4 py-1">
              <a href="/writing-studio" className="block py-1 hover:text-zinc-200 transition font-medium">✍️ Paraphraser</a>
              <a href="/writing-studio?tool=grammar" className="block py-1 hover:text-zinc-200 transition font-medium">📝 Grammar Fixer</a>
              <a href="/ai-detector" className="block py-1 hover:text-zinc-200 transition font-medium">🤖 AI Detector</a>
              <a href="/ai-detector?mode=humanize" className="block py-1 hover:text-zinc-200 transition font-medium">👤 Humanize GPT</a>
              <a href="/plagiarism-checker" className="block py-1 hover:text-zinc-200 transition font-medium">🔍 Plagiarism Checker</a>
              <a href="/writing-studio?tool=summarizer" className="block py-1 hover:text-zinc-200 transition font-medium">📑 Text Summarizer</a>
              <a href="/writing-studio?tool=translator" className="block py-1 hover:text-zinc-200 transition font-medium">🌐 Translator</a>
              <a href="/plagiarism-checker?mode=citations" className="block py-1 hover:text-zinc-200 transition font-medium">📚 Citation Generator</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function renderGroup(title: string, list: ChatSidebarItem[]) {
    if (list.length === 0) return null;
    return (
      <div className="space-y-1.5">
        <div className="px-2.5 text-xs font-mono font-bold text-slate-300 uppercase tracking-wider select-none">
          {title} ({list.length})
        </div>
        <div className="space-y-1">
          {list.map(chat => {
            const isActive = activeConversationId === String(chat._id);
            const isHovered = hoveredChatId === String(chat._id);

            return (
              <div
                key={String(chat._id)}
                onMouseEnter={() => setHoveredChatId(String(chat._id))}
                onMouseLeave={() => setHoveredChatId(null)}
                className="relative group"
              >
                <button
                  type="button"
                  onClick={() => handleSelectConversation(String(chat._id))}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-left transition cursor-pointer select-none ${
                    isActive
                      ? "bg-slate-800 text-white font-semibold shadow-xs border border-slate-700"
                      : "text-slate-200 hover:bg-slate-900 hover:text-white font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <MessageSquare className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                    <span className="truncate">{chat.title || "Untitled Chat"}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {chat.pinned && (
                      <Pin className="w-4 h-4 text-amber-400 shrink-0 ml-1" />
                    )}
                    {isHovered && onDeleteConversation && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(String(chat._id));
                        }}
                        className="p-1 hover:text-rose-400 text-slate-400 transition cursor-pointer"
                        title="Delete Session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </button>

                {/* Hover Preview Card */}
                {isHovered && (
                  <div className="absolute left-full top-0 ml-2 z-50 w-56 p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl space-y-2 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-[11px] font-semibold text-slate-200 truncate">{chat.title}</span>
                      <span className="text-[9px] font-mono bg-emerald-950 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-800">
                        {chat.modelHandle || "Hermes 3"}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                      {chat.lastMessageSnippet || "No preview text available..."}
                    </p>
                    <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pt-1 border-t border-slate-800/50">
                      <span>{chat.messageCount || 1} messages</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> Active
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
