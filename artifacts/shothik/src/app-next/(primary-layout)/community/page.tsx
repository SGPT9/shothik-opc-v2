
import { Link } from "wouter";
import { MessageSquare, TrendingUp, Bot, Calendar, Compass, ChevronUp, Coins, Loader2 } from "lucide-react";
import CountdownTimer from "@/components/forum/CountdownTimer";
import ReviewerFundDashboard from "@/components/credits/ReviewerFundDashboard";
import { useTranslation } from "@/i18n";
import { useChannels, useHotPosts } from "@/hooks/useCommunity";
import ForumPost from "@/components/forum/ForumPost";

export default function CommunityPage() {
  const { t } = useTranslation();
  const { data: openForums, loading: channelsLoading } = useChannels();
  const { data: hotPosts, loading: hotPostsLoading } = useHotPosts();

  const totalPosts = openForums?.reduce((sum: number, f: any) => sum + (f.postCount ?? 0), 0) ?? 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("community.heading")}</h1>
          <p className="mt-1 text-muted-foreground">
            {t("community.subheading")}
          </p>
        </div>
        <Link
          href="/explore"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Compass className="h-4 w-4" />
          {t("community.discoverFeed")}
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t("community.openForums")}
          value={openForums?.length || 0}
          icon={channelsLoading ? <Loader2 className="h-5 w-5 animate-spin text-blue-500" /> : <MessageSquare className="h-5 w-5 text-blue-500" />}
          color="blue"
        />
        <StatCard
          label={t("community.activePosts")}
          value={totalPosts}
          icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
          color="emerald"
        />
        <StatCard
          label={t("community.droppingSoon")}
          value={0}
          icon={<Calendar className="h-5 w-5 text-amber-500" />}
          color="amber"
        />
      </div>

      <div className="mb-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          {t("community.mostActiveNow")}
        </h2>
        {hotPostsLoading ? (
           <EmptyState message="Loading hot posts..." />
        ) : hotPosts && hotPosts.length > 0 ? (
           <div className="space-y-4">
             {hotPosts.map((post: any) => (
               <ForumPost
                  key={post.id}
                  postId={post.id}
                  authorName={post.authorName || 'Anonymous'}
                  authorType={post.authorType || 'human'}
                  content={post.content}
                  reactions={post.reactions || []}
                  createdAt={new Date(post.created_at).getTime()}
                  forumId={post.channel_id}
                  currentUserId="viewer"
                  currentUserType="human"
                  onReact={() => {}}
               />
             ))}
           </div>
        ) : (
          <EmptyState message={t("community.noActiveThreads")} />
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <Coins className="h-5 w-5 fill-amber-400 text-amber-400" />
          {t("community.reviewerFund")}
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {t("community.reviewerFundDescription")}
        </p>
        <ReviewerFundDashboard />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20",
    emerald: "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20",
    amber: "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20",
  };
  return (
    <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
      <div className="mb-2">{icon}</div>
      <div className="text-2xl font-bold text-foreground">{value.toLocaleString()}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
