import logger from "@/lib/logger";

export interface DokployAppConfig {
  name: string;
  repository: string;
  branch: string;
  domain?: string;
  envVariables?: Record<string, string>;
}

export interface DokployDbConfig {
  name: string;
  type: "postgres" | "mysql" | "redis" | "mongodb";
}

export class DokployClient {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.DOKPLOY_API_URL || "http://187.127.125.115:3000/api";
    this.apiKey = process.env.DOKPLOY_API_KEY || "";
  }

  /**
   * Helper to make authorized HTTP requests to Dokploy API
   */
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    if (!this.apiKey) {
      throw new Error("DOKPLOY_API_KEY is not configured in environment variables.");
    }

    const url = `${this.apiUrl.replace(/\/$/, "")}${path}`;
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": this.apiKey,
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error("[dokploy-client] API request failed", {
          url,
          status: response.status,
          error: errorText,
        });
        throw new Error(`Dokploy API Error (${response.status}): ${errorText || response.statusText}`);
      }

      return (await response.json()) as T;
    } catch (err) {
      logger.error("[dokploy-client] Network error occurred", { url, error: err });
      throw err;
    }
  }

  /**
   * Create a new application instance in Dokploy
   */
  async createApplication(config: DokployAppConfig): Promise<{ applicationUuid: string; cleanUrl?: string }> {
    logger.info("[dokploy-client] Creating application", { name: config.name, repository: config.repository });

    const payload = {
      name: config.name,
      repository: config.repository,
      branch: config.branch,
      domain: config.domain,
      env: config.envVariables ? Object.entries(config.envVariables).map(([key, value]) => ({ key, value })) : [],
    };

    const response = await this.request<{ uuid: string; domain?: string }>("/application.create", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return {
      applicationUuid: response.uuid,
      cleanUrl: response.domain || config.domain,
    };
  }

  /**
   * Trigger deployment for an application
   */
  async deployApplication(applicationUuid: string): Promise<{ success: boolean; deploymentId: string }> {
    logger.info("[dokploy-client] Deploying application", { applicationUuid });

    const response = await this.request<{ success: boolean; deploymentId: string }>(
      `/application.deploy`,
      {
        method: "POST",
        body: JSON.stringify({ uuid: applicationUuid }),
      }
    );

    return response;
  }

  /**
   * Create a managed database instance (e.g. Postgres)
   */
  async createDatabase(config: DokployDbConfig): Promise<{ databaseUuid: string; connectionString: string }> {
    logger.info("[dokploy-client] Creating database instance", { name: config.name, type: config.type });

    const endpoint = `/${config.type}.create`;
    const response = await this.request<{ uuid: string; connectionUri: string }>(endpoint, {
      method: "POST",
      body: JSON.stringify({ name: config.name }),
    });

    return {
      databaseUuid: response.uuid,
      connectionString: response.connectionUri,
    };
  }

  /**
   * Fetch current build and health status of an application
   */
  async getApplicationStatus(applicationUuid: string): Promise<{ status: "idle" | "building" | "running" | "failed"; details?: string }> {
    const response = await this.request<{ status: "idle" | "building" | "running" | "failed"; message?: string }>(
      `/application.status?uuid=${applicationUuid}`,
      { method: "GET" }
    );

    return {
      status: response.status,
      details: response.message,
    };
  }
}

// Singleton helper export
let _clientInstance: DokployClient | null = null;
export function getDokployClient(): DokployClient {
  if (!_clientInstance) {
    _clientInstance = new DokployClient();
  }
  return _clientInstance;
}
