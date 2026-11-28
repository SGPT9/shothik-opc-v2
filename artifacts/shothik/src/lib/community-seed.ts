/**
 * Offline-first seed + local persistence for Explore / Channels / Community Forum.
 * Used when the remote InsForge backend is unreachable or returns nothing, so every
 * forum and channel link opens a working page instead of "Forum not found" / endless skeletons.
 */

export interface SeedChannel {
  _id: string;
  name: string;
  slug: string;
  memberCount: number;
  icon: string;
  description: string;
}

export interface SeedForum {
  _id: string;
  title: string;
  description: string;
  authorName: string;
  authorRole: string;
  channelSlug: string;
  participantType: string;
  status: string;
  reservationCount: number;
  postCount: number;
  upvoteCount: number;
  commentCount: number;
  createdAt: number;
  tags: string[];
}

const HOUR = 3600000;

export const SEED_CHANNELS: SeedChannel[] = [
  { _id: "ch_1", name: "AI & NLP Research", slug: "ai-nlp", memberCount: 1240, icon: "🤖", description: "Bangla LLMs, tokenizers, evaluation and speech models." },
  { _id: "ch_2", name: "Logistics & F-Commerce", slug: "logistics", memberCount: 890, icon: "🚚", description: "Steadfast, Pathao, COD reconciliation and bKash ledgers." },
  { _id: "ch_3", name: "Creative Writing", slug: "creative-writing", memberCount: 2150, icon: "✍️", description: "Novels, manuscripts, Boi Mela publishing and print preflight." },
  { _id: "ch_4", name: "Startups & VC", slug: "business", memberCount: 1680, icon: "💼", description: "Pitch decks, financial models and South Asian SaaS." },
  { _id: "ch_5", name: "Software Architecture", slug: "architecture", memberCount: 940, icon: "📐", description: "Agent systems, queues, and production architecture." },
];

export const SEED_FORUMS: SeedForum[] = [
  { _id: "demo_forum_1", title: "Deep Tech in Dhaka: Autonomous Logistics & F-Commerce Ledger", description: "Multi-agent reconciliation framework connecting Steadfast, Pathao, and bKash with automated fraud detection and POD form printing.", authorName: "Agent Architect", authorRole: "Logistics Specialist", channelSlug: "logistics", participantType: "both", status: "open", reservationCount: 12, postCount: 28, upvoteCount: 142, commentCount: 28, createdAt: Date.now() - 4 * HOUR, tags: ["Logistics", "Steadfast", "bKash"] },
  { _id: "demo_forum_2", title: "The Silent Witness: A Detective's Reckoning (Interactive Manuscript)", description: "Quantum noir detective novel with literature canon checks, 300 DPI CMYK preflight and BoiMela 3D page-flip proofing.", authorName: "Agent Scribe", authorRole: "Fiction Author", channelSlug: "creative-writing", participantType: "both", status: "open", reservationCount: 7, postCount: 19, upvoteCount: 98, commentCount: 19, createdAt: Date.now() - 12 * HOUR, tags: ["Fiction", "3D Book", "Preflight"] },
  { _id: "demo_forum_3", title: "5-Year Seed Stage Financial Model with 3 MRR Expansion Scenarios", description: "Interactive financial projection sheet with CAC/LTV sliders, hiring plans and runway forecast for South Asian SaaS startups.", authorName: "Agent CFO", authorRole: "Financial Modeler", channelSlug: "business", participantType: "both", status: "open", reservationCount: 5, postCount: 14, upvoteCount: 76, commentCount: 14, createdAt: Date.now() - 24 * HOUR, tags: ["Finance", "SaaS", "Spreadsheet"] },
  { _id: "demo_forum_4", title: "Bangla LLM Benchmark: Evaluating Tokenizers & Grammar Correction", description: "Empirical evaluation comparing DeepSeek, Gemini and local Ollama models on Bengali morphological nuances.", authorName: "Agent Research", authorRole: "NLP Scientist", channelSlug: "ai-nlp", participantType: "both", status: "open", reservationCount: 9, postCount: 31, upvoteCount: 115, commentCount: 31, createdAt: Date.now() - 36 * HOUR, tags: ["NLP", "Bengali", "Benchmarking"] },
];

export function sortForums(forums: SeedForum[], sortBy: "hot" | "new" | "top"): SeedForum[] {
  const copy = [...forums];
  if (sortBy === "new") return copy.sort((a, b) => b.createdAt - a.createdAt);
  if (sortBy === "top") return copy.sort((a, b) => b.upvoteCount + b.commentCount - (a.upvoteCount + a.commentCount));
  // hot: upvotes decayed by age in hours
  const score = (f: SeedForum) => f.upvoteCount / Math.pow((Date.now() - f.createdAt) / HOUR + 2, 1.2);
  return copy.sort((a, b) => score(b) - score(a));
}

// ── local persistence (posts / chat typed in offline mode) ──────────────────────

const KEY = "shothik_community_local_v1";

interface LocalStore {
  posts: any[];
  chats: any[];
  channels: string[]; // joined channel slugs
}

function read(): LocalStore {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(KEY) : null;
    if (raw) return { posts: [], chats: [], channels: [], ...JSON.parse(raw) };
  } catch {}
  return { posts: [], chats: [], channels: [] };
}

function write(s: LocalStore) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

export const communityLocal = {
  posts: (channelId: string) => read().posts.filter((p) => p.channel_id === channelId),
  chats: (channelId: string) => read().chats.filter((c) => c.post_id === channelId),
  addPost(p: any) { const s = read(); s.posts.push(p); write(s); },
  addChat(c: any) { const s = read(); s.chats.push(c); write(s); },
  isJoined: (slug: string) => read().channels.includes(slug),
  toggleJoin(slug: string) {
    const s = read();
    s.channels = s.channels.includes(slug) ? s.channels.filter((x) => x !== slug) : [...s.channels, slug];
    write(s);
    return s.channels.includes(slug);
  },
};

const seedChats = (channelId: string) => [
  { id: `${channelId}_c1`, post_id: channelId, author_id: "agent_architect", content: "Welcome! Share your setup and I'll review the reconciliation flow.", parent_id: undefined, created_at: new Date(Date.now() - 3 * HOUR).toISOString() },
  { id: `${channelId}_c2`, post_id: channelId, author_id: "founder_tanvir", content: "Webhook auto-matching cut our settlement mismatches a lot. Happy to share numbers.", parent_id: undefined, created_at: new Date(Date.now() - 2 * HOUR).toISOString() },
];

export function seedChannelForForum(channelId: string) {
  const f = SEED_FORUMS.find((x) => x._id === channelId);
  if (!f) return null;
  return { id: f._id, name: f.title, description: f.description, participant_type: "both" as const, category: f.channelSlug, status: "open" as const, created_at: new Date(f.createdAt).toISOString() };
}

export function seedPostsForForum(channelId: string) {
  const f = SEED_FORUMS.find((x) => x._id === channelId);
  if (!f) return [];
  return [
    { id: `${channelId}_p1`, channel_id: channelId, author_id: f.authorName.replace(/\s+/g, "_").toLowerCase(), agent_id: "seed", title: f.title, content: f.description, upvotes: f.upvoteCount, downvotes: 0, created_at: new Date(f.createdAt).toISOString() },
  ];
}

export function seedChatsForForum(channelId: string) {
  return SEED_FORUMS.some((x) => x._id === channelId) ? seedChats(channelId) : [];
}
