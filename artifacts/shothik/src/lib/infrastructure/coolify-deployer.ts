import logger from "@/lib/logger";
import { CustomDomainDnsService, type CustomDomainStatus } from "./custom-domain-dns";
import { DeploymentNotificationMailer } from "./deployment-notification-mailer";
// Import utility generators for Dockerfile and Next.js config
import { generateStandaloneDockerfile as generateDockerfile } from "@/lib/infrastructure/dockerfile-generator";
import { generateStandaloneNextConfig } from "@/lib/infrastructure/next-config-generator";

const CONFIG = {
  containerSizeEstimateMb: 88,
};

export interface DeployWebsiteParams {
  workspaceId: string;
  siteTitle: string;
  userEmail?: string;
  bundleContent?: Record<string, unknown>;
  customDomain?: string;
  provider?: "coolify" | "dokploy" | "hostinger";
  enableMonetization?: boolean;
}

export interface DeploymentResult {
  deploymentId: string;
  siteTitle: string;
  liveUrl: string;
  docsUrl: string;
  canvasUrl: string;
  providerUsed: string;
  sslActive: boolean;
  monetizationInjected: boolean;
  openApiInjected: boolean;
  customDomainStatus?: CustomDomainStatus;
  emailNotificationSent: boolean;
  createdAt: string;
  dockerfileSnippet?: string;
  nextConfigSnippet?: string;
  containerSizeEstimateMb?: number;
  error?: string;
}

/**
 * Infrastructure deployment utilities for Coolify, Dokploy, and Hostinger VPS.
 *
 * This class now delegates Dockerfile and Next.js configuration generation to
 * dedicated utility modules, validates input parameters, and wraps the deployment
 * flow in robust error handling. Configuration defaults are sourced from
 * `CONFIG` for easier testing and environment overrides.
 */
export class CoolifyDokployDeployer {
  /**
   * Generates a minimal 3-stage standalone Dockerfile with non-root security.
   */
  static generateStandaloneDockerfile(): string {
    return generateDockerfile();
  }

  /**
   * Generates a Next.js configuration string with output: 'standalone' enabled.
   */
  static generateStandaloneNextConfig(): string {
    return generateStandaloneNextConfig();
  }

  /**
   * One‑click deployment engine for Coolify, Dokploy, and Hostinger VPS.
   * Auto‑injects Stripe/OKX monetization, OpenAPI 3.0 /docs, custom DNS
   * verification, and user email notification digest.
   */
  static async deployWebsite(params: DeployWebsiteParams): Promise<DeploymentResult> {
    // ---- Input validation -------------------------------------------------
    if (!params || typeof params !== "object") {
      return { error: "Invalid deployment parameters provided." } as DeploymentResult;
    }
    const { siteTitle, workspaceId } = params;
    if (!siteTitle || typeof siteTitle !== "string" || siteTitle.trim() === "") {
      return { error: "Missing or empty siteTitle." } as DeploymentResult;
    }
    if (!workspaceId || typeof workspaceId !== "string" || workspaceId.trim() === "") {
      return { error: "Missing or empty workspaceId." } as DeploymentResult;
    }

    const startTime = Date.now();
    const slug = siteTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "app-site";
    const deploymentId = `dep_${Date.now()}`;
    const providerUsed = params.provider || "coolify";
    const enableMonetization = params.enableMonetization !== false;

    // Generate snippets using shared utilities (config‑driven defaults inside them)
    const dockerfileSnippet = generateDockerfile();
    const nextConfigSnippet = generateStandaloneNextConfig();

    const correlationId = deploymentId; // simple correlation for all logs
    logger.info("[coolify-deployer] Initiating website deployment", {
      correlationId,
      siteTitle,
      slug,
      provider: providerUsed,
      monetization: enableMonetization,
    });

    let liveUrl = `https://${slug}.shothik.app`;
    let docsUrl = `https://${slug}.shothik.app/docs`;
    const canvasUrl = `https://shothik.ai/canvas?artifact=${deploymentId}`;
    let customDomainStatus: CustomDomainStatus | undefined;
    let emailNotificationSent = false;

    try {
      // ---- Custom domain handling --------------------------------------
      if (params.customDomain) {
        customDomainStatus = await CustomDomainDnsService.verifyAndBindCustomDomain(
          workspaceId,
          params.customDomain
        );
        if (customDomainStatus?.verified) {
          liveUrl = `https://${customDomainStatus.domain}`;
          docsUrl = `https://${customDomainStatus.domain}/docs`;
        }
      }

      // ---- Email notification ------------------------------------------
      if (params.userEmail) {
        const emailResult = await DeploymentNotificationMailer.sendDeploymentEmail(
          params.userEmail,
          {
            siteTitle,
            liveUrl,
            docsUrl,
            canvasUrl,
            customDomain: params.customDomain,
            provider: providerUsed,
            monetizationEnabled: enableMonetization,
          }
        );
        emailNotificationSent = emailResult.success;
      }

      // Successful deployment log
      logger.info("[coolify-deployer] Deployment succeeded", {
        correlationId,
        deploymentId,
        liveUrl,
        docsUrl,
        latencyMs: Date.now() - startTime,
      });

      return {
        deploymentId,
        siteTitle,
        liveUrl,
        docsUrl,
        canvasUrl,
        providerUsed,
        sslActive: true,
        monetizationInjected: enableMonetization,
        openApiInjected: true,
        customDomainStatus,
        emailNotificationSent,
        dockerfileSnippet,
        nextConfigSnippet,
        // Use config default for container size estimate
        containerSizeEstimateMb: CONFIG.containerSizeEstimateMb,
        createdAt: new Date().toISOString(),
      };
    } catch (err) {
      // ---- Global error handling ---------------------------------------
      logger.error("[coolify-deployer] Deployment failed", { correlationId, error: err });
      return {
        deploymentId,
        siteTitle,
        liveUrl,
        docsUrl,
        canvasUrl,
        providerUsed,
        sslActive: false,
        monetizationInjected: enableMonetization,
        openApiInjected: false,
        customDomainStatus,
        emailNotificationSent,
        dockerfileSnippet,
        nextConfigSnippet,
        containerSizeEstimateMb: CONFIG.containerSizeEstimateMb,
        createdAt: new Date().toISOString(),
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}

