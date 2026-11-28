import AgentHistory from "@/components/agents/shared/AgentHistory";
import AuthApplier from "@/components/appliers/AuthApplier";
import DebugLogApplier from "@/components/appliers/DebugLogApplier";
import SettingApplier from "@/components/appliers/SettingApplier";
import AuthSuccessPopup from "@/components/auth/AuthSuccessPopoup";
import VerifyEmailAlert from "@/components/auth/VerifyEmailAlert";
import FooterViewProvider from "@/components/common/FooterViewProvider";
import DebugPanel from "@/components/debug/DebugPanel";
import Footer from "@/components/partials/footer";
import Header from "@/components/partials/header";
import IconNavSidebar from "@/components/partials/icon-nav-sidebar";
import MobileBottomNav from "@/components/partials/mobile-bottom-nav";
import AlertDialog from "@/components/tools/common/AlertDialog";
import { SidebarProvider } from "@/components/ui/sidebar";
import { usePathname, useSearchParams } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import ProgressProvider from "@/providers/ProgressProvider";
import { Suspense } from "react";

export default function PrimaryLayout({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Full-screen IDE workspaces (Writing Studio, Main Chat, Twin, Research) manage their own internal headers & scrollbars
  const isWritingStudioWorkspace =
    pathname.startsWith("/writing-studio") &&
    (Boolean(searchParams.get("projectId")) ||
      Boolean(searchParams.get("docId")) ||
      searchParams.get("mode") === "3fold" ||
      searchParams.get("workspace") === "3fold" ||
      /^\/writing-studio\/[^/]+$/.test(pathname));

  const isFullViewportIde =
    isWritingStudioWorkspace ||
    pathname === "/" ||
    pathname === "/agents/chat" ||
    pathname === "/writing-studio/chat";

  return (
    <ProgressProvider
      color={"#00AB55"}
      options={{ showSpinner: false }}
      shallowRouting
    >
      <>
        <AuthApplier />
        <DebugLogApplier />
        <SettingApplier />
      </>
      <div suppressHydrationWarning>
        <SidebarProvider defaultOpen={false}>
          <div className="flex h-screen w-full bg-background text-foreground transition-colors duration-200">
            <IconNavSidebar />
            <div className="flex h-screen flex-1 flex-col overflow-hidden">
              {!isFullViewportIde && <Header layout="primary" />}
              <VerifyEmailAlert />
              <div
                className={cn(
                  "primary-layout-wrapper flex max-w-full flex-1 flex-col pb-14 md:pb-0",
                  isFullViewportIde ? "overflow-hidden" : "overflow-y-auto"
                )}
              >
                <div className="relative flex flex-1 flex-col min-h-0">
                  <Suspense fallback={null}>
                    <AgentHistory />
                  </Suspense>
                  {children}
                </div>
                {!isFullViewportIde && (
                  <FooterViewProvider>
                    <Footer />
                  </FooterViewProvider>
                )}
              </div>
            </div>
          </div>
          <MobileBottomNav />
        </SidebarProvider>
      </div>
      <>
        <AuthSuccessPopup />
        <AlertDialog />
        {/* DebugPanel is an admin-only surface — opt-in via VITE_SHOW_DEBUG=true */}
        {import.meta.env.VITE_SHOW_DEBUG === 'true' && <DebugPanel />}
      </>
    </ProgressProvider>
  );
}
