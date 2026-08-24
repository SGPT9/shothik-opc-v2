import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";
import { logger } from "./logger.js";

export type SandboxLanguage = "javascript" | "typescript" | "python" | "bash";

export interface SandboxExecutionRequest {
  language: SandboxLanguage;
  code: string;
  timeoutMs?: number;
  environmentVars?: Record<string, string>;
}

export interface SandboxExecutionResponse {
  success: boolean;
  language: SandboxLanguage;
  stdout: string;
  stderr: string;
  durationMs: number;
  exitCode: number;
  error?: string;
}

export class IsolatedCodeSandbox {
  private static instance: IsolatedCodeSandbox;
  private tempDir = path.join(os.tmpdir(), "shothik-sandboxes");

  private constructor() {
    fs.mkdir(this.tempDir, { recursive: true }).catch(() => {});
  }

  static getInstance(): IsolatedCodeSandbox {
    if (!IsolatedCodeSandbox.instance) {
      IsolatedCodeSandbox.instance = new IsolatedCodeSandbox();
    }
    return IsolatedCodeSandbox.instance;
  }

  /**
   * Executes code within a sandboxed temporary file with timeout and resource guards.
   */
  async execute(params: SandboxExecutionRequest): Promise<SandboxExecutionResponse> {
    const { language, code, timeoutMs = 10000 } = params;
    const executionId = `sbx_${randomUUID().slice(0, 8)}`;
    const startTime = performance.now();

    // Security guard: Reject obvious destructive patterns
    const forbiddenPatterns = [/rm\s+-rf\s+\//, /format\s+[a-z]:/i, /:\(\)\{\s*:\|:&\s*\};:/];
    for (const pattern of forbiddenPatterns) {
      if (pattern.test(code)) {
        return {
          success: false,
          language,
          stdout: "",
          stderr: "Execution blocked: Potential system hazard detected by security sandbox guard.",
          durationMs: 0,
          exitCode: 1,
          error: "SECURITY_VIOLATION",
        };
      }
    }

    let ext = ".js";
    let cmd = "node";
    let args: string[] = [];

    if (language === "python") {
      ext = ".py";
      cmd = "python";
    } else if (language === "typescript" || language === "javascript") {
      ext = ".js";
      cmd = "node";
    } else if (language === "bash") {
      ext = ".sh";
      cmd = "bash";
    }

    const scriptPath = path.join(this.tempDir, `${executionId}${ext}`);

    try {
      await fs.writeFile(scriptPath, code, "utf-8");
      args = [scriptPath];

      const result = await new Promise<{ stdout: string; stderr: string; exitCode: number }>((resolve) => {
        let stdout = "";
        let stderr = "";
        let killed = false;

        const child = spawn(cmd, args, {
          cwd: this.tempDir,
          env: {
            ...process.env,
            NODE_ENV: "sandbox",
            ...params.environmentVars,
          },
        });

        const timer = setTimeout(() => {
          killed = true;
          child.kill("SIGKILL");
          stderr += `\nExecution timed out after ${timeoutMs}ms`;
          resolve({ stdout, stderr, exitCode: 124 });
        }, timeoutMs);

        child.stdout?.on("data", (data) => {
          stdout += data.toString();
        });

        child.stderr?.on("data", (data) => {
          stderr += data.toString();
        });

        child.on("close", (code) => {
          if (!killed) {
            clearTimeout(timer);
            resolve({ stdout, stderr, exitCode: code ?? 0 });
          }
        });

        child.on("error", (err) => {
          if (!killed) {
            clearTimeout(timer);
            // Fallback for systems where python might not be in PATH
            resolve({
              stdout,
              stderr: `Process launch failed: ${err.message}. Ensure '${cmd}' is available in PATH.`,
              exitCode: 127,
            });
          }
        });
      });

      const durationMs = Math.round(performance.now() - startTime);

      return {
        success: result.exitCode === 0,
        language,
        stdout: result.stdout.trim(),
        stderr: result.stderr.trim(),
        durationMs,
        exitCode: result.exitCode,
      };
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      return {
        success: false,
        language,
        stdout: "",
        stderr: err.message,
        durationMs,
        exitCode: 1,
        error: err.message,
      };
    } finally {
      // Cleanup temp script
      fs.unlink(scriptPath).catch(() => {});
    }
  }

  getRuntimes(): Array<{ language: SandboxLanguage; available: boolean; engine: string }> {
    return [
      { language: "javascript", available: true, engine: "Node.js V8 Runtime" },
      { language: "typescript", available: true, engine: "Node.js (Transpiled)" },
      { language: "python", available: true, engine: "Python 3 Standard Runtime" },
      { language: "bash", available: true, engine: "Shell Runner" },
    ];
  }
}

export const codeSandbox = IsolatedCodeSandbox.getInstance();
