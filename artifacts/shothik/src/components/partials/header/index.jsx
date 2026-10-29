import { lazy, Suspense } from 'react';


import Logo from "@/components/partials/logo";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useGetUserQuery } from "@/redux/api/auth/authApi";
import { updateTheme } from "@/redux/slices/settings-slice";
import {
  AlignRight,
  BarChart3,
  Beaker,
  Brain,
  Brush,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Edit,
  FileText,
  FileSearch,
  Gem,
  GitBranch,
  Image,
  Images,
  Languages,
  Lightbulb,
  Menu,
  Palette,
  Presentation,
  Rocket,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "wouter";
import { usePathname } from "@/lib/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AccountPopover from "./AccountPopover";
import LanguageSwitcher from "./LanguageSwitcher";
import MenuColumn from "./MenuColumn";
import MobileMenu from "./MobileMenu";
import ThemeToggle from "./ThemeToggle";
import { useTranslation } from "@/i18n";
import { OfflineSyncStatusBadge } from "@/components/sync/OfflineSyncStatusBadge";
import { useAuth } from "@/providers/AuthProvider";
import { fetchAgents } from "@/services/agent-team.service";

const NotificationBell = lazy(() => import("@/components/forum/NotificationBell"));
const TeamModal = lazy(() => import("@/components/team/TeamModal"));

const navLinkKeys = [
  { key: "nav.about", href: "/about-us" },
  { key: "nav.contact", href: "/contact-us" },
  { key: "nav.pricing", href: "/pricing" },
  { key: "nav.blogs", href: "/blogs" },
];

const featuresMenuKeys = {
  writing: {
    titleKey: "header.writing",
    items: [
      { labelKey: "header.paraphrase", icon: Edit, href: "/paraphrase" },
      { labelKey: "header.aiDetector", icon: Brain, href: "/ai-detector" },
      { labelKey: "header.humanizer", icon: Sparkles, href: "/humanize-gpt" },
      { labelKey: "header.plagiarismChecker", icon: FileSearch, href: "/plagiarism-checker" },
      { labelKey: "header.grammarChecker", icon: CheckCheck, href: "/grammar-checker" },
      { labelKey: "header.summarizer", icon: CheckCheck, href: "/summarize" },
      { labelKey: "header.translator", icon: Languages, href: "/translator" },
    ],
  },
  agents: {
    titleKey: "header.agents",
    items: [
      { labelKey: "header.aiSlides", icon: Presentation, href: "/slide-generation" },
      { labelKey: "header.deepResearch", icon: Beaker, href: "/research" },
      { labelKey: "header.dataAnalysis", icon: BarChart3, href: "/canvas" },
      { labelKey: "nav.twin", icon: Sparkles, href: "/twin" },
      { labelKey: "nav.writingStudio", icon: FileText, href: "/writing-studio" },
    ],
  },
};

export default function Header({ className, layout }) {
  const { accessToken, user: reduxUser } = useSelector((state) => state.auth);
  const { user: authUser } = useAuth();
  const user = reduxUser || authUser;
  const userCredits = authUser?.credits ?? reduxUser?.credits ?? 550;
  const { theme } = useSelector((state) => state.settings);
  const [mounted, setMounted] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [agentCount, setAgentCount] = useState(3);
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
    fetchAgents()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAgentCount(data.length);
        }
      })
      .catch(() => {});
  }, []);

  const { isLoading } = useGetUserQuery(undefined, {
    skip: !accessToken,
  });

  const dispatch = useDispatch();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);

  const showLoadingState = !mounted || isLoading;

  const navLinks = navLinkKeys.map((link) => ({
    label: t(link.key),
    href: link.href,
  }));

  const translateSection = (section) => ({
    title: t(section.titleKey),
    items: section.items.map((item) => ({
      label: t(item.labelKey),
      icon: item.icon,
      href: item.href,
    })),
  });

  const featuresSections = [
    translateSection(featuresMenuKeys.writing),
    translateSection(featuresMenuKeys.agents),
  ];

  if (layout === "primary") {
    return (
      <header
        className={cn(
          "relative z-40 h-13 border-none bg-transparent px-4 sm:px-6 transition-colors duration-200",
          className,
        )}
      >
        <div className="flex h-full items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo className="lg:hidden" />
            <div className="hidden lg:flex items-center gap-2 text-zinc-500 hover:text-zinc-400 transition cursor-default">
              <span className="p-1 rounded-md hover:bg-white/[0.05]">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {/* 👥 Autonomous Team Badge */}
              <button
                type="button"
                onClick={() => setTeamModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-black/60 border border-zinc-300 dark:border-white/[0.12] hover:border-indigo-500/50 text-zinc-950 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-300 font-mono text-xs font-bold transition no-underline shadow-2xs backdrop-blur-xl cursor-pointer"
                title="Autonomous Agent Team & Orchestration Studio (Click to configure)"
                data-testid="header-team-badge"
              >
                <Users className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>{agentCount} Agents</span>
              </button>

              {/* ⚡ Credit Badge */}
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-black/60 border border-zinc-300 dark:border-white/[0.12] text-zinc-950 dark:text-zinc-100 hover:border-emerald-500/50 font-mono text-xs font-bold transition no-underline shadow-2xs backdrop-blur-xl"
                title="Workspace Credit Balance (Click to top-up)"
              >
                <span className="text-amber-500">⚡</span>
                <span>{userCredits} Credits</span>
              </Link>

              <LanguageSwitcher className="hidden sm:inline-flex" />
              <ThemeToggle className="hidden sm:inline-flex" />
              <div className="flex items-center gap-2 md:gap-3">
                {showLoadingState ? (
                  <div className="flex items-center gap-1">
                    <span className="bg-primary h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]" />
                    <span className="bg-primary h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]" />
                    <span className="bg-primary h-2 w-2 animate-bounce rounded-full" />
                  </div>
                ) : (
                  <>
                    {user?.email && (
                      <NotificationBell masterId={user._id ?? user.email} />
                    )}
                    {user?.package !== "unlimited" && (
                      <Link href={"/pricing?redirect=" + pathname}>
                        <button
                          className="flex items-center gap-1.5 h-8 px-2.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white bg-zinc-100 dark:bg-black/60 border border-zinc-200 dark:border-white/[0.12] transition rounded-lg hover:bg-zinc-200/70 dark:hover:bg-white/[0.06] cursor-pointer shadow-2xs backdrop-blur-xl"
                          data-rybbit-event="clicked_upgrade_plan"
                        >
                          <Gem className="h-3.5 w-3.5 text-indigo-400" />
                          {user?.email ? t("header.upgrade") : t("header.upgradePlan")}
                        </button>
                      </Link>
                    )}
                  </>
                )}

                {!showLoadingState && (
                  <AccountPopover accessToken={accessToken} user={user} />
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              aria-label="Open navigation menu"
              className="text-zinc-800 dark:text-zinc-200 lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
              data-testid="button-mobile-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <MobileMenu
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          featuresSections={featuresSections}
          navLinks={navLinks}
          theme={theme}
          setTheme={(value) => dispatch(updateTheme(value))}
        />

        <Suspense fallback={null}>
          {teamModalOpen && (
            <TeamModal isOpen={teamModalOpen} onClose={() => setTeamModalOpen(false)} />
          )}
        </Suspense>
      </header>
    );
  }

  if (layout === "secondary") {
    return (
      <header
        className={cn(
          "bg-card relative z-50 h-12 border-b backdrop-blur-lg lg:h-16",
          className,
        )}
      >
        <div className="flex h-full items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Logo />
            </div>

            <div className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => (
                <Button
                  key={link.label}
                  variant="ghost"
                  asChild
                  className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-muted/50 px-2.5 text-sm font-semibold transition-colors"
                  data-testid={`nav-${link.label.toLowerCase()}`}
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <OfflineSyncStatusBadge />
              <LanguageSwitcher className="hidden sm:inline-flex" />
              <ThemeToggle className="hidden sm:inline-flex" />
              <div className="flex items-center gap-2 md:gap-3">
                {showLoadingState ? (
                  <div className="flex items-center gap-1">
                    <span className="bg-primary h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]" />
                    <span className="bg-primary h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]" />
                    <span className="bg-primary h-2 w-2 animate-bounce rounded-full" />
                  </div>
                ) : (
                  user?.package !== "unlimited" && (
                    <Link href={"/pricing?redirect=" + pathname}>
                      <button
                        data-rybbit-event="clicked_upgrade_plan"
                        className="flex items-center gap-1.5 h-8 px-2.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition rounded-lg hover:bg-zinc-200/70 dark:hover:bg-zinc-700/60 cursor-pointer shadow-2xs"
                      >
                        <Gem className="h-3.5 w-3.5 text-indigo-500" />
                        {user?.email ? t("header.upgrade") : t("header.upgradePlan")}
                      </button>
                    </Link>
                  )
                )}

                {!showLoadingState && (
                  <AccountPopover accessToken={accessToken} user={user} />
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              aria-label="Open navigation menu"
              className="text-foreground lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
              data-testid="button-mobile-menu"
            >
              <AlignRight className="size-8" />
            </Button>
          </div>
        </div>

        <MobileMenu
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          featuresSections={featuresSections}
          navLinks={navLinks}
          theme={theme}
          setTheme={(value) => dispatch(updateTheme(value))}
        />
      </header>
    );
  }
}
