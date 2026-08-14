import { useState } from "react";
import { 
  Search, Mail, FileText, MessageSquare, 
  Globe, Briefcase, Webhook, Database, CreditCard, 
  HardDrive, Eye, Edit3, AlertTriangle, 
  CheckCircle2, Twitter, LayoutGrid, Truck,
  PhoneCall, QrCode, Landmark, Package, Sparkles
} from "lucide-react";

interface Connector {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  category: string;
  isRegionalFeatured?: boolean;
}

const INITIAL_CONNECTORS: Connector[] = [
  // ── Regional & Logistics Featured ──
  { 
    id: "steadfast", 
    name: "Steadfast Courier API", 
    description: "Auto-book parcels, generate tracking IDs, and check Cash-on-Delivery (COD) reconciliation.", 
    icon: <Truck className="w-5 h-5 text-emerald-500" />, 
    connected: true, 
    category: "Logistics & COD",
    isRegionalFeatured: true 
  },
  { 
    id: "whatsapp", 
    name: "WhatsApp Business API", 
    description: "Broadcast order updates, share pitch decks, and trigger Banglish customer lead responses.", 
    icon: <PhoneCall className="w-5 h-5 text-green-500" />, 
    connected: true, 
    category: "Communication",
    isRegionalFeatured: true 
  },
  { 
    id: "bkash", 
    name: "bKash Merchant Ledger", 
    description: "Real-time MFS 10-digit TrxID matching, automated payment webhooks, and cash-out reconciliation.", 
    icon: <QrCode className="w-5 h-5 text-pink-500" />, 
    connected: true, 
    category: "Finance & MFS",
    isRegionalFeatured: true 
  },
  { 
    id: "pathao", 
    name: "Pathao Express Logistics", 
    description: "On-demand city express delivery, rider dispatch, and parcel tracking across Bangladesh hubs.", 
    icon: <Package className="w-5 h-5 text-rose-500" />, 
    connected: false, 
    category: "Logistics & COD",
    isRegionalFeatured: true 
  },
  { 
    id: "nbr", 
    name: "NBR Tax & SRO Portal", 
    description: "Automatic statutory synchronization with National Board of Revenue Income Tax Act 2023 gazettes.", 
    icon: <Landmark className="w-5 h-5 text-amber-500" />, 
    connected: false, 
    category: "Compliance",
    isRegionalFeatured: true 
  },

  // ── Global Ecosystem ──
  { id: "gmail", name: "Gmail", description: "Read emails, draft replies, and search threads.", icon: <Mail className="w-5 h-5 text-red-500" />, connected: true, category: "Communication" },
  { id: "gdocs", name: "Google Docs", description: "Read and write to Google Docs.", icon: <FileText className="w-5 h-5 text-blue-500" />, connected: true, category: "Productivity" },
  { id: "notion", name: "Notion", description: "Access pages, databases, and workspace search.", icon: <LayoutGrid className="w-5 h-5 text-foreground" />, connected: false, category: "Productivity" },
  { id: "slack", name: "Slack", description: "Read channel history and send messages.", icon: <MessageSquare className="w-5 h-5 text-purple-500" />, connected: false, category: "Communication" },
  { id: "wordpress", name: "WordPress", description: "Draft and publish blog posts.", icon: <Globe className="w-5 h-5 text-blue-400" />, connected: false, category: "Publishing" },
  { id: "linkedin", name: "LinkedIn", description: "Analyze profiles and draft posts.", icon: <Briefcase className="w-5 h-5 text-blue-600" />, connected: false, category: "Social" },
  { id: "x", name: "X (Twitter)", description: "Read timeline and draft tweets.", icon: <Twitter className="w-5 h-5 text-foreground" />, connected: false, category: "Social" },
  { id: "hubspot", name: "HubSpot", description: "Sync contacts and CRM data.", icon: <Database className="w-5 h-5 text-orange-500" />, connected: false, category: "CRM" },
  { id: "stripe", name: "Stripe", description: "Read read-only financial metrics.", icon: <CreditCard className="w-5 h-5 text-indigo-500" />, connected: false, category: "Finance & MFS" },
  { id: "drive", name: "Google Drive", description: "Search and index workspace files.", icon: <HardDrive className="w-5 h-5 text-green-500" />, connected: true, category: "Productivity" },
  { id: "pipedream", name: "Pipedream", description: "Trigger custom webhooks and workflows.", icon: <Webhook className="w-5 h-5 text-emerald-500" />, connected: false, category: "Automation" },
];

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>(INITIAL_CONNECTORS);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");

  const toggleConnection = (id: string) => {
    setConnectors(connectors.map(c => c.id === id ? { ...c, connected: !c.connected } : c));
  };

  const filtered = connectors.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    if (activeCategory === "ALL") return true;
    if (activeCategory === "REGIONAL") return c.isRegionalFeatured;
    return c.category === activeCategory;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <div className="px-8 py-8 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Connectors Ecosystem</h1>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-brand/10 text-brand border border-brand/20 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> South Asian & Global Hub
          </span>
        </div>
        <p className="text-muted-foreground text-sm max-w-2xl mt-2">
          Link external data sources, couriers, and payment ledgers to grant Shothik autonomous access to your workflow.
        </p>
      </div>

      <div className="px-8 pb-4 shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col p-4 rounded-xl border border-border bg-muted/20">
            <div className="flex items-center gap-2 text-foreground font-medium mb-1">
              <Eye className="w-4 h-4 text-brand" />
              <span>Read Operations</span>
            </div>
            <p className="text-xs text-muted-foreground">Executed silently to gather context for search, research, and ledger reconciliation.</p>
          </div>
          <div className="flex flex-col p-4 rounded-xl border border-border bg-muted/20">
            <div className="flex items-center gap-2 text-foreground font-medium mb-1">
              <Edit3 className="w-4 h-4 text-amber-500" />
              <span>Write & Booking</span>
            </div>
            <p className="text-xs text-muted-foreground">Book Steadfast/Pathao parcels and draft WhatsApp messages with 1-tap confirmation.</p>
          </div>
          <div className="flex flex-col p-4 rounded-xl border border-border bg-muted/20">
            <div className="flex items-center gap-2 text-foreground font-medium mb-1">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Financial Actions</span>
            </div>
            <p className="text-xs text-muted-foreground">bKash payouts or public campaign publishing require explicit user authorization.</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              className="w-full bg-muted/50 border border-border rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
              placeholder="Search connectors, couriers, MFS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            {[
              { id: "ALL", label: "All Connectors" },
              { id: "REGIONAL", label: "🇧🇩 Featured South Asia" },
              { id: "Logistics & COD", label: "📦 Logistics & COD" },
              { id: "Finance & MFS", label: "💳 Finance & MFS" },
              { id: "Communication", label: "💬 Communication" },
              { id: "Productivity", label: "⚡ Productivity" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
                  activeCategory === tab.id
                    ? "bg-brand text-white shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(connector => (
            <div key={connector.id} className="flex flex-col p-5 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow relative">
              {connector.isRegionalFeatured && (
                <span className="absolute top-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                  REGIONAL
                </span>
              )}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted border border-border">
                  {connector.icon}
                </div>
                {!connector.isRegionalFeatured && (
                  connector.connected ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-brand bg-brand/10 px-2 py-1 rounded-full border border-brand/20">
                      <CheckCircle2 className="w-3 h-3" />
                      Connected
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full border border-border">
                      Available
                    </span>
                  )
                )}
              </div>

              <div className="flex-1 mb-4">
                <h3 className="font-semibold text-foreground text-sm mb-1">{connector.name}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{connector.description}</p>
                <div className="mt-2.5">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                    {connector.category}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <button 
                  onClick={() => toggleConnection(connector.id)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    connector.connected 
                      ? "text-red-500 hover:bg-red-500/10 border border-red-500/20" 
                      : "bg-brand text-white hover:bg-brand/90 shadow-xs"
                  }`}
                >
                  {connector.connected ? "Disconnect" : "Connect"}
                </button>
                <span className="text-[11px] text-muted-foreground">
                  {connector.connected ? "Active" : "Ready"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}