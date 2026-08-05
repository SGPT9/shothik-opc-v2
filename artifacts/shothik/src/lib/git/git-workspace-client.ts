import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import logger from "@/lib/logger";

export interface WorkspaceFile {
  relativePath: string;
  content: string;
}

export class GitWorkspaceClient {
  private baseDir: string;
  private githubToken: string;
  private repoUrl: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), "tmp", "workspaces");
    this.githubToken = process.env.GITHUB_TOKEN || "";
    this.repoUrl = process.env.GITHUB_REPO_URL || "github.com/ahsanhab919-ux/shothik-web.git";

    // Ensure base directory exists
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  /**
   * Prepares a workspace and pushes to a dynamic git branch.
   */
  async prepareAndPushWorkspace(
    runId: string,
    files: WorkspaceFile[]
  ): Promise<{ branchName: string; repoUrl: string }> {
    const branchName = `deploys/run-${runId.slice(0, 8)}`.toLowerCase();
    const workspacePath = path.join(this.baseDir, `run-${runId}`);

    logger.info("[git-workspace] Preparing workspace", { runId, workspacePath, branchName });

    const githubToken = process.env.GITHUB_TOKEN || this.githubToken;

    // Mock mode if no github token is configured
    if (!githubToken) {
      logger.warn("[git-workspace] GITHUB_TOKEN not configured — running in mock mode");
      return { branchName, repoUrl: `https://${this.repoUrl}` };
    }

    try {
      // 1. Re-create workspace directory cleanly
      if (fs.existsSync(workspacePath)) {
        fs.rmSync(workspacePath, { recursive: true, force: true });
      }
      fs.mkdirSync(workspacePath, { recursive: true });

      // 2. Clone boilerplate or initialize a repo
      const authRepoUrl = `https://x-access-token:${githubToken}@${this.repoUrl}`;
      execSync(`git clone --depth 1 https://${this.repoUrl} ${workspacePath}`, { stdio: "ignore" });

      // 3. Write files into the workspace
      for (const file of files) {
        const filePath = path.join(workspacePath, file.relativePath);
        const fileDir = path.dirname(filePath);
        if (!fs.existsSync(fileDir)) {
          fs.mkdirSync(fileDir, { recursive: true });
        }
        fs.writeFileSync(filePath, file.content, "utf-8");
      }

      // 4. Git operations: add, commit, and push branch
      const gitCmds = [
        `git config user.name "Shothik Twin Agent"`,
        `git config user.email "twin@shothik.app"`,
        `git checkout -b ${branchName}`,
        `git add .`,
        `git commit -m "feat: Autonomous agent deploy for run ${runId}"`,
        `git remote set-url origin ${authRepoUrl}`,
        `git push origin ${branchName} --force`,
      ];

      for (const cmd of gitCmds) {
        execSync(cmd, { cwd: workspacePath, stdio: "ignore" });
      }

      // 5. Cleanup local workspace directory
      fs.rmSync(workspacePath, { recursive: true, force: true });

      logger.info("[git-workspace] Workspace pushed successfully", { branchName });
      return { branchName, repoUrl: `https://${this.repoUrl}` };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[git-workspace] Git operations failed", { runId, error: errMsg });
      throw new Error(`Git Workspace Failure: ${errMsg}`);
    }
  }
}

// Singleton helper
let _gitClientInstance: GitWorkspaceClient | null = null;
export function getGitWorkspaceClient(): GitWorkspaceClient {
  if (!_gitClientInstance) {
    _gitClientInstance = new GitWorkspaceClient();
  }
  return _gitClientInstance;
}
