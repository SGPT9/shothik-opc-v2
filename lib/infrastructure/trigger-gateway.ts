import { randomUUID } from "crypto";
import { TonightGraphRuntime } from "@/lib/tonight-engine/tonight-graph-runtime";
import logger from "@/lib/logger";

export interface WebhookTriggerResult {
  triggered: boolean;
  runId?: string;
  provider: string;
  mappedIntent: string;
  status: "dispatched" | "ignored" | "failed";
}

export class HermesTriggerGateway {
  /**
   * Processes incoming external webhooks (GitHub, InsForge, Stripe, custom) and dispatches autonomous swarm runs.
   */
  static async handleWebhook(
    provider: string,
    payload: Record<string, unknown>
  ): Promise<WebhookTriggerResult> {
    const workspaceId = (payload.workspaceId as string) || "ws_autonomous_ingress";
    const userId = (payload.userId as string) || "usr_trigger_ingress";

    let mappedIntent = "";

    // 1. GitHub Webhook Events
    if (provider === "github" || payload.action || payload.pull_request) {
      const action = payload.action || "opened";
      const repo = (payload.repository as any)?.full_name || "repository";
      mappedIntent = `Autonomous Code & Security Review for GitHub PR/Commit in ${repo} (Action: ${action})`;
    }
    // 2. InsForge Database Mutation Events
    else if (provider === "insforge" || payload.table) {
      const table = payload.table || "users";
      const eventType = payload.eventType || "INSERT";
      mappedIntent = `Automated Customer Prospecting & Onboarding Cadence for InsForge table '${table}' (${eventType})`;
    }
    // 3. Stripe Billing Webhooks
    else if (provider === "stripe" || payload.type) {
      const eventType = payload.type || "checkout.session.completed";
      mappedIntent = `Automated License Provisioning & Billing Receipt Digest for Stripe event '${eventType}'`;
    }
    // 4. Generic / Custom Webhooks
    else {
      mappedIntent = (payload.intent as string) || `Autonomous Swarm Run triggered via ${provider} webhook`;
    }

    logger.info("[trigger-gateway] Webhook received & mapped to swarm intent", {
      provider,
      mappedIntent,
      workspaceId,
    });

    try {
      const runResult = await TonightGraphRuntime.executeGraph({
        runId: `run_trigger_${randomUUID()}`,
        workspaceId,
        userId,
        prompt: mappedIntent,
        depth: "standard",
      });

      return {
        triggered: true,
        runId: runResult.runId,
        provider,
        mappedIntent,
        status: "dispatched",
      };
    } catch (err: any) {
      logger.error("[trigger-gateway] Failed to dispatch triggered swarm run", { error: err.message });
      return {
        triggered: false,
        provider,
        mappedIntent,
        status: "failed",
      };
    }
  }

  /**
   * Processes scheduled cron triggers (e.g., 2 AM nightly audits).
   */
  static async handleCronSchedule(
    scheduleId: string,
    cronPrompt?: string
  ): Promise<WebhookTriggerResult> {
    const prompt = cronPrompt || `Nightly Automated Security, Dependency, and RLS Audit (${scheduleId})`;

    logger.info("[trigger-gateway] Scheduled cron job triggered", { scheduleId, prompt });

    try {
      const runResult = await TonightGraphRuntime.executeGraph({
        runId: `run_cron_${randomUUID()}`,
        workspaceId: "ws_cron_system",
        userId: "usr_cron_system",
        prompt,
        depth: "deep",
      });

      return {
        triggered: true,
        runId: runResult.runId,
        provider: "cron",
        mappedIntent: prompt,
        status: "dispatched",
      };
    } catch (err: any) {
      logger.error("[trigger-gateway] Failed to execute cron schedule run", { error: err.message });
      return {
        triggered: false,
        provider: "cron",
        mappedIntent: prompt,
        status: "failed",
      };
    }
  }
}
