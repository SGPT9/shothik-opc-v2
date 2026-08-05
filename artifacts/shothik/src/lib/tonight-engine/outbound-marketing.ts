import fs from "fs";
import path from "path";
import logger from "@/lib/logger";

export interface SourcedLead {
  email: string;
  name?: string;
  source: string;
}

export interface SocialPostDraft {
  platform: "twitter" | "linkedin" | "general";
  content: string;
  suggestedTime?: string;
}

export class OutboundMarketingService {
  /**
   * Automatically scans the generated report for leads and social media content,
   * extracting and cataloging them in workspace artifacts.
   */
  static async extractAndRegisterCampaigns(params: {
    runId: string;
    workspaceId: string;
    finalReport: string;
    prompt: string;
  }): Promise<{
    leadsCount: number;
    postsCount: number;
    leadsPath?: string;
    postsPath?: string;
  }> {
    const { runId, finalReport, prompt } = params;
    
    // 1. Extract Emails/Leads using regex
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/g;
    const foundEmails = Array.from(new Set(finalReport.match(emailRegex) || []));
    
    const leads: SourcedLead[] = foundEmails.map(email => {
      // Try to find a name preceding the email in the line
      const lines = finalReport.split("\n");
      let name = "";
      for (const line of lines) {
        if (line.includes(email)) {
          // Simple name extraction heuristical logic
          const nameMatch = line.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
          if (nameMatch && !line.startsWith("Email")) {
            name = nameMatch[1];
          }
          break;
        }
      }
      return {
        email,
        name: name || undefined,
        source: `Tonight Engine Run: ${runId.slice(0, 8)}`,
      };
    });

    // 2. Extract Social media posts
    // Matches blocks starting with [Twitter], [LinkedIn], [Post] or similar
    const postBlocks = finalReport.split(/\[(Twitter|LinkedIn|Post)\]/gi);
    const socialPosts: SocialPostDraft[] = [];

    if (postBlocks.length > 1) {
      for (let j = 1; j < postBlocks.length; j += 2) {
        const platformType = postBlocks[j].toLowerCase();
        const contentBlock = postBlocks[j + 1]?.trim().split("\n\n")[0]?.trim();
        if (contentBlock) {
          socialPosts.push({
            platform: platformType === "twitter" ? "twitter" : platformType === "linkedin" ? "linkedin" : "general",
            content: contentBlock,
            suggestedTime: new Date(Date.now() + (j * 3600000)).toISOString(), // increment hour
          });
        }
      }
    }

    // Fallback parser: scan for paragraph blocks mentioning hashtags or launch announcements
    if (socialPosts.length === 0) {
      const lines = finalReport.split("\n");
      for (const line of lines) {
        if ((line.includes("#") || line.includes("launching") || line.includes("checkout")) && line.length > 50 && line.length < 280) {
          socialPosts.push({
            platform: "twitter",
            content: line.trim(),
            suggestedTime: new Date(Date.now() + 86400000).toISOString(),
          });
        }
      }
    }

    // 3. Write artifacts to scratch space
    const scratchDir = path.join(process.cwd(), "tmp", "campaigns");
    if (!fs.existsSync(scratchDir)) {
      fs.mkdirSync(scratchDir, { recursive: true });
    }

    let leadsPath = "";
    let postsPath = "";

    if (leads.length > 0) {
      leadsPath = path.join(scratchDir, `leads_${runId}.json`);
      fs.writeFileSync(leadsPath, JSON.stringify(leads, null, 2), "utf-8");
      logger.info("[outbound-marketing] Sourced leads extracted successfully", { runId, count: leads.length, path: leadsPath });
    }

    if (socialPosts.length > 0) {
      postsPath = path.join(scratchDir, `social_${runId}.json`);
      fs.writeFileSync(postsPath, JSON.stringify(socialPosts, null, 2), "utf-8");
      logger.info("[outbound-marketing] Social media post drafts extracted successfully", { runId, count: socialPosts.length, path: postsPath });
    }

    return {
      leadsCount: leads.length,
      postsCount: socialPosts.length,
      leadsPath: leadsPath || undefined,
      postsPath: postsPath || undefined
    };
  }
}
