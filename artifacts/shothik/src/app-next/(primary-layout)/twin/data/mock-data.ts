import type {
  TwinTaskMock,
  TwinDocMock,
  FeedEntry,
  CompanyProject,
  TwitterChannelConfig,
  EmailOutreachConfig,
  MetaAdsConfig,
  WebsiteDomainConfig,
} from "../types";

export const MOCK_COMPANIES: CompanyProject[] = [
  {
    id: "comp-1",
    name: "yourbusiness.com",
    slug: "yourbusiness",
    plan: "Personal Plan",
    creditsBalance: 500,
    companySlotsUsed: 1,
    maxCompanySlots: 1,
  },
  {
    id: "comp-2",
    name: "VerifiQ AI",
    slug: "verifiq",
    plan: "Pro Plan",
    creditsBalance: 1200,
    companySlotsUsed: 2,
    maxCompanySlots: 3,
  },
];

export const MOCK_AGENT_STATUS = {
  state: "in_progress" as const,
  headline: "Analyzing market size — TAM/SAM/SOM…",
  liveThought: "LIVE Running web search for YC application guidelines…",
  updated: "Just now",
};

export const MOCK_METRICS = {
  visitors: 12,
  revenue: 0.0,
  updatedText: "This week",
  tasksDone: 3,
  reports: 2,
  docs: 4,
  paymentsConnected: false,
};

export const MOCK_TEAM_MEMBERS = [
  { id: "m1", name: "Nadia Rahman", role: "Co-founder", initials: "NR" },
  { id: "m2", name: "Sam Osei", role: "Advisor", initials: "SO" },
];

export const MOCK_TASKS: TwinTaskMock[] = [
  {
    id: "t-1",
    title: "Analyzing market size — TAM/SAM/SOM",
    description: "Scanning global TAM, SAM, and SOM figures for investor pitch deck.",
    category: "Strategy",
    typeTag: "RESEARCH",
    urgencyTag: "TONIGHT",
    cost: "1 credit",
    status: "in_progress",
    createdAt: "10m ago",
  },
  {
    id: "t-2",
    title: "Writing investor pitch narrative",
    description: "Crafting 10-slide YC pitch deck narrative and market traction storyline.",
    category: "Product",
    typeTag: "FEATURE",
    urgencyTag: "TONIGHT",
    cost: "1 credit",
    status: "in_progress",
    createdAt: "25m ago",
  },
  {
    id: "t-3",
    title: "Configure Stripe payments webhook",
    description: "Wiring webhook handler for subscription renewals.",
    category: "DevOps",
    typeTag: "FIX",
    cost: "1 credit",
    status: "todo",
    createdAt: "1h ago",
  },
  {
    id: "t-4",
    title: "Competitor Pricing Breakdown",
    description: "Benchmarking top 5 competitor pricing tiers.",
    category: "Strategy",
    typeTag: "RESEARCH",
    cost: "1 credit",
    status: "completed",
    createdAt: "Yesterday",
  },
  {
    id: "t-5",
    title: "Subdomain SSL Setup",
    description: "Provisioning Let's Encrypt SSL certificate via Dokploy/Coolify.",
    category: "DevOps",
    typeTag: "FEATURE",
    cost: "1 credit",
    status: "completed",
    createdAt: "Yesterday",
  },
  {
    id: "t-6",
    title: "Initial Draft Chapter 1",
    description: "Book writing pass for Chapter 1.",
    category: "Content",
    typeTag: "FEATURE",
    cost: "1 credit",
    status: "completed",
    createdAt: "2 days ago",
  },
];

export const MOCK_DOCS: TwinDocMock[] = [
  {
    id: "doc-1",
    title: "Competitor Pricing Analysis",
    kind: "Research Report",
    updated: "2h ago",
    versions: [
      { id: "v1", message: "Initial competitor breakdown", time: "2h ago", current: true },
    ],
  },
  {
    id: "doc-2",
    title: "GTM Strategy Q3",
    kind: "Strategy",
    updated: "5h ago",
    versions: [
      { id: "v1", message: "Drafted Q3 go-to-market plan", time: "5h ago", current: true },
    ],
  },
  {
    id: "doc-3",
    title: "Investor Pitch Deck",
    kind: "Presentation",
    updated: "Yesterday",
    versions: [
      { id: "v1", message: "10-slide deck outline", time: "Yesterday", current: true },
    ],
  },
  {
    id: "doc-4",
    title: "18-Month Financial Model",
    kind: "Financial Model",
    updated: "Yesterday",
    versions: [
      { id: "v1", message: "Base case revenue model", time: "Yesterday", current: true },
    ],
  },
];

export const MOCK_TWITTER_CHANNEL: TwitterChannelConfig = {
  connected: true,
  handle: "@yourbusiness",
  autoTweet: true,
  lastTweetTime: "3h ago",
};

export const MOCK_EMAIL_CHANNEL: EmailOutreachConfig = {
  connected: true,
  emailAddress: "outreach@yourbusiness.com",
  autoOutreach: true,
  frequency: "Weekdays",
  sendsPerMonth: 500,
};

export const MOCK_META_ADS: MetaAdsConfig = {
  active: true,
  dailyBudget: 50,
  adSpendPercent: 85,
  platformFeePercent: 15,
};

export const MOCK_WEBSITE_DOMAIN: WebsiteDomainConfig = {
  subdomain: "yourbusiness.shothikgpt.com",
  customDomain: "yourbusiness.com",
  status: "Live",
  sslActive: true,
  deploymentHistory: [
    { id: "dep-1", commitMsg: "Feat: Updated pricing table and YC pitch landing section", timestamp: "10m ago", provider: "coolify" },
    { id: "dep-2", commitMsg: "Fix: Dokploy SSL certificate validation", timestamp: "Yesterday", provider: "dokploy" },
  ],
};

export const MOCK_FEED: FeedEntry[] = [
  {
    id: "f-1",
    author: "Twin",
    time: "10:55 AM",
    dateGroup: "TODAY",
    isNew: true,
    thoughtDuration: 4,
    text: "LIVE Running web search for YC application guidelines… Analyzing market size — TAM/SAM/SOM for your business deck.",
  },
  {
    id: "f-2",
    author: "Twin",
    time: "9:30 AM",
    thoughtDuration: 6,
    text: "Finished generating the 18-Month Financial Model. I've placed the full breakdown in your Documents tab.",
  },
  {
    id: "f-3",
    author: "You",
    time: "YESTERDAY",
    dateGroup: "YESTERDAY",
    text: "Focus on competitor pricing analysis first, then draft our GTM strategy for Q3.",
  },
  {
    id: "f-4",
    author: "Twin",
    time: "YESTERDAY",
    thoughtDuration: 3,
    text: "Competitor Pricing Analysis is done and saved. Moving to GTM Strategy Q3 now.",
  },
];

export const CREDIT_ESTIMATES: Record<string, string> = {
  Product: "10 credits",
  Growth: "15 credits",
  Operations: "5 credits",
  Finance: "10 credits",
  Strategy: "15 credits",
  DevOps: "10 credits",
  Content: "10 credits",
};
