import { useState, useCallback } from "react";
import { CoolifyDokployDeployer, type DeploymentResult, type DeployWebsiteParams } from "@/lib/infrastructure/coolify-deployer";

export interface DeployState {
  isDeploying: boolean;
  status: "idle" | "building" | "ssl_verifying" | "healthy" | "failed";
  statusText: string;
  result: DeploymentResult | null;
  error: string | null;
}

export function useCoolifyDeployer() {
  const [deployState, setDeployState] = useState<DeployState>({
    isDeploying: false,
    status: "idle",
    statusText: "Ready to deploy",
    result: null,
    error: null,
  });

  const triggerDeploy = useCallback(async (params: DeployWebsiteParams) => {
    setDeployState({
      isDeploying: true,
      status: "building",
      statusText: "Building Docker container on Coolify/Dokploy…",
      result: null,
      error: null,
    });

    try {
      // Simulate build steps
      await new Promise((resolve) => setTimeout(resolve, 600));

      setDeployState((prev) => ({
        ...prev,
        status: "ssl_verifying",
        statusText: "Verifying Let's Encrypt SSL & DNS records…",
      }));

      await new Promise((resolve) => setTimeout(resolve, 400));

      const result = await CoolifyDokployDeployer.deployWebsite(params);

      setDeployState({
        isDeploying: false,
        status: "healthy",
        statusText: "Container healthy & live",
        result,
        error: null,
      });

      return result;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setDeployState({
        isDeploying: false,
        status: "failed",
        statusText: "Deployment failed",
        result: null,
        error: errorMsg,
      });
      return null;
    }
  }, []);

  return {
    deployState,
    triggerDeploy,
  };
}
