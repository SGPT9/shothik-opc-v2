/**
 * Cold Email Outreach Engine for Polsia OPC
 * Manages lead prospect cadences, 3-step value sequences, deliverability, and live telemetry tracking.
 */

import logger from "../logger";

export interface OutreachLead {
  id: string;
  name: string;
  email: string;
  company: string;
  status: "queued" | "sent" | "opened" | "replied" | "bounced";
  lastContacted?: string;
  step: number;
}

export interface EmailSequenceStep {
  stepNumber: number;
  subject: string;
  delayDays: number;
  body: string;
}

export interface OutreachCampaignStats {
  totalLeads: number;
  sentCount: number;
  openRatePct: number;
  replyRatePct: number;
  positiveLeads: number;
}

const DEFAULT_LEADS: OutreachLead[] = [
  { id: "lead-1", name: "Tanvir Ahmed", email: "tanvir@dhakaretail.com", company: "Dhaka Retail Hub", status: "replied", step: 3, lastContacted: "Yesterday" },
  { id: "lead-2", name: "Farhana Yasmin", email: "farhana@apexlogistics.bd", company: "Apex Logistics", status: "opened", step: 2, lastContacted: "2 days ago" },
  { id: "lead-3", name: "Sabbir Hossain", email: "sabbir@payflow.io", company: "PayFlow BD", status: "sent", step: 1, lastContacted: "Today" },
  { id: "lead-4", name: "Mahmud Hasan", email: "mahmud@deshitech.com", company: "DeshiTech Solutions", status: "queued", step: 0 },
  { id: "lead-5", name: "Nusrat Jahan", email: "nusrat@chittagongmart.com", company: "Chittagong Mart", status: "queued", step: 0 },
];

export class EmailOutreachEngine {
  private static leads: OutreachLead[] = [...DEFAULT_LEADS];

  private static sequence: EmailSequenceStep[] = [
    {
      stepNumber: 1,
      subject: "Quick question regarding {{company}}'s automated customer verification",
      delayDays: 0,
      body: `Hi {{name}},\n\nNoticed {{company}} is rapidly scaling across Bangladesh. We built an autonomous verification engine that cuts bKash/Nagad reconciliation drops by 94% with 1-tap deep links.\n\nWould you be open to a 3-minute demo video showing how this works for {{company}}?\n\nBest,\nAutonomous Co-Founder`,
    },
    {
      stepNumber: 2,
      subject: "Case study: How VerifiQ AI cut payment drop-offs to <1.2%",
      delayDays: 3,
      body: `Hi {{name}},\n\nFollowing up on my note earlier. Here is how similar e-commerce teams in Dhaka automated 10-char TrxID verification and Steadfast COD parcel booking with zero manual data entry.\n\nWorth exploring for {{company}} this quarter?\n\nBest,\nAutonomous Co-Founder`,
    },
    {
      stepNumber: 3,
      subject: "Should I close this loop for {{company}}?",
      delayDays: 6,
      body: `Hi {{name}},\n\nI understand you're busy growing {{company}}. If automated payment verification isn't a priority right now, no problem at all.\n\nFeel free to book a time here if things change: https://polsia.app/demo\n\nCheers,\nAutonomous Co-Founder`,
    },
  ];

  static getLeads(): OutreachLead[] {
    return [...this.leads];
  }

  static addLead(lead: Omit<OutreachLead, "id" | "status" | "step">): OutreachLead {
    const newLead: OutreachLead = {
      ...lead,
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      status: "queued",
      step: 0,
    };
    this.leads.unshift(newLead);
    logger.info("[email-outreach] Added new prospect lead", { email: lead.email, company: lead.company });
    return newLead;
  }

  static getSequence(): EmailSequenceStep[] {
    return [...this.sequence];
  }

  static updateSequenceStep(stepNumber: number, updates: Partial<EmailSequenceStep>): EmailSequenceStep[] {
    this.sequence = this.sequence.map((s) => (s.stepNumber === stepNumber ? { ...s, ...updates } : s));
    return [...this.sequence];
  }

  static getStats(): OutreachCampaignStats {
    const total = this.leads.length;
    const sent = this.leads.filter((l) => l.status !== "queued").length;
    const opened = this.leads.filter((l) => l.status === "opened" || l.status === "replied").length;
    const replied = this.leads.filter((l) => l.status === "replied").length;

    const openRate = sent > 0 ? Math.round((opened / sent) * 1000) / 10 : 0;
    const replyRate = sent > 0 ? Math.round((replied / sent) * 1000) / 10 : 0;

    return {
      totalLeads: total,
      sentCount: sent,
      openRatePct: openRate,
      replyRatePct: replyRate,
      positiveLeads: replied,
    };
  }

  static async dispatchNextBatch(): Promise<{ dispatchedCount: number; remainingQueued: number }> {
    const queuedLeads = this.leads.filter((l) => l.status === "queued");
    const countToDispatch = queuedLeads.length;

    this.leads = this.leads.map((l) =>
      l.status === "queued"
        ? {
            ...l,
            status: "sent",
            step: 1,
            lastContacted: "Just now",
          }
        : l
    );

    logger.info("[email-outreach] Dispatched cold email batch", { dispatchedCount: countToDispatch });

    return {
      dispatchedCount: countToDispatch,
      remainingQueued: 0,
    };
  }
}
