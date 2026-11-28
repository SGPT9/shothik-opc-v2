/**
 * Merchant & Creator Agent Marketplace Service (Pillar 6)
 * Manages custom agent catalog discovery, 1-click preset installation, and 80/20 bKash creator revenue splits.
 */

export interface AgentMarketplaceItem {
  id: string;
  name: string;
  category: "f-commerce" | "vat-tax" | "nilkhet-publishing" | "developer-swarm";
  description: string;
  authorName: string;
  installsCount: number;
  rating: number;
  priceCredits: number;
  systemPromptDirective: string;
  iconName: string;
}

export interface AgentInstallResult {
  success: boolean;
  agentId: string;
  agentName: string;
  creatorPayoutBdt: number;
  platformFeeBdt: number;
  timestamp: string;
}

export class AgentMarketplaceService {
  private catalog: AgentMarketplaceItem[] = [
    {
      id: "agent_fcommerce_live",
      name: "Facebook Live Stream Order Parser Bot",
      category: "f-commerce",
      description: "Auto-converts live video comments into bKash payment links & Steadfast courier bookings.",
      authorName: "Shothik Merchant Lab",
      installsCount: 1420,
      rating: 4.9,
      priceCredits: 0, // Free tier
      systemPromptDirective: "Parse Facebook Live comments for 11-digit phone numbers and BD delivery addresses.",
      iconName: "Video",
    },
    {
      id: "agent_nbr_vat",
      name: "NBR Mushak-6.3 Tax & VAT Assistant",
      category: "vat-tax",
      description: "Generates gapless sequential Mushak-6.3 challans and Section 78 income tax rebate schedules.",
      authorName: "Dhaka Tax Advisory Ltd",
      installsCount: 890,
      rating: 4.8,
      priceCredits: 100, // ৳100
      systemPromptDirective: "Calculate NBR VAT rates (5% to 15%) and format gapless Mushak-6.3 tax challans.",
      iconName: "FileText",
    },
    {
      id: "agent_nilkhet_author",
      name: "Nilkhet 3D Book Authoring & Preflight Bot",
      category: "nilkhet-publishing",
      description: "Automates PDF X-1a preflight checks, SHA-256 DRM watermarking, and Nilkhet POD printing costs.",
      authorName: "Nilkhet Press Guild",
      installsCount: 650,
      rating: 4.7,
      priceCredits: 50, // ৳50
      systemPromptDirective: "Enforce 300 DPI CMYK PDF export guidelines and generate Nilkhet print cost matrix.",
      iconName: "BookOpen",
    },
    {
      id: "agent_cursor_code",
      name: "Cursor Code Master & Security Swarm",
      category: "developer-swarm",
      description: "Runs multi-agent code reviews, DSH capability seam refactoring, and zero-day vulnerability checks.",
      authorName: "SGPT9 Dev Labs",
      installsCount: 2100,
      rating: 5.0,
      priceCredits: 0,
      systemPromptDirective: "Execute 12-Pillar reference architecture code reviews and enforce strict immutability.",
      iconName: "Code",
    },
  ];

  /**
   * Retrieve catalog items filtered by category or search query
   */
  public getCatalog(category?: string, query?: string): AgentMarketplaceItem[] {
    return this.catalog.filter((item) => {
      const matchCategory = !category || category === "all" || item.category === category;
      const matchQuery =
        !query ||
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase());
      return matchCategory && matchQuery;
    });
  }

  /**
   * Install agent preset and calculate 80/20 creator revenue split
   */
  public async installAgentWithCredits(agentId: string, userId = "usr_default"): Promise<AgentInstallResult & { remainingCredits?: number }> {
    const agent = this.catalog.find((a) => a.id === agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    let remainingCredits: number | undefined;
    if (agent.priceCredits > 0) {
      const res = await fetch("/api/v1/subscriptions/ledger:deduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          amount: agent.priceCredits,
          taskId: `marketplace_install_${agent.id}`,
          taskTitle: `Install Emporium Skill: ${agent.name}`,
          reason: `Emporium Marketplace 80/20 Creator Split: ${agent.name}`,
        }),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.message || "Insufficient wallet credits for Emporium install.");
      }
      const data = await res.json().catch(() => ({}));
      remainingCredits = data.remainingCredits;
    }

    const priceBdt = agent.priceCredits;
    const creatorPayoutBdt = Math.round(priceBdt * 0.8);
    const platformFeeBdt = priceBdt - creatorPayoutBdt;
    agent.installsCount += 1;

    if (typeof window !== "undefined") {
      try {
        const installed = JSON.parse(localStorage.getItem("shothik_installed_agents") || "[]");
        if (!installed.includes(agent.id)) {
          installed.push(agent.id);
          localStorage.setItem("shothik_installed_agents", JSON.stringify(installed));
        }
      } catch (e) {}
    }

    return {
      success: true,
      agentId: agent.id,
      agentName: agent.name,
      creatorPayoutBdt,
      platformFeeBdt,
      remainingCredits,
      timestamp: new Date().toISOString(),
    };
  }

  public installAgent(agentId: string): AgentInstallResult {
    const agent = this.catalog.find((a) => a.id === agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const priceBdt = agent.priceCredits;
    const creatorPayoutBdt = Math.round(priceBdt * 0.8); // 80% to Creator
    const platformFeeBdt = priceBdt - creatorPayoutBdt; // 20% Platform Fee

    agent.installsCount += 1;

    return {
      success: true,
      agentId: agent.id,
      agentName: agent.name,
      creatorPayoutBdt,
      platformFeeBdt,
      timestamp: new Date().toISOString(),
    };
  }
}

export const agentMarketplaceService = new AgentMarketplaceService();
