import Image from "next/image";
import { Link } from 'wouter';
import { usePathname, useRouter } from '@/lib/navigation';
import { useSelector } from 'react-redux';
import { useTranslation } from '@/i18n';
import NotificationBell from '@/components/forum/NotificationBell';
import { useChatHistory } from "@/hooks/useChatHistory";
import {
  MessageSquare,
  Search,
  FolderOpen,
  Link2,
  Cpu,
  Brain,
  FileText,
  Users,
  Settings,
  Plus,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";

function NavItem({
  icon,
  label,
  href,
  isActive,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline",
        isActive
          ? "bg-brand/10 text-brand font-semibold shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <div className={cn("flex items-center justify-center", isActive ? "text-brand" : "text-muted-foreground")}>
        {icon}
      </div>
      <span className="truncate">{label}</span>
    </Link>
  );
}

export default function IconNavSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (match: string) => pathname.startsWith(match);
  const user = useSelector((state: any) => state.auth?.user);
  const masterId: string | null = user?._id ?? user?.email ?? null;
  const { t } = useTranslation();
  const { conversations } = useChatHistory({
    surface: "flagship",
    limit: 5,
    enabled: !!user?._id,
  });

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 bg-sidebar border-r border-sidebar-border z-40 overflow-hidden flex-shrink-0">
      {/* Brand Header */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border flex-shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/moscot.png"
            alt="Shothik AI"
            width={28}
            height={28}
            className="object-contain"
          />
          <span className="font-semibold text-lg tracking-tight text-foreground">Shothik</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        
        {/* Workspace Actions */}
        <div className="space-y-2">
          <Link 
            href={`/agents/chat?conversationId=new_${Date.now()}`}
            className="flex items-center w-full justify-start gap-2 shadow-sm font-medium h-9 px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Link>
        </div>

        {/* Primary Nav */}
        <div className="space-y-1">
          <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Workspace
          </div>
          <NavItem
            icon={<MessageSquare className="h-4 w-4" />}
            label="Chat"
            href="/agents/chat"
            isActive={isActive('/agents/chat') && !pathname.includes('/research')}
          />
          <NavItem
            icon={<Search className="h-4 w-4" />}
            label="Deep Research"
            href="/deep-research"
            isActive={isActive('/deep-research')}
          />
          <NavItem
            icon={<Brain className="h-4 w-4" />}
            label="Twin"
            href="/twin"
            isActive={isActive('/twin')}
          />
          <NavItem
            icon={<FolderOpen className="h-4 w-4" />}
            label="Files"
            href="/files"
            isActive={isActive('/files')}
          />
          <NavItem
            icon={<Link2 className="h-4 w-4" />}
            label="Connectors"
            href="/connectors"
            isActive={isActive('/connectors')}
          />
          <NavItem
            icon={<FileText className="h-4 w-4" />}
            label="Saved Reports"
            href="/saved-reports"
            isActive={isActive('/saved-reports')}
          />
        </div>

        {/* Recents */}
        {conversations && conversations.length > 0 && (
          <div className="space-y-1">
            <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Recents
            </div>
            {conversations.map((chat) => (
              <button
                key={chat._id}
                onClick={() => router.push(`/agents/chat?conversationId=${chat._id}`)}
                className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-brand/50 shrink-0" />
                <span className="truncate">{chat.title || "Untitled Chat"}</span>
              </button>
            ))}
          </div>
        )}

        {/* Knowledge & Organization */}
        <div className="space-y-1">
          <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Community & Settings
          </div>
          <NavItem
            icon={<Cpu className="h-4 w-4" />}
            label="Skills"
            href="/agents"
            isActive={isActive('/agents') && !isActive('/agents/chat')}
          />
          <NavItem
            icon={<Users className="h-4 w-4" />}
            label="Community"
            href="/community"
            isActive={isActive('/community')}
          />
          <NavItem
            icon={<Settings className="h-4 w-4" />}
            label="Settings"
            href="/settings"
            isActive={isActive('/settings')}
          />
        </div>

      </div>

      {/* Footer / Account */}
      <div className="p-4 border-t border-sidebar-border mt-auto flex items-center gap-3">
        {masterId && (
          <div className="flex-shrink-0">
            <NotificationBell masterId={masterId} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Link href="/account" className="flex flex-col min-w-0 group cursor-pointer no-underline">
            <span className="text-sm font-medium text-foreground truncate group-hover:text-brand transition-colors">
              {user?.name || "Account"}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {user?.email || "Manage profile"}
            </span>
          </Link>
        </div>
      </div>
    </aside>
  );
}