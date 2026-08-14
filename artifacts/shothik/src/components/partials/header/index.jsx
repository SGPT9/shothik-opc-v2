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


const NotificationBell = lazy(() => import("@/components/forum/NotificationBell"));

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
      { labelKey: "header.aiSlides", icon: Presentation, href: "#ai-slides" },
      { labelKey: "header.deepResearch", icon: Beaker, href: "#research" },
      { labelKey: "header.dataAnalysis", icon: BarChart3, href: "#data-analysis" },
    ],
  },
  vibeMetaAutomation: {
    titleKey: "header.vibeMetaAutomation",
    items: [
      { labelKey: "header.productAnalysis", icon: FileText, href: "#product-analysis" },
      { labelKey: "header.aiStrategy", icon: Lightbulb, href: "#ai-strategy" },
      { labelKey: "header.aiAdSets", icon: Images, href: "#ai-ad-sets" },
      { labelKey: "header.aiAdCreatives", icon: Palette, href: "#ai-ad-creatives" },
      { labelKey: "header.aiAdCopies", icon: FileText, href: "#ai-ad-copies" },
      { labelKey: "header.aiPoweredEditing", icon: Brush, href: "#vibe-canvas" },
      { labelKey: "header.aiMediaCanvas", icon: Image, href: "#media-canvas" },
      { labelKey: "header.adLaunch", icon: Rocket, href: "#ad-launch" },
      { labelKey: "header.mindmapReports", icon: GitBranch, href: "#mindmap-reports" },
      { labelKey: "header.aiOptimization", icon: TrendingUp, href: "#ai-optimization" },
    ],
  },
};

export default function Header({ className, layout }) {
  const { accessToken, user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.settings);
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
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
    translateSection(featuresMenuKeys.vibeMetaAutomation),
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
              {/* 🎙️ Advanced Voice Mode Button */}
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("shothik_toggle_vtuber"));
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 text-xs font-semibold transition cursor-pointer"
                title="Launch Interactive Advanced Voice Mode"
              >
                <span>🎙️</span>
                <span>Advanced Voice</span>
              </button>

              {/* ⚡ Credit Badge */}
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-slate-800/80 border border-zinc-200 dark:border-slate-700 text-brand hover:border-brand/50 font-mono text-xs font-semibold transition no-underline"
                title="Workspace Credit Balance (Click to top-up)"
              >
                <span>⚡</span>
                <span>550 Credits</span>
              </Link>

              <LanguageSwitcher className="inline-flex" />
              <ThemeToggle className="inline-flex" />
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
                        <Button
                          className={cn("h-9 px-3 text-xs md:text-sm")}
                          data-rybbit-event="clicked_upgrade_plan"
                        >
                          <Gem className="h-4 w-4 mr-1.5" />
                          {user?.email ? t("header.upgrade") : t("header.upgradePlan")}
                        </Button>
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
              className="text-foreground lg:hidden"
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
                  className="text-muted-foreground hover:text-primary hover:bg-muted/50 px-2 text-sm font-semibold transition-colors"
                  data-testid={`nav-${link.label.toLowerCase()}`}
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <LanguageSwitcher className="inline-flex" />
              <ThemeToggle className="inline-flex" />
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
                      <Button
                        data-rybbit-event="clicked_upgrade_plan"
                        className={cn("h-9 px-1 text-xs md:text-sm")}
                      >
                        <Gem className="h-5 w-5" />
                        {user?.email ? t("header.upgrade") : t("header.upgradePlan")}
                      </Button>
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
