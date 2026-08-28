import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n';
import {
  BookOpen,
  Sparkles,
  MessageSquare,
  PenTool,
  User,
} from 'lucide-react';
import { Link } from 'wouter';
import { usePathname } from '@/lib/navigation';

const NAV_ITEMS = [
  {
    labelKey: 'nav.chat',
    defaultLabel: 'Chat',
    icon: MessageSquare,
    href: '/agents/chat',
    match: ['/agents', '/chat'],
  },
  {
    labelKey: 'nav.tools',
    defaultLabel: 'Tools',
    icon: PenTool,
    href: '/paraphrase',
    match: ['/paraphrase', '/ai-detector', '/humanize-gpt', '/plagiarism-checker', '/grammar-checker', '/summarize', '/translator'],
  },
  {
    labelKey: 'nav.home',
    defaultLabel: 'Studio',
    icon: Sparkles,
    href: '/writing-studio',
    match: ['/writing-studio'],
  },
  {
    labelKey: 'nav.books',
    defaultLabel: 'Boi Mela',
    icon: BookOpen,
    href: '/marketplace',
    match: ['/marketplace', '/books'],
  },
  {
    labelKey: 'nav.account',
    defaultLabel: 'Profile',
    icon: User,
    href: '/account',
    match: ['/account'],
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const isActive = (matches: string[]) =>
    matches.some((m) => pathname.startsWith(m));

  // Hide bottom nav when deep inside the full-screen writing studio editor
  if (pathname.startsWith('/writing-studio') && pathname.includes('doc')) return null;

  return (
    <nav
      aria-label="Mobile navigation bar"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] dark:border-white/[0.06] bg-background/80 dark:bg-zinc-950/80 backdrop-blur-2xl md:hidden shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-all duration-200"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 6px)' }}
    >
      <div className="flex items-center justify-around px-2 pt-1.5 pb-0.5 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.match);
          const Icon = item.icon;
          const label = t(item.labelKey) || item.defaultLabel;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center py-1 px-2 min-h-[48px] rounded-2xl transition-all duration-200 no-underline cursor-pointer group active:scale-95',
                active
                  ? 'text-brand font-semibold'
                  : 'text-muted-foreground hover:text-foreground active:text-foreground'
              )}
            >
              {/* Active Glass Pill Background (Perplexity / iOS Style) */}
              {active && (
                <span className="absolute inset-x-1.5 inset-y-1 rounded-xl bg-brand/12 dark:bg-brand/15 border border-brand/20 -z-10 animate-in fade-in zoom-in-95 duration-200" />
              )}

              <div className="relative">
                <Icon
                  className={cn(
                    'h-5 w-5 transition-transform duration-200',
                    active ? 'text-brand scale-110' : 'group-hover:scale-105'
                  )}
                />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 truncate max-w-[60px]">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
