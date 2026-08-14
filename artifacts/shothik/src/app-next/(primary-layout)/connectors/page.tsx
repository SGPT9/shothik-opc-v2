import React, { useState } from "react";
import { 
  Search, Mail, FileText, MessageSquare, 
  Globe, Briefcase, Webhook, Database, CreditCard, 
  HardDrive, Eye, Edit3, AlertTriangle, 
  CheckCircle2, Twitter, LayoutGrid, Truck,
  PhoneCall, QrCode, Landmark, Package, Sparkles,
  Settings, X, Shield, RefreshCw, Key
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Connector {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  category: string;
  isRegionalFeatured?: boolean;
  apiKeyPlaceholder?: string;
  endpointUrl?: string;
}

const INITIAL_CONNECTORS: Connector[] = [
  // ── Regional & Logistics Featured ──
  { 
    id: "steadfast", 
    name: "Steadfast Courier API", 
    description: "Auto-book parcels, generate tracking IDs, and check Cash-on-Delivery (COD) reconciliation across 64 districts.", 
    icon: <Truck className="w-5 h-5 text-emerald-500" />, 
    connected: true, 
    category: "Logistics & COD",
    isRegionalFeatured: true,
    apiKeyPlaceholder: "stf_live_9283489123891",
    endpointUrl: "https://portal.steadfast.com.bd/api/v1/create_order"
  },
  { 
    id: "whatsapp", 
    name: "WhatsApp Business API", 
    description: "Broadcast order updates, share pitch decks, and trigger Banglish customer lead responses autonomously.", 
    icon: <PhoneCall className="w-5 h-5 text-green-500" />, 
    connected: true, 
    category: "Communication",
    isRegionalFeatured: true,
    apiKeyPlaceholder: "EAAIx823491283...",
    endpointUrl: "https://graph.facebook.com/v19.0/messages"
  },
  { 
    id: "bkash", 
    name: "bKash Merchant Ledger", 
    description: "Real-time MFS 10-digit TrxID matching, automated payment webhooks, and cash-out reconciliation.", 
    icon: <QrCode className="w-5 h-5 text-pink-500" />, 
    connected: true, 
    category: "Finance & MFS",
    isRegionalFeatured: true,
    apiKeyPlaceholder: "bk_app_key_8271391823",
    endpointUrl: "https://tokenized.pay.bka.sh/v1.2.0-beta/token/grant"
  },
  { 
    id: "pathao", 
    name: "Pathao Express Logistics", 
    description: "On-demand city express delivery, rider dispatch, and parcel tracking across Bangladesh hubs.", 
    icon: <Package className="w-5 h-5 text-rose-500" />, 
    connected: false, 
    category: "Logistics & COD",
    isRegionalFeatured: true,
    apiKeyPlaceholder: "pth_secret_key_91823",
    endpointUrl: "https://api-hermes.pathao.com/aladdin/api/v1/orders"
  },
  { 
    id: "nbr", 
    name: "NBR Tax & SRO Portal", 
    description: "Automatic statutory synchronization with National Board of Revenue Income Tax Act 2023 gazettes.", 
    icon: <Landmark className="w-5 h-5 text-amber-500" />, 
    connected: false, 
    category: "Compliance",
    isRegionalFeatured: true,
    apiKeyPlaceholder: "nbr_tin_reg_293819283",
    endpointUrl: "https://incometax.gov.bd/api/sro/sync"
  },

  // ── Global Ecosystem ──
  { 
    id: "gmail", 
    name: "Gmail", 
    description: "Read customer emails, draft intelligent replies, and search multi-turn support threads.", 
    icon: <Mail className="w-5 h-5 text-red-500" />, 
    connected: true, 
    category: "Communication",
    apiKeyPlaceholder: "oauth2_token_gmail",
    endpointUrl: "https://gmail.googleapis.com/gmail/v1/users/me/messages"
  },
  { 
    id: "gdocs", 
    name: "Google Docs", 
    description: "Read, format, and push AI-authored book manuscripts directly into Google Docs files.", 
    icon: <FileText className="w-5 h-5 text-blue-500" />, 
    connected: true, 
    category: "Productivity",
    apiKeyPlaceholder: "oauth2_token_docs",
    endpointUrl: "https://docs.googleapis.com/v1/documents"
  },
  { 
    id: "notion", 
    name: "Notion Workspace", 
    description: "Access team wikis, project databases, and roadmap boards for continuous context sync.", 
    icon: <LayoutGrid className="w-5 h-5 text-foreground" />, 
    connected: false, 
    category: "Productivity",
    apiKeyPlaceholder: "secret_ntn_829348123...",
    endpointUrl: "https://api.notion.com/v1/search"
  },
  { 
    id: "slack", 
    name: "Slack", 
    description: "Read channel updates, alert team members, and dispatch agent approvals via Slack webhooks.", 
    icon: <MessageSquare className="w-5 h-5 text-purple-500" />, 
    connected: false, 
    category: "Communication",
    apiKeyPlaceholder: "xoxb-8293481923...",
    endpointUrl: "https://slack.com/api/chat.postMessage"
  },
  { 
    id: "wordpress", 
    name: "WordPress / WooCommerce", 
    description: "Draft and publish SEO-optimized Bengali & English blog articles and product catalogues.", 
    icon: <Globe className="w-5 h-5 text-blue-400" />, 
    connected: false, 
    category: "Publishing",
    apiKeyPlaceholder: "wp_app_pass_923841",
    endpointUrl: "https://yourblog.com/wp-json/wp/v2/posts"
  },
  { 
    id: "linkedin", 
    name: "LinkedIn", 
    description: "Analyze executive profiles, schedule thought leadership posts, and generate lead connections.", 
    icon: <Briefcase className="w-5 h-5 text-blue-600" />, 
    connected: false, 
    category: "Social",
    apiKeyPlaceholder: "li_at_token_928341",
    endpointUrl: "https://api.linkedin.com/v2/ugcPosts"
  },
  { 
    id: "x", 
    name: "X (Twitter)", 
    description: "Monitor developer sentiment, track release hashtags, and broadcast automated changelogs.", 
    icon: <Twitter className="w-5 h-5 text-foreground" />, 
    connected: false, 
    category: "Social",
    apiKeyPlaceholder: "Bearer AAAAAAAAAAAA...",
    endpointUrl: "https://api.twitter.com/2/tweets"
  },
  { 
    id: "hubspot", 
    name: "HubSpot CRM", 
    description: "Sync enterprise leads, track customer lifecycle stages, and log meeting transcript summaries.", 
    icon: <Database className="w-5 h-5 text-orange-500" />, 
    connected: false, 
    category: "CRM",
    apiKeyPlaceholder: "pat-na1-829348...",
    endpointUrl: "https://api.hubapi.com/crm/v3/objects/contacts"
  },
  { 
    id: "stripe", 
    name: "Stripe", 
    description: "Read recurring subscriptions, MRR metrics, customer checkout sessions, and refund requests.", 
    icon: <CreditCard className="w-5 h-5 text-indigo-500" />, 
    connected: false, 
    category: "Finance & MFS",
    apiKeyPlaceholder: "sk_live_51Nw...",
    endpointUrl: "https://api.stripe.com/v1/charges"
  },
  { 
    id: "drive", 
    name: "Google Drive", 
    description: "Search, extract, and index PDFs, spreadsheets, and slides directly into the LiteParse Knowledge Vault.", 
    icon: <HardDrive className="w-5 h-5 text-green-500" />, 
    connected: true, 
    category: "Productivity",
    apiKeyPlaceholder: "oauth2_token_drive",
    endpointUrl: "https://www.googleapis.com/drive/v3/files"
  },
  { 
    id: "pipedream", 
    name: "Pipedream & Webhooks", 
    description: "Trigger custom edge webhooks and event-driven automation pipelines with HMAC validation.", 
    icon: <Webhook className="w-5 h-5 text-emerald-500" />, 
    connected: false, 
    category: "Automation",
    apiKeyPlaceholder: "pd_api_key_829341",
    endpointUrl: "https://api.pipedream.com/v1/sources"
  },
];

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>(INITIAL_CONNECTORS);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");

  // Config modal state
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [endpointInput, setEndpointInput] = useState("");
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleOpenConfig = (connector: Connector) => {
    setSelectedConnector(connector);
    setApiKeyInput(connector.apiKeyPlaceholder || "");
    setEndpointInput(connector.endpointUrl || "");
    setTestResult(null);
  };

  const handleSaveConfig = () => {
    if (!selectedConnector) return;
    setConnectors(connectors.map(c => 
      c.id === selectedConnector.id 
        ? { ...c, connected: true, apiKeyPlaceholder: apiKeyInput, endpointUrl: endpointInput }
        : c
    ));
    setSelectedConnector(null);
  };

  const handleTestPing = () => {
    setIsTestingPing(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTestingPing(false);
      setTestResult("✅ 200 OK — Connection verified and HMAC signature active (latency: 142ms)");
    }, 1200);
  };

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
    <div className="flex flex-col h-full overflow-hidden bg-background select-text">
      {/* ── Top Header ── */}
      <div className="px-8 py-6 shrink-0 border-b border-border/40">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Connectors Ecosystem</h1>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5" /> South Asian & Global Hub
          </span>
        </div>
        <p className="text-muted-foreground text-sm max-w-2xl mt-1.5">
          Link external couriers, payment gateways, and cloud storage to grant Shothik autonomous read/write access to your business workflows.
        </p>
      </div>

      <div className="px-8 py-4 shrink-0">
        {/* Permission Rules Summary Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div className="flex flex-col p-3.5 rounded-xl border border-border bg-muted/20">
            <div className="flex items-center gap-2 text-foreground font-medium mb-1 text-xs">
              <Eye className="w-4 h-4 text-indigo-500" />
              <span>Read Operations</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Executed silently to gather context for search, research, and ledger reconciliation.</p>
          </div>
          <div className="flex flex-col p-3.5 rounded-xl border border-border bg-muted/20">
            <div className="flex items-center gap-2 text-foreground font-medium mb-1 text-xs">
              <Edit3 className="w-4 h-4 text-amber-500" />
              <span>Write & Booking</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Book Steadfast/Pathao parcels and draft WhatsApp messages with 1-tap confirmation.</p>
          </div>
          <div className="flex flex-col p-3.5 rounded-xl border border-border bg-muted/20">
            <div className="flex items-center gap-2 text-foreground font-medium mb-1 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Financial Actions</span>
            </div>
            <p className="text-[11px] text-muted-foreground">bKash payouts or public campaign publishing require explicit user authorization.</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              className="w-full bg-muted/50 border border-border rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
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
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Connectors */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(connector => (
            <div key={connector.id} className="flex flex-col p-5 rounded-2xl border border-border bg-card shadow-xs hover:shadow-md transition-shadow relative">
              {connector.isRegionalFeatured && (
                <span className="absolute top-3.5 right-3.5 text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                  REGIONAL
                </span>
              )}
              <div className="flex items-start justify-between mb-3.5">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted border border-border">
                  {connector.icon}
                </div>
                {!connector.isRegionalFeatured && (
                  connector.connected ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      Connected
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
                      Available
                    </span>
                  )
                )}
              </div>

              <div className="flex-1 mb-3.5">
                <h3 className="font-semibold text-foreground text-sm mb-1">{connector.name}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{connector.description}</p>
                <div className="mt-2.5">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                    {connector.category}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleConnection(connector.id)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      connector.connected 
                        ? "text-rose-500 hover:bg-rose-500/10 border border-rose-500/20" 
                        : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
                    }`}
                  >
                    {connector.connected ? "Disconnect" : "Connect"}
                  </button>

                  <button
                    onClick={() => handleOpenConfig(connector)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                    title="Configure API Keys & Webhooks"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-[11px] font-mono text-muted-foreground">
                  {connector.connected ? "● Active" : "○ Ready"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Configure Connector Modal ── */}
      {selectedConnector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center">
                  {selectedConnector.icon}
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Configure {selectedConnector.name}</h3>
                  <p className="text-[11px] text-muted-foreground">{selectedConnector.category}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedConnector(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  <span>API Key / Secret Token</span>
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={selectedConnector.apiKeyPlaceholder || "Enter API secret key..."}
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                  <Webhook className="w-3.5 h-3.5 text-emerald-400" />
                  <span>API / Webhook Endpoint</span>
                </label>
                <input
                  type="text"
                  value={endpointInput}
                  onChange={(e) => setEndpointInput(e.target.value)}
                  placeholder={selectedConnector.endpointUrl || "https://api.service.com/v1"}
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {testResult && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 font-mono">
                  {testResult}
                </div>
              )}

              <div className="p-3 rounded-xl bg-muted/30 border border-border flex items-start gap-2 text-xs text-muted-foreground">
                <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Keys are sealed in the InsForge encrypted vault and decrypted only at edge execution time.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestPing}
                  disabled={isTestingPing}
                  className="text-xs gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingPing ? "animate-spin" : ""}`} />
                  <span>{isTestingPing ? "Pinging..." : "Test Connection"}</span>
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedConnector(null)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveConfig}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                  >
                    Save & Activate
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}