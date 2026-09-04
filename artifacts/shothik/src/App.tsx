import { lazy, Suspense, type ComponentType } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter, Redirect } from 'wouter';
import Providers from '@/providers';
import PrimaryLayout from '@/app-next/(primary-layout)/layout';
import SecondaryLayout from '@/app-next/(secondary-layout)/layout';
import { ComponentErrorBoundary } from '@/components/agents/components/ChatErrorBoundaries';

// Wraps a page component in the primary layout (left icon sidebar + content)
function withPrimaryLayout<P extends object>(Page: ComponentType<P>) {
  return function WrappedPage(props: P) {
    return (
      <PrimaryLayout>
        <Page {...props} />
      </PrimaryLayout>
    );
  };
}

// Wraps a page component in the secondary layout (top public header + main content + footer)
function withSecondaryLayout<P extends object>(Page: ComponentType<P>) {
  return function WrappedPage(props: P) {
    return (
      <SecondaryLayout>
        <Page {...props} />
      </SecondaryLayout>
    );
  };
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

// Primary layout pages
const AgentsChatPage = lazy(() => import('@/app-next/(primary-layout)/agents/chat/page'));
const ParaphrasePage = lazy(() => import('@/app-next/(primary-layout)/paraphrase/page'));
const HumanizePage = lazy(() => import('@/app-next/(primary-layout)/humanize-gpt/page'));
const GrammarCheckerPage = lazy(() => import('@/app-next/(primary-layout)/grammar-checker/page'));
const AiDetectorPage = lazy(() => import('@/app-next/(primary-layout)/ai-detector/page'));
const SummarizePage = lazy(() => import('@/app-next/(primary-layout)/summarize/page'));
const TranslatorPage = lazy(() => import('@/app-next/(primary-layout)/translator/page'));
const BookPage = lazy(() => import('@/app-next/(primary-layout)/books/[bookId]/page'));
const CommunityPage = lazy(() => import('@/app-next/(primary-layout)/community/page'));
const CommunityForumPage = lazy(() => import('@/app-next/(primary-layout)/community/[forumId]/page'));
const ExplorePage = lazy(() => import('@/app-next/(primary-layout)/explore/page'));
const ExploreChannelsPage = lazy(() => import('@/app-next/(primary-layout)/explore/channels/page'));
const ExploreChannelSlugPage = lazy(() => import('@/app-next/(primary-layout)/explore/channels/[slug]/page'));
const HermesPage = lazy(() => import('@/app-next/(primary-layout)/hermes/page'));
const MarketplacePage = lazy(() => import('@/app-next/(primary-layout)/marketplace/page'));
const SecondMePage = lazy(() => import('@/app-next/(primary-layout)/second-me/page'));
const SlideGenerationPage = lazy(() => import('@/app-next/(primary-layout)/slide-generation/page'));
const AnimationPage = lazy(() => import('@/app-next/(primary-layout)/animation/page'));
const TwinPage = lazy(() => import('@/app-next/(primary-layout)/twin/page'));
const TwinNewPage = lazy(() => import('@/app-next/(primary-layout)/twin/new/page'));
const ResearchPage = lazy(() => import('@/app-next/(primary-layout)/research/page'));
const AccountPage = lazy(() => import('@/app-next/(primary-layout)/account/page'));
const AccountBillingPage = lazy(() => import('@/app-next/(primary-layout)/account/billing/page'));
const AccountAgentsPage = lazy(() => import('@/app-next/(primary-layout)/account/agents/page'));
const AccountSettingsPage = lazy(() => import('@/app-next/(primary-layout)/account/settings/page'));
const AccountReviewPage = lazy(() => import('@/app-next/(primary-layout)/account/review/[bookId]/page'));
const AgentStudioPage = lazy(() => import('@/app-next/(primary-layout)/agent-studio/page'));
const AgentsPage = lazy(() => import('@/app-next/(primary-layout)/agents/page'));
const AgentTypePage = lazy(() => import('@/app-next/(primary-layout)/agents/[agentType]/page'));
const AgentProfilePage = lazy(() => import('@/app-next/(primary-layout)/agents/profile/[agentId]/page'));
const AgentSharePage = lazy(() => import('@/app-next/(primary-layout)/agents/share-agent/[shareId]/page'));
const AiDetectorSharePage = lazy(() => import('@/app-next/(primary-layout)/agents/share-ai-detector/[shareId]/page'));
const SharedSheetPage = lazy(() => import('@/app-next/(primary-layout)/agents/shared-sheet/[shareId]/page'));
const AiDetectorSharedPage = lazy(() => import('@/app-next/(primary-layout)/ai-detector/shared/[shareLinkId]/page'));
const WritingStudioPage = lazy(() => import('@/app-next/(primary-layout)/writing-studio/page'));
const WritingStudioChatPage = lazy(() => import('@/app-next/(primary-layout)/writing-studio/chat/page'));
const SlideReplayPage = lazy(() => import('@/app-next/(primary-layout)/slide/replay/page'));
const PlagiarismCheckerPage = lazy(() => import('@/app-next/(primary-layout)/plagiarism-checker/page'));

// Secondary layout pages
const PricingPage = lazy(() => import('@/app-next/(secondary-layout)/pricing/page'));
const PricingCheckoutPage = lazy(() => import('@/app-next/(secondary-layout)/pricing/checkout/page'));
const PricingCheckoutSuccessPage = lazy(() => import('@/app-next/(secondary-layout)/pricing/checkout/success/page'));
const PricingCheckoutCancelPage = lazy(() => import('@/app-next/(secondary-layout)/pricing/checkout/cancel/page'));
const AboutUsPage = lazy(() => import('@/app-next/(secondary-layout)/about-us/page'));
const B2BPage = lazy(() => import('@/app-next/(secondary-layout)/b2b/page'));
const B2BServicesPage = lazy(() => import('@/app-next/(secondary-layout)/b2b/services/page'));
const BlogsPage = lazy(() => import('@/app-next/(secondary-layout)/blogs/page'));
const BlogDetailPage = lazy(() => import('@/app-next/(secondary-layout)/blogs/[slug]/page'));
const CareerPage = lazy(() => import('@/app-next/(secondary-layout)/career/page'));
const ContactUsPage = lazy(() => import('@/app-next/(secondary-layout)/contact-us/page'));
const DeletionPage = lazy(() => import('@/app-next/(secondary-layout)/deletion/page'));
const FAQsPage = lazy(() => import('@/app-next/(secondary-layout)/faqs/page'));
const FeaturesPage = lazy(() => import('@/app-next/(secondary-layout)/features/page'));
const MagnaCartaPage = lazy(() => import('@/app-next/(secondary-layout)/magna-carta/page'));
const TeamPage = lazy(() => import('@/app-next/(secondary-layout)/team/page'));
const TermsPage = lazy(() => import('@/app-next/(secondary-layout)/terms/page'));
const PrivacyPage = lazy(() => import('@/app-next/(secondary-layout)/privacy/page'));
const TutorialsPage = lazy(() => import('@/app-next/(secondary-layout)/tutorials/page'));
const ResellerPanelPage = lazy(() => import('@/app-next/(secondary-layout)/reseller-panel/page'));

// Auth pages
const LoginPage = lazy(() => import('@/app-next/auth/login/page'));
const RegisterPage = lazy(() => import('@/app-next/auth/register/page'));
const ForgotPasswordPage = lazy(() => import('@/app-next/auth/forgot-password/page'));
const PostLoginPage = lazy(() => import('@/app-next/auth/post-login/page'));
const LogtoCallbackPage = lazy(() => import('@/app-next/auth/logto-callback/page'));
const VerifyEmailCodePage = lazy(() => import('@/app-next/auth/verify-email/page'));
const VerifyEmailTokenPage = lazy(() => import('@/app-next/auth/verify-email/[token]/page'));
const ResetPasswordPage = lazy(() => import('@/app-next/auth/reset-password/[token]/page'));

// Dashboard pages
const CanvasPage = lazy(() => import('@/app-next/(dashboard)/canvas/page'));
const TonightEnginePage = lazy(() => import('@/app-next/(dashboard)/tonight-engine/page'));

// Slide layout pages
const EditSlidesPage = lazy(() => import('@/app-next/(slide-layout)/_edit-slides/page'));
const SlidesPage = lazy(async () => {
  const [{ default: Layout }, { default: Page }] = await Promise.all([
    import('@/app-next/(slide-layout)/slides/layout'),
    import('@/app-next/(slide-layout)/slides/page'),
  ]);
  return { default: () => <Layout><Page /></Layout> };
});
const SlideSharePage = lazy(async () => {
  const [{ default: Layout }, { default: Page }] = await Promise.all([
    import('@/app-next/(slide-layout)/slide-share/[shareLink]/layout'),
    import('@/app-next/(slide-layout)/slide-share/[shareLink]/page'),
  ]);
  return { default: (props: any) => <Layout><Page {...props} /></Layout> };
});

// Misc
const SharedContentPage = lazy(() => import('@/app-next/shared/[contentType]/[shareId]/page'));
const AgentDemoPage = lazy(() => import('@/app-next/agent-demo/page'));

// New Workspace Pages
const FilesPage = lazy(() => import('@/app-next/(primary-layout)/files/page'));
const ConnectorsPage = lazy(() => import('@/app-next/(primary-layout)/connectors/page'));
const SavedReportsPage = lazy(() => import('@/app-next/(primary-layout)/saved-reports/page'));
const DeepResearchPage = lazy(() => import('@/app-next/(primary-layout)/deep-research/page'));
const SettingsWorkspacePage = lazy(() => import('@/app-next/(primary-layout)/settings/page'));

const AdminControlCenter = lazy(() => import('@/components/admin/AdminControlCenter'));

// Hoisted so route component identities are stable across renders
const AdminControlCenterWithLayout = withPrimaryLayout(AdminControlCenter);
const AccountAgentsPageWithLayout = withPrimaryLayout(AccountAgentsPage);
const AccountBillingPageWithLayout = withPrimaryLayout(AccountBillingPage);
const AccountPageWithLayout = withPrimaryLayout(AccountPage);
const AccountReviewPageWithLayout = withPrimaryLayout(AccountReviewPage);
const AccountSettingsPageWithLayout = withPrimaryLayout(AccountSettingsPage);
const AgentProfilePageWithLayout = withPrimaryLayout(AgentProfilePage);
const AgentSharePageWithLayout = withPrimaryLayout(AgentSharePage);
const AgentStudioPageWithLayout = withPrimaryLayout(AgentStudioPage);
const AgentTypePageWithLayout = withPrimaryLayout(AgentTypePage);
const AgentsChatPageWithLayout = withPrimaryLayout(AgentsChatPage);
const AgentsPageWithLayout = withPrimaryLayout(AgentsPage);
const AiDetectorPageWithLayout = withPrimaryLayout(AiDetectorPage);
const AiDetectorSharePageWithLayout = withPrimaryLayout(AiDetectorSharePage);
const AiDetectorSharedPageWithLayout = withPrimaryLayout(AiDetectorSharedPage);
const AnimationPageWithLayout = withPrimaryLayout(AnimationPage);
const BookPageWithLayout = withPrimaryLayout(BookPage);
const CommunityForumPageWithLayout = withPrimaryLayout(CommunityForumPage);
const CommunityPageWithLayout = withPrimaryLayout(CommunityPage);
const ExploreChannelSlugPageWithLayout = withPrimaryLayout(ExploreChannelSlugPage);
const ExploreChannelsPageWithLayout = withPrimaryLayout(ExploreChannelsPage);
const ExplorePageWithLayout = withPrimaryLayout(ExplorePage);
const GrammarCheckerPageWithLayout = withPrimaryLayout(GrammarCheckerPage);
const HermesPageWithLayout = withPrimaryLayout(HermesPage);
const HumanizePageWithLayout = withPrimaryLayout(HumanizePage);
const MarketplacePageWithLayout = withPrimaryLayout(MarketplacePage);
const ParaphrasePageWithLayout = withPrimaryLayout(ParaphrasePage);
const PlagiarismCheckerPageWithLayout = withPrimaryLayout(PlagiarismCheckerPage);
const ResearchPageWithLayout = withPrimaryLayout(ResearchPage);
const SecondMePageWithLayout = withPrimaryLayout(SecondMePage);
const SharedSheetPageWithLayout = withPrimaryLayout(SharedSheetPage);
const SlideGenerationPageWithLayout = withPrimaryLayout(SlideGenerationPage);
const SummarizePageWithLayout = withPrimaryLayout(SummarizePage);
const TranslatorPageWithLayout = withPrimaryLayout(TranslatorPage);
const TwinPageWithLayout = withPrimaryLayout(TwinPage);
const TwinNewPageWithLayout = withPrimaryLayout(TwinNewPage);
const WritingStudioChatPageWithLayout = withPrimaryLayout(WritingStudioChatPage);
const WritingStudioPageWithLayout = withPrimaryLayout(WritingStudioPage);
const TonightEnginePageWithLayout = withPrimaryLayout(TonightEnginePage);

const FilesPageWithLayout = withPrimaryLayout(FilesPage);
const ConnectorsPageWithLayout = withPrimaryLayout(ConnectorsPage);
const SavedReportsPageWithLayout = withPrimaryLayout(SavedReportsPage);
const DeepResearchPageWithLayout = withPrimaryLayout(DeepResearchPage);
const SettingsWorkspacePageWithLayout = withPrimaryLayout(SettingsWorkspacePage);

// Secondary layout pages wrapped
const PricingPageWithLayout = withSecondaryLayout(PricingPage);
const PricingCheckoutPageWithLayout = withSecondaryLayout(PricingCheckoutPage);
const PricingCheckoutSuccessPageWithLayout = withSecondaryLayout(PricingCheckoutSuccessPage);
const PricingCheckoutCancelPageWithLayout = withSecondaryLayout(PricingCheckoutCancelPage);
const AboutUsPageWithLayout = withSecondaryLayout(AboutUsPage);
const B2BPageWithLayout = withSecondaryLayout(B2BPage);
const B2BServicesPageWithLayout = withSecondaryLayout(B2BServicesPage);
const BlogsPageWithLayout = withSecondaryLayout(BlogsPage);
const BlogDetailPageWithLayout = withSecondaryLayout(BlogDetailPage);
const CareerPageWithLayout = withSecondaryLayout(CareerPage);
const ContactUsPageWithLayout = withSecondaryLayout(ContactUsPage);
const DeletionPageWithLayout = withSecondaryLayout(DeletionPage);
const FAQsPageWithLayout = withSecondaryLayout(FAQsPage);
const FeaturesPageWithLayout = withSecondaryLayout(FeaturesPage);
const MagnaCartaPageWithLayout = withSecondaryLayout(MagnaCartaPage);
const TeamPageWithLayout = withSecondaryLayout(TeamPage);
const TermsPageWithLayout = withSecondaryLayout(TermsPage);
const PrivacyPageWithLayout = withSecondaryLayout(PrivacyPage);
const TutorialsPageWithLayout = withSecondaryLayout(TutorialsPage);
const ResellerPanelPageWithLayout = withSecondaryLayout(ResellerPanelPage);

// Stub page for unimplemented routes
function PlaceholderPage({ name }: { name: string }) {
  return (
    <div className="flex h-screen items-center justify-center text-muted-foreground">
      <p>{name} — coming soon</p>
    </div>
  );
}

const NotFound = () => (
  <div className="flex h-screen flex-col items-center justify-center gap-4">
    <h1 className="text-4xl font-bold">404</h1>
    <p className="text-muted-foreground">Page not found</p>
    <a href="/" className="text-primary underline">Go home</a>
  </div>
);

function RootRedirect() {
  return <Redirect to="/agents/chat" replace />;
}

function AppRoutes() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    }>
      <Switch>
        {/* Layer 1: Universal Entry Canvas */}
        <Route path="/" component={AgentsChatPageWithLayout} />

        {/* Auth routes (no layout) */}
        <Route path="/auth/login" component={LoginPage} />
        <Route path="/auth/register" component={RegisterPage} />
        <Route path="/auth/forgot-password" component={ForgotPasswordPage} />
        <Route path="/auth/post-login" component={PostLoginPage} />
        <Route path="/auth/logto-callback" component={LogtoCallbackPage} />
        <Route path="/auth/verify-email" component={VerifyEmailCodePage} />
        <Route path="/auth/verify-email/:token" component={VerifyEmailTokenPage} />
        <Route path="/auth/reset-password/:token" component={ResetPasswordPage} />

        {/* Dashboard routes */}
        <Route path="/canvas">
          <Redirect to="/" replace />
        </Route>
        <Route path="/tonight-engine" component={TonightEnginePage} />

        {/* Slide layout routes */}
        <Route path="/_edit-slides">
          <Redirect to="/slides/edit" replace />
        </Route>
        <Route path="/slides/edit" component={EditSlidesPage} />
        <Route path="/slides" component={SlidesPage} />
        <Route path="/slide-share/:shareLink" component={SlideSharePage} />
        <Route path="/slide/replay" component={SlideReplayPage} />

        {/* Shared content */}
        <Route path="/shared/:contentType/:shareId" component={SharedContentPage} />

        {/* Agent demo */}
        <Route path="/agent-demo" component={AgentDemoPage} />

        {/* Voice */}
        <Route path="/voice">
          <Redirect to="/twin?tab=video" replace />
        </Route>

        {/* Secondary layout routes */}
        <Route path="/pricing" component={PricingPageWithLayout} />
        <Route path="/pricing/checkout" component={PricingCheckoutPageWithLayout} />
        <Route path="/pricing/checkout/success" component={PricingCheckoutSuccessPageWithLayout} />
        <Route path="/pricing/checkout/cancel" component={PricingCheckoutCancelPageWithLayout} />
        <Route path="/about-us" component={AboutUsPageWithLayout} />
        <Route path="/b2b" component={B2BPageWithLayout} />
        <Route path="/b2b/services" component={B2BServicesPageWithLayout} />
        <Route path="/blogs" component={BlogsPageWithLayout} />
        <Route path="/blogs/:slug" component={BlogDetailPageWithLayout} />
        <Route path="/career" component={CareerPageWithLayout} />
        <Route path="/contact-us" component={ContactUsPageWithLayout} />
        <Route path="/deletion" component={DeletionPageWithLayout} />
        <Route path="/faqs" component={FAQsPageWithLayout} />
        <Route path="/features" component={FeaturesPageWithLayout} />
        <Route path="/magna-carta" component={MagnaCartaPageWithLayout} />
        <Route path="/team" component={TeamPageWithLayout} />
        <Route path="/terms" component={TermsPageWithLayout} />
        <Route path="/privacy" component={PrivacyPageWithLayout} />
        <Route path="/tutorials" component={TutorialsPageWithLayout} />
        <Route path="/reseller-panel" component={ResellerPanelPageWithLayout} />
        <Route path="/payment/:path*">
          <Redirect to="/pricing/checkout" replace />
        </Route>

        {/* Primary layout routes — wrapped in PrimaryLayout */}
        <Route path="/agents/chat">
          {() => {
            const search = typeof window !== 'undefined' ? window.location.search : '';
            return <Redirect to={`/${search}`} replace />;
          }}
        </Route>
        <Route path="/agents/share-agent/:shareId" component={AgentSharePageWithLayout} />
        <Route path="/agents/share-ai-detector/:shareId" component={AiDetectorSharePageWithLayout} />
        <Route path="/agents/shared-sheet/:shareId" component={SharedSheetPageWithLayout} />
        <Route path="/agents/profile/:agentId" component={AgentProfilePageWithLayout} />
        <Route path="/agents/:agentType" component={AgentTypePageWithLayout} />
        <Route path="/agents" component={AgentsPageWithLayout} />
        <Route path="/paraphrase" component={ParaphrasePageWithLayout} />
        <Route path="/humanize-gpt" component={HumanizePageWithLayout} />
        <Route path="/grammar-checker" component={GrammarCheckerPageWithLayout} />
        <Route path="/ai-detector/shared/:shareLinkId" component={AiDetectorSharedPageWithLayout} />
        <Route path="/ai-detector" component={AiDetectorPageWithLayout} />
        <Route path="/plagiarism-checker" component={PlagiarismCheckerPageWithLayout} />
        <Route path="/summarize" component={SummarizePageWithLayout} />
        <Route path="/translator" component={TranslatorPageWithLayout} />
        <Route path="/books/:bookId" component={BookPageWithLayout} />
        <Route path="/books" component={BookPageWithLayout} />
        <Route path="/community/:forumId" component={CommunityForumPageWithLayout} />
        <Route path="/community" component={CommunityPageWithLayout} />
        <Route path="/explore/channels/:slug" component={ExploreChannelSlugPageWithLayout} />
        <Route path="/explore/channels" component={ExploreChannelsPageWithLayout} />
        <Route path="/explore" component={ExplorePageWithLayout} />
        <Route path="/hermes" component={HermesPageWithLayout} />
        <Route path="/marketplace" component={MarketplacePageWithLayout} />
        <Route path="/second-me" component={SecondMePageWithLayout} />
        <Route path="/slide-generation" component={SlideGenerationPageWithLayout} />
        <Route path="/animation">
          <Redirect to="/twin?tab=video" replace />
        </Route>
        
        {/* Layer 2: Twin Workspace & Sub-workspaces */}
        <Route path="/twin/new" component={TwinNewPageWithLayout} />
        <Route path="/twin/:twinId/:section" component={TwinPageWithLayout} />
        <Route path="/twin/:twinId" component={TwinPageWithLayout} />
        <Route path="/twin" component={TwinPageWithLayout} />
        <Route path="/research/:researchId" component={ResearchPageWithLayout} />
        <Route path="/research" component={ResearchPageWithLayout} />
        
        <Route path="/account/billing" component={AccountBillingPageWithLayout} />
        <Route path="/account/agents" component={AccountAgentsPageWithLayout} />
        <Route path="/account/settings" component={AccountSettingsPageWithLayout} />
        <Route path="/account/review/:bookId" component={AccountReviewPageWithLayout} />
        <Route path="/account" component={AccountPageWithLayout} />
        <Route path="/agent-studio" component={AgentStudioPageWithLayout} />
        
        {/* Layer 2/3: Writing Studio Workspace & Resources */}
        <Route path="/writing-studio/chat" component={WritingStudioChatPageWithLayout} />
        <Route path="/writing-studio/:documentId" component={WritingStudioPageWithLayout} />
        <Route path="/writing-studio" component={WritingStudioPageWithLayout} />
        
        <Route path="/files" component={FilesPageWithLayout} />
        <Route path="/connector">
          <Redirect to="/connectors" replace />
        </Route>
        <Route path="/connectors" component={ConnectorsPageWithLayout} />
        <Route path="/saved-reports" component={SavedReportsPageWithLayout} />
        <Route path="/deep-research">
          <Redirect to="/research" replace />
        </Route>
        <Route path="/settings" component={SettingsWorkspacePageWithLayout} />
        <Route path="/admin" component={AdminControlCenterWithLayout} />
        <Route path="/tonight" component={TonightEnginePageWithLayout} />
        <Route path="/swarm-monitor" component={TonightEnginePageWithLayout} />
        <Route path="/tonight-engine" component={TonightEnginePageWithLayout} />

        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ComponentErrorBoundary title="Application Error">
      <QueryClientProvider client={queryClient}>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Providers>
            <AppRoutes />
          </Providers>
        </WouterRouter>
      </QueryClientProvider>
    </ComponentErrorBoundary>
  );
}

export default App;
