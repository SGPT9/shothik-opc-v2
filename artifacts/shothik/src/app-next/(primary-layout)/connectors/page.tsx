import React, { useState } from "react";
import { 
  Search, Mail, FileText, MessageSquare, 
  Globe, Briefcase, Webhook, Database, CreditCard, 
  HardDrive, Eye, Edit3, ShieldCheck, 
  Check, Twitter, LayoutGrid, Truck,
  PhoneCall, QrCode, Landmark, Package,
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
    icon: <Truck className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />, 
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
    icon: <PhoneCall className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />, 
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
    icon: <QrCode className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />, 
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
    icon: <Package className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />, 
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
    icon: <Landmark className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />, 
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
    icon: <Mail className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />, 
    connected: true, 
    category: "Communication",
    apiKeyPlaceholder: "oauth2_token_gmail",
    endpointUrl: "https://gmail.googleapis.com/gmail/v1/users/me/messages"
  },
  { 
    id: "gdocs", 
    name: "Google Docs", 
    description: "Read, format, and push AI-authored book manuscripts directly into Google Docs files.", 
    icon: <FileText className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />, 
    connected: true, 
    category: "Productivity",
    apiKeyPlaceholder: "oauth2_token_docs",
    endpointUrl: "https://docs.googleapis.com/v1/documents"
  },
  { 
    id: "notion", 
    name: "Notion Workspace", 
    description: "Access team wikis, project databases, and roadmap boards for continuous context sync.", 
    icon: <LayoutGrid className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />, 
    connected: false, 
    category: "Productivity",
    apiKeyPlaceholder: "secret_ntn_829348123...",
    endpointUrl: "https://api.notion.com/v1/search"
  },
  { 
    id: "slack", 
    name: "Slack", 
    description: "Read channel updates, alert team members, and dispatch agent approvals via Slack webhooks.", 
    icon: <MessageSquare className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />, 
    connected: false, 
    category: "Communication",
    apiKeyPlaceholder: "xoxb-8293481923...",
    endpointUrl: "https://slack.com/api/chat.postMessage"
  },
  { 
    id: "wordpress", 
    name: "WordPress / WooCommerce", 
    description: "Draft and publish SEO-optimized Bengali & English blog articles and product catalogues.", 
    icon: <Globe className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />, 
    connected: false, 
    category: "Publishing",
    apiKeyPlaceholder: "wp_app_pass_923841",
    endpointUrl: "https://yourblog.com/wp-json/wp/v2/posts"
  },
  { 
    id: "linkedin", 
    name: "LinkedIn", 
    description: "Analyze executive profiles, schedule thought leadership posts, and generate lead connections.", 
    icon: <Briefcase className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />, 
    connected: false, 
    category: "Social",
    apiKeyPlaceholder: "li_at_token_928341",
    endpointUrl: "https://api.linkedin.com/v2/ugcPosts"
  },
  { 
    id: "x", 
    name: "X (Twitter)", 
    description: "Monitor developer sentiment, track release hashtags, and broadcast automated changelogs.", 
    icon: <Twitter className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />, 
    connected: false, 
    category: "Social",
    apiKeyPlaceholder: "Bearer AAAAAAAAAAAA...",
    endpointUrl: "https://api.twitter.com/2/tweets"
  },
  { 
    id: "hubspot", 
    name: "HubSpot CRM", 
    description: "Sync enterprise leads, track customer lifecycle stages, and log meeting transcript summaries.", 
    icon: <Database className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />, 
    connected: false, 
    category: "CRM",
    apiKeyPlaceholder: "pat-na1-829348...",
    endpointUrl: "https://api.hubapi.com/crm/v3/objects/contacts"
  },
  { 
    id: "stripe", 
    name: "Stripe", 
    description: "Read recurring subscriptions, MRR metrics, customer checkout sessions, and refund requests.", 
    icon: <CreditCard className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />, 
    connected: false, 
    category: "Finance & MFS",
    apiKeyPlaceholder: "sk_live_51Nw...",
    endpointUrl: "https://api.stripe.com/v1/charges"
  },
  { 
    id: "drive", 
    name: "Google Drive", 
    description: "Search, extract, and index PDFs, spreadsheets, and slides directly into the LiteParse Knowledge Vault.", 
    icon: <HardDrive className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />, 
    connected: true, 
    category: "Productivity",
    apiKeyPlaceholder: "oauth2_token_drive",
    endpointUrl: "https://www.googleapis.com/drive/v3/files"
  },
  { 
    id: "pipedream", 
    name: "Pipedream & Webhooks", 
    description: "Trigger custom edge webhooks and event-driven automation pipelines with HMAC validation.", 
    icon: <Webhook className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />, 
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
  const [isSaving, setIsSaving] = useState(false);

  // Load user's saved connectors from backend
  React.useEffect(() => {
    async function loadUserConnectors() {
      try {
        const res = await fetch("/api/v1/connectors");
        if (res.ok) {
          const data = await res.json();
          if (data.connectors) {
            setConnectors((prev) =>
              prev.map((c) => {
                const userSaved = data.connectors[c.id.toLowerCase()];
                if (userSaved && userSaved.configured) {
                  return {
                    ...c,
                    connected: true,
                    apiKeyPlaceholder: userSaved.maskedKey || c.apiKeyPlaceholder,
                    endpointUrl: userSaved.endpointUrl || c.endpointUrl,
                  };
                }
                return c;
              })
            );
          }
        }
      } catch (err) {
        console.warn("Failed to load user connectors from backend:", err);
      }
    }
    loadUserConnectors();
  }, []);

  const handleOpenConfig = (connector: Connector) => {
    setSelectedConnector(connector);
    setApiKeyInput(connector.apiKeyPlaceholder || "");
    setEndpointInput(connector.endpointUrl || "");
    setTestResult(null);
  };

  const handleSaveConfig = async () => {
    if (!selectedConnector) return;
    setIsSaving(true);

    try {
      await fetch("/api/v1/connectors/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedConnector.id,
          apiKey: apiKeyInput,
          endpointUrl: endpointInput,
        }),
      });

      setConnectors(connectors.map(c => 
        c.id === selectedConnector.id 
          ? { ...c, connected: true, apiKeyPlaceholder: apiKeyInput, endpointUrl: endpointInput }
          : c
      ));
      setSelectedConnector(null);
    } catch (err) {
      console.error("Failed to save connector key:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestPing = async () => {
    if (!selectedConnector) return;
    setIsTestingPing(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/v1/connectors/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedConnector.id,
          apiKey: apiKeyInput,
          endpointUrl: endpointInput,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult(`200 OK — Handshake verified (${data.latencyMs || 120}ms latency). ${data.message || ""}`);
      } else {
        setTestResult(`Error: ${data.error || "Connection failed. Please verify API key."}`);
      }
    } catch (err: any) {
      setTestResult(`Connection test error: ${err.message || "Failed to reach server"}`);
    } finally {
      setIsTestingPing(false);
    }
  };

  const toggleConnection = async (id: string) => {
    const target = connectors.find(c => c.id === id);
    if (!target) return;

    if (target.connected) {
      try {
        await fetch(`/api/v1/connectors/${id}`, { method: "DELETE" });
      } catch (err) {
        console.warn("Failed to delete connector on backend:", err);
      }
    }

    setConnectors(connectors.map(c => c.id === id ? { ...c, connected: !c.connected } : c));
  };

  const connectedCount = connectors.filter(c => c.connected).length;

  const filtered = connectors.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    if (activeCategory === "ALL") return true;
    if (activeCategory === "FEATURED") return c.isRegionalFeatured;
    return c.category === activeCategory;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 select-text">
      
      {/* ── Top Header ── */}
      <div className="px-8 py-6 shrink-0 border-b border-zinc-200/80 dark:border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Connectors</h1>
              <span className="px-2.5 py-0.5 text-xs font-mono font-medium rounded-full bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/[0.08]">
                {connectedCount} connected of {connectors.length}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
              Equip your autonomous agents with verified communication endpoints, courier logistics dispatch, and local payment rails.
            </p>
          </div>
        </div>

        {/* Security & Isolation Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-zinc-200/80 dark:border-white/[0.08] bg-zinc-50/50 dark:bg-black/40 backdrop-blur-xl">
            <div className="w-7 h-7 rounded-lg bg-zinc-200/60 dark:bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
              <Shield className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">Encrypted Secrets</div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mt-0.5">
                API keys are stored in encrypted Postgres vaults and injected into isolated edge runtimes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-zinc-200/80 dark:border-white/[0.08] bg-zinc-50/50 dark:bg-black/40 backdrop-blur-xl">
            <div className="w-7 h-7 rounded-lg bg-zinc-200/60 dark:bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
              <RefreshCw className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">Real-Time Webhooks</div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mt-0.5">
                Event streams and TrxID notifications trigger agent workflows autonomously.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-zinc-200/80 dark:border-white/[0.08] bg-zinc-50/50 dark:bg-black/40 backdrop-blur-xl">
            <div className="w-7 h-7 rounded-lg bg-zinc-200/60 dark:bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">Protected Actions</div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mt-0.5">
                Direct payouts and public broadcasts require explicit human confirmation.
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between pt-4">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              className="w-full bg-zinc-50 dark:bg-black/60 border border-zinc-200 dark:border-white/[0.12] rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-emerald-500/50 transition-colors backdrop-blur-xl"
              placeholder="Filter connectors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            {[
              { id: "ALL", label: "All" },
              { id: "FEATURED", label: "Featured" },
              { id: "Logistics & COD", label: "Logistics & COD" },
              { id: "Finance & MFS", label: "Finance & MFS" },
              { id: "Communication", label: "Communication" },
              { id: "Productivity", label: "Productivity" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 ${
                  activeCategory === tab.id
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs font-bold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/[0.04]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Connectors */}
      <div className="flex-1 overflow-y-auto px-8 pb-8 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map(connector => (
            <div 
              key={connector.id} 
              className="flex flex-col justify-between p-4.5 rounded-xl border border-zinc-200/90 dark:border-white/[0.08] bg-white dark:bg-black/40 hover:border-zinc-300 dark:hover:border-white/[0.18] transition relative group backdrop-blur-xl shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-100 dark:bg-white/[0.06] border border-zinc-200/80 dark:border-white/[0.08]">
                    {connector.icon}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {connector.isRegionalFeatured && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/[0.08] font-medium">
                        Featured
                      </span>
                    )}

                    {connector.connected ? (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <Check className="w-3 h-3" />
                        Connected
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-full border border-zinc-200 dark:border-white/[0.08]">
                        Available
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-3.5">
                  <h3 className="font-semibold text-zinc-950 dark:text-zinc-100 text-sm mb-1">{connector.name}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed line-clamp-2">{connector.description}</p>
                  <div className="mt-2.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 dark:text-zinc-500">
                      {connector.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleConnection(connector.id)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      connector.connected 
                        ? "text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 border border-zinc-200 dark:border-zinc-800 hover:border-rose-200 dark:hover:border-rose-900/40 bg-transparent" 
                        : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white shadow-xs"
                    }`}
                  >
                    {connector.connected ? "Disconnect" : "Connect"}
                  </button>

                  <button
                    onClick={() => handleOpenConfig(connector)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                    title="Configure API Keys & Webhooks"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${connector.connected ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"}`} />
                  <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                    {connector.connected ? "Active" : "Ready"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Configure Connector Modal ── */}
      {selectedConnector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center">
                  {selectedConnector.icon}
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-950 dark:text-zinc-50">Configure {selectedConnector.name}</h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{selectedConnector.category}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedConnector(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-zinc-500" />
                  <span>API Key / Secret Token</span>
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={selectedConnector.apiKeyPlaceholder || "Enter API secret key..."}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Webhook className="w-3.5 h-3.5 text-zinc-500" />
                  <span>API / Webhook Endpoint</span>
                </label>
                <input
                  type="text"
                  value={endpointInput}
                  onChange={(e) => setEndpointInput(e.target.value)}
                  placeholder={selectedConnector.endpointUrl || "https://api.service.com/v1"}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>

              {testResult && (
                <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 font-mono">
                  {testResult}
                </div>
              )}

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <Shield className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Keys are stored in an encrypted vault and decrypted only at edge execution time.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestPing}
                  disabled={isTestingPing}
                  className="text-xs gap-1.5 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingPing ? "animate-spin" : ""}`} />
                  <span>{isTestingPing ? "Testing..." : "Test Connection"}</span>
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedConnector(null)}
                    className="text-xs border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveConfig}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-xs font-semibold"
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