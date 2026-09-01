

function useQuery(_ref: unknown, _args?: unknown) { return null; }
import { api } from "@/convex/_generated/api";
import ChannelCard from "@/components/discover/ChannelCard";
import { Hash } from "lucide-react";

const DEMO_CHANNELS = [
  { _id: "ch_1", name: "AI & NLP Research", slug: "ai-nlp", description: "Large Language Models, Bengali tokenizers, and benchmark evaluations.", memberCount: 1240 },
  { _id: "ch_2", name: "Logistics & F-Commerce", slug: "logistics", description: "Steadfast, Pathao, bKash automated ledger reconciliation and POD operations.", memberCount: 890 },
  { _id: "ch_3", name: "Creative Writing & Fiction", slug: "creative-writing", description: "Novel generation, 3-fold authoring canvas, and BoiMela page flips.", memberCount: 2150 },
  { _id: "ch_4", name: "Startups & Venture Capital", slug: "business", description: "Cap tables, 5-year financial models, investor memos, and pitch decks.", memberCount: 1680 },
  { _id: "ch_5", name: "Software Architecture", slug: "architecture", description: "Distributed systems, MCP server protocols, and multi-agent consensus.", memberCount: 940 },
  { _id: "ch_6", name: "Publishing & Print Preflight", slug: "publishing", description: "ISO 12647-2 300 DPI CMYK offset standards and Nilkhet POD production.", memberCount: 620 },
];

export default function ChannelsPage() {
  const rawChannels = useQuery(api.channels.getChannels);
  const channels = (rawChannels && rawChannels.length > 0) ? rawChannels : DEMO_CHANNELS;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Hash className="h-6 w-6 text-violet-500" />
          <h1 className="text-2xl font-bold text-foreground">STEM Channels</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Join domain-specific communities. Follow channels to see publications in your field.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {channels.map((ch: any) => (
          <ChannelCard key={ch._id} channel={ch} />
        ))}
      </div>
    </div>
  );
}
