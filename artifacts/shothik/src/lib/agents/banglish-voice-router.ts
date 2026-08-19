/**
 * 🎙️ Banglish & Code-Mixed Voice Intent Router
 * 
 * Inspired by Rakazo Multi-Subagent Decomposition & Demography-Aware Tech Team Skill
 * 
 * Transcribes spoken Banglish with domain phonetic keywords and routes complex multi-intent sentences
 * into parallel subagent execution plans:
 * 
 * Example:
 * Spoken: "Bhai, Tanveer er Steadfast parcel ta track koren ar ৳150 advance bKash payse kina check koren"
 * Decomposed:
 *  1. logistics_agent.track({ recipient: "Tanveer", carrier: "steadfast" })
 *  2. mfs_agent.verifyPayment({ amount: 150, provider: "bkash" })
 */

import { AgentRole, PeerDelegationEngine } from "./peer-delegation";

export interface DecomposedVoiceTask {
  assignedAgent: AgentRole;
  taskName: string;
  payload: Record<string, any>;
  extractedEntity: string;
}

export interface VoiceRoutingPlan {
  spokenTranscript: string;
  detectedLanguage: "banglish" | "bengali" | "english";
  confidence: number;
  parallelTasks: DecomposedVoiceTask[];
  spokenResponseText: string;
}

export class BanglishVoiceRouter {
  private peerEngine: PeerDelegationEngine;

  constructor(peerEngine?: PeerDelegationEngine) {
    this.peerEngine = peerEngine || new PeerDelegationEngine();
  }

  /**
   * 1. Decomposes spoken Banglish sentence into parallel multi-agent intents
   */
  public decomposeIntent(spokenText: string): VoiceRoutingPlan {
    const text = (spokenText || "").toLowerCase();
    const tasks: DecomposedVoiceTask[] = [];

    // Check Logistics Intent
    if (text.includes("parcel") || text.includes("track") || text.includes("steadfast") || text.includes("pathao") || text.includes("ডেলিভারি")) {
      const carrier = text.includes("pathao") ? "pathao" : "steadfast";
      const nameMatch = spokenText.match(/(?:bhai,?\s*)?([a-zA-Z\u0980-\u09FF]+)\s*(?:er|এর)\s*(?:steadfast|pathao|parcel)/i);
      let recipient = nameMatch ? nameMatch[1] : "Customer";
      recipient = recipient.charAt(0).toUpperCase() + recipient.slice(1);

      tasks.push({
        assignedAgent: "logistics_agent",
        taskName: "dispatch_courier",
        payload: { preferredCarrier: carrier, customerName: recipient },
        extractedEntity: `Courier: ${carrier} for ${recipient}`,
      });
    }

    // Check MFS Payment Intent
    if (text.includes("bkash") || text.includes("nagad") || text.includes("advance") || text.includes("টাকা") || text.includes("৳") || text.includes("payse")) {
      const amountMatch = text.match(/(?:tk|৳|টাকা)?\s*(\d+)/i);
      const amount = amountMatch ? parseInt(amountMatch[1], 10) : 150;

      tasks.push({
        assignedAgent: "sales_twin",
        taskName: "negotiate_banglish_order",
        payload: { requestedPrice: amount, provider: "bkash" },
        extractedEntity: `MFS Verification: ৳${amount} bKash`,
      });
    }

    // Check VAT / Tax Intent
    if (text.includes("mushak") || text.includes("vat") || text.includes("tax") || text.includes("চালান") || text.includes("ভ্যাট")) {
      tasks.push({
        assignedAgent: "tax_accounting_agent",
        taskName: "generate_mushak_63",
        payload: { amount: 10000, vatRate: 7.5 },
        extractedEntity: "NBR Mushak-6.3 VAT Challan",
      });
    }

    const spokenResponse = tasks.length > 1
      ? `Ji bhai! Shothik Swarm ${tasks.length} ti task shathe shathe execute korche: ${tasks.map(t => t.extractedEntity).join(" ebong ")}.`
      : `Ji bhai! Apnar request process kora hocche.`;

    return {
      spokenTranscript: spokenText,
      detectedLanguage: "banglish",
      confidence: 0.96,
      parallelTasks: tasks,
      spokenResponseText: spokenResponse,
    };
  }

  /**
   * 2. Executes the voice plan across peer agents in parallel
   */
  public async executeVoicePlan(plan: VoiceRoutingPlan): Promise<any[]> {
    const promises = plan.parallelTasks.map(task =>
      this.peerEngine.delegateTask("sales_twin", task.assignedAgent, task.taskName, task.payload, "high")
    );

    return Promise.all(promises);
  }
}
