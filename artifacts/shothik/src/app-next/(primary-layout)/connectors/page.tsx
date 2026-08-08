import { useState } from "react";
import { 
  Search, Mail, FileText, LayoutTemplate, MessageSquare, 
  Globe, Briefcase, Webhook, Database, CreditCard, 
  HardDrive, ShieldCheck, Eye, Edit3, AlertTriangle, 
  CheckCircle2, Twitter, LayoutGrid
} from "lucide-react";

interface Connector {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  category: string;
}

const INITIAL_CONNECTORS: Connector[] = [
  { id: "gmail", name: "Gmail", description: "Read emails, draft replies, and search threads.", icon: <Mail className="w-5 h-5 text-red-500" />, connected: true, category: "Communication" },
  { id: "gdocs", name: "Google Docs", description: "Read and write to Google Docs.", icon: <FileText className="w-5 h-5 text-blue-500" />, connected: true, category: "Productivity" },
  { id: "notion", name: "Notion", description: "Access pages, databases, and workspace search.", icon: <LayoutGrid className="w-5 h-5 text-foreground" />, connected: false, category: "Productivity" },
  { id: "slack", name: "Slack", description: "Read channel history and send messages.", icon: <MessageSquare className="w-5 h-5 text-purple-500" />, connected: false, category: "Communication" },
  { id: "wordpress", name: "WordPress", description: "Draft and publish blog posts.", icon: <Globe className="w-5 h-5 text-blue-400" />, connected: false, category: "Publishing" },
  { id: "linkedin", name: "LinkedIn", description: "Analyze profiles and draft posts.", icon: <Briefcase className="w-5 h-5 text-blue-600" />, connected: false, category: "Social" },
  { id: "x", name: "X (Twitter)", description: "Read timeline and draft tweets.", icon: <Twitter className="w-5 h-5 text-foreground" />, connected: false, category: "Social" },
  { id: "hubspot", name: "HubSpot", description: "Sync contacts and CRM data.", icon: <Database className="w-5 h-5 text-orange-500" />, connected: false, category: "CRM" },
  { id: "stripe", name: "Stripe", description: "Read read-only financial metrics.", icon: <CreditCard className="w-5 h-5 text-indigo-500" />, connected: false, category: "Finance" },
  { id: "drive", name: "Google Drive", description: "Search and index workspace files.", icon: <HardDrive className="w-5 h-5 text-green-500" />, connected: true, category: "Productivity" },
  { id: "pipedream", name: "Pipedream", description: "Trigger custom webhooks and workflows.", icon: <Webhook className="w-5 h-5 text-emerald-500" />, connected: false, category: "Automation" },
];

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>(INITIAL_CONNECTORS);
  const [search, setSearch] = useState("");

  const toggleConnection = (id: string) => {
    setConnectors(connectors.map(c => c.id === id ? { ...c, connected: !c.connected } : c));
  };

  const filtered = connectors.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <div className="px-8 py-8 shrink-0">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">Connectors</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Link external data sources to grant Shothik access to your workspace. Connectors enable autonomous research and workflow execution across your existing tools.
        </p>
      </div>

      <div className="px-8 pb-4 shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex flex-col p-4 rounded-xl border border-border bg-muted/20">
            <div className="flex items-center gap-2 text-foreground font-medium mb-1">
              <Eye className="w-4 h-4 text-brand" />
              <span>Read Operations</span>
            </div>
            <p className="text-xs text-muted-foreground">Executed silently to gather context for answers and research.</p>
          </div>
          <div className="flex flex-col p-4 rounded-xl border border-border bg-muted/20">
            <div className="flex items-center gap-2 text-foreground font-medium mb-1">
              <Edit3 className="w-4 h-4 text-amber-500" />
              <span>Write Operations</span>
            </div>
            <p className="text-xs text-muted-foreground">Require one-tap approval in the chat thread before drafting or saving.</p>
          </div>
          <div className="flex flex-col p-4 rounded-xl border border-border bg-muted/20">
            <div className="flex items-center gap-2 text-foreground font-medium mb-1">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Irreversible Actions</span>
            </div>
            <p className="text-xs text-muted-foreground">Public publishing or deletions require explicit confirmation.</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            className="w-full bg-muted/50 border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
            placeholder="Search connectors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(connector => (
            <div key={connector.id} className="flex flex-col p-5 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted border border-border">
                  {connector.icon}
                </div>
                {connector.connected ? (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-brand bg-brand/10 px-2 py-1 rounded-full border border-brand/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full border border-border">
                    Not connected
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-foreground mb-1">{connector.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-6 flex-1">
                {connector.description}
              </p>
              <button 
                onClick={() => toggleConnection(connector.id)}
                className={`w-full py-2 rounded-lg text-xs font-medium transition-colors ${
                  connector.connected 
                    ? "border border-border bg-background text-foreground hover:bg-muted"
                    : "bg-foreground text-background hover:bg-foreground/90"
                }`}
              >
                {connector.connected ? "Disconnect" : "Connect"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}