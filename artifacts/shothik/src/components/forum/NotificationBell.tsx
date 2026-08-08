

import { Component, useState, useRef, useEffect, type ReactNode } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Bell, Bot, BookOpen, MessageSquare, RefreshCw, CheckCheck, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "@/i18n";

interface NotificationErrorBoundaryProps {
  onRetry: () => void;
  loadFailedLabel: string;
  retryLabel: string;
  children: ReactNode;
}

class NotificationErrorBoundary extends Component<
  NotificationErrorBoundaryProps,
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    this.props.onRetry();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-amber-500" />
          <p className="text-sm text-foreground">{this.props.loadFailedLabel}</p>
          <button
            onClick={this.handleRetry}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {this.props.retryLabel}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function NotificationList({
  masterId,
  onNavigate,
}: {
  masterId: string;
  onNavigate: () => void;
}) {
  const { t } = useTranslation();
  const notifications = useQuery(api.agent_notifications.getMasterNotifications, { masterId });
  const markAsRead = useMutation(api.agent_notifications.markAsRead);

  if (!notifications) {
    return <div className="p-4 text-center text-sm text-muted-foreground">{t("notifications.loading")}</div>;
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <Bell className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t("notifications.noneYet")}</p>
        <p className="text-xs text-muted-foreground mt-1">{t("notifications.agentsWillNotify")}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {notifications.map((n: any) => {
        const config = TYPE_CONFIG[n.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.review_needed;
        const href = n.bookId ? `/account/review/${n.bookId}` : n.forumId ? `/community/${n.forumId}` : "/account/agents";
        return (
          <Link
            key={n._id}
            href={href}
            onClick={() => { markAsRead({ notificationId: n._id }); onNavigate(); }}
            className={`flex gap-3 px-4 py-3 hover:bg-muted transition-colors ${!n.read ? "bg-primary/5" : ""}`}
          >
            <div className="mt-0.5 flex-shrink-0">{config.icon}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-1">
                <span className="text-xs font-semibold text-foreground">{t(config.labelKey)}</span>
                {!n.read && (
                  <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
              <p className="mt-1 text-xs text-muted-foreground/60">{n.agentName} · {timeAgo(n.createdAt, t)}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

const TYPE_CONFIG = {
  format_complete: { icon: <BookOpen className="h-4 w-4 text-blue-500" />, labelKey: "notifications.typeFormatComplete" },
  review_needed: { icon: <RefreshCw className="h-4 w-4 text-amber-500" />, labelKey: "notifications.typeReviewNeeded" },
  forum_opened: { icon: <MessageSquare className="h-4 w-4 text-emerald-500" />, labelKey: "notifications.typeForumOpened" },
  revision_requested: { icon: <RefreshCw className="h-4 w-4 text-rose-500" />, labelKey: "notifications.typeRevisionRequested" },
};

function timeAgo(ts: number, t: (key: string, values?: Record<string, string | number>) => string): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return t("notifications.justNow");
  if (diff < 3600000) return t("notifications.minutesAgo", { count: Math.floor(diff / 60000) });
  if (diff < 86400000) return t("notifications.hoursAgo", { count: Math.floor(diff / 3600000) });
  return t("notifications.daysAgo", { count: Math.floor(diff / 86400000) });
}

export default function NotificationBell({ masterId }: { masterId: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = useQuery(api.agent_notifications.getUnreadCount, { masterId });
  const markAllAsRead = useMutation(api.agent_notifications.markAllAsRead);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const count = unreadCount ?? 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label={count > 0 ? t("notifications.ariaLabelUnread", { count }) : t("notifications.ariaLabel")}
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-border bg-background shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-semibold text-foreground">{t("notifications.agentNotifications")}</span>
              {count > 0 && (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </div>
            {count > 0 && (
              <button
                onClick={() => markAllAsRead({ masterId })}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                {t("notifications.markAllRead")}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            <NotificationErrorBoundary
              key={retryKey}
              onRetry={() => setRetryKey((k) => k + 1)}
              loadFailedLabel={t("notifications.loadFailed")}
              retryLabel={t("notifications.retry")}
            >
              <NotificationList masterId={masterId} onNavigate={() => setOpen(false)} />
            </NotificationErrorBoundary>
          </div>
        </div>
      )}
    </div>
  );
}
