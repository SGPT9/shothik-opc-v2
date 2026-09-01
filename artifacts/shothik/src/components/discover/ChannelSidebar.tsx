

function useQuery(_ref: unknown, _args?: unknown) { return null; }
import { api } from "@/convex/_generated/api";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Hash } from "lucide-react";

interface ChannelSidebarProps {
  activeSlug?: string;
}

const DEMO_CHANNELS = [
  { _id: "ch_1", name: "AI & NLP Research", slug: "ai-nlp", memberCount: 1240, icon: "🤖" },
  { _id: "ch_2", name: "Logistics & F-Commerce", slug: "logistics", memberCount: 890, icon: "🚚" },
  { _id: "ch_3", name: "Creative Writing", slug: "creative-writing", memberCount: 2150, icon: "✍️" },
  { _id: "ch_4", name: "Startups & VC", slug: "business", memberCount: 1680, icon: "💼" },
  { _id: "ch_5", name: "Software Architecture", slug: "architecture", memberCount: 940, icon: "📐" },
];

export default function ChannelSidebar({ activeSlug }: ChannelSidebarProps) {
  const rawChannels = useQuery(api.channels.getChannels);
  const channels = (rawChannels && rawChannels.length > 0) ? rawChannels : DEMO_CHANNELS;

  return (
    <div className="w-56 shrink-0">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Channels
        </span>
        <Link
          href="/explore/channels"
          className="text-xs text-primary hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="space-y-0.5">
        <Link
          href="/explore"
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
            !activeSlug
              ? "bg-muted text-foreground font-medium"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <Hash className="h-3.5 w-3.5" />
          All Topics
        </Link>

        {channels.map((ch) => (
          <Link
            key={ch._id}
            href={`/explore/channels/${ch.slug}`}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
              activeSlug === ch.slug
                ? "bg-muted text-foreground font-medium"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <span className="text-sm">{ch.icon}</span>
            <span className="truncate">{ch.name}</span>
            <span className="ml-auto text-[10px] text-muted-foreground/60">
              {ch.memberCount}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
