import { useParams } from "@/lib/navigation";
import FeedCard from "@/components/discover/FeedCard";
import ChannelSidebar from "@/components/discover/ChannelSidebar";
import SortTabs from "@/components/discover/SortTabs";
import { useMemo, useState } from "react";
import { Users, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { SEED_CHANNELS, SEED_FORUMS, communityLocal, sortForums } from "@/lib/community-seed";

export default function ChannelDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [sortBy, setSortBy] = useState<"hot" | "new" | "top">("hot");
  const [isMember, setIsMember] = useState(() => communityLocal.isJoined(slug));

  const channel = SEED_CHANNELS.find((c) => c.slug === slug);
  const forums = useMemo(
    () => sortForums(SEED_FORUMS.filter((f) => f.channelSlug === slug), sortBy),
    [slug, sortBy]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link
        href="/explore"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Explore
      </Link>

      {channel ? (
        <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted text-3xl">
              {channel.icon}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{channel.name}</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">{channel.description}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                {channel.memberCount + (isMember ? 1 : 0)} members
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsMember(communityLocal.toggleJoin(slug))}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isMember
                ? "border border-border bg-muted text-foreground hover:bg-destructive/10 hover:text-destructive"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {isMember ? "Leave" : "Join"}
          </button>
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          Channel “{slug}” was not found. Pick one from the sidebar.
        </div>
      )}

      <div className="flex gap-8">
        <div className="hidden lg:block">
          <ChannelSidebar activeSlug={slug} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-4">
            <SortTabs active={sortBy} onChange={setSortBy} />
          </div>

          {forums.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
              <p className="text-sm text-muted-foreground">
                No publications in this channel yet. Be the first to submit.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {forums.map((forum) => (
                <FeedCard key={forum._id} forum={forum} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
