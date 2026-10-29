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

const SAFE_ENV_KEYS = ["PATH", "Path", "SYSTEMROOT", "SystemRoot", "TEMP", "TMP", "HOME", "LANG"] as const;

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

  private buildMinimalEnv(customVars?: Record<string, string>): NodeJS.ProcessEnv {
    const cleanEnv: NodeJS.ProcessEnv = {
      NODE_ENV: "sandbox",
    };
    for (const key of SAFE_ENV_KEYS) {
      if (process.env[key]) {
        cleanEnv[key] = process.env[key];
      }
    }
    if (customVars && typeof customVars === "object") {
      for (const [k, v] of Object.entries(customVars)) {
        if (/^[A-Z0-9_]+$/i.test(k) && typeof v === "string" && !/^(PATH|LD_PRELOAD|NODE_OPTIONS)$/i.test(k)) {
          cleanEnv[k] = v.slice(0, 512);
        }
      }
    }
    return cleanEnv;
  }

  /**
   * Executes code within a sandboxed temporary file with timeout, isolated environment, and resource guards.
   */
  async execute(params: SandboxExecutionRequest): Promise<SandboxExecutionResponse> {
    const { language, code, timeoutMs = 10000 } = params;
    const clampedTimeoutMs = Math.max(500, Math.min(15000, Number(timeoutMs) || 10000));
    const executionId = `sbx_${randomUUID().slice(0, 8)}`;
    const startTime = performance.now();

    // Security guard: Reject destructive commands, process spawning, bracket-notation bypasses, and secret/filesystem exfiltration
    const forbiddenPatterns = [
      /rm\s+-rf\s+\//,
      /format\s+[a-z]:/i,
      /:\(\)\{\s*:\|:&\s*\};:/,
      /\bchild_process\b/,
      /\bprocess\.env\b/,
      /\bprocess\s*\[/,
      /\bos\.environ\b/,
      /\bsubprocess\b/,
      /\bshutil\.rmtree\b/,
      /\brequire\s*\(\s*['"](?:node:)?(?:fs|child_process|net|http|https|dgram|tls|cluster|worker_threads|vm)['"]\s*\)/,
      /\bimport\s*\(\s*['"](?:node:)?(?:fs|child_process|net|http|https|dgram|tls|cluster|worker_threads|vm)['"]\s*\)/,
      /(?:^|\s)import\s+.*from\s+['"](?:node:)?(?:fs|child_process|net|http|https|os|dgram|tls|cluster|worker_threads|vm|inspector)['"]/m,
      /\bprocess\.(?:binding|dlopen|mainModule|kill)\b/,
      /\b(?:globalThis|global)\s*\[/,
      /\b(?:\.env\.local|users\.json|id_rsa|\/etc\/passwd|\/etc\/shadow)\b/i,
    ];
    for (const pattern of forbiddenPatterns) {
      if (pattern.test(code)) {
        logger.warn({ language, pattern: pattern.source }, "[code-sandbox] Blocked unsafe code pattern");
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
          env: this.buildMinimalEnv(params.environmentVars),
          windowsHide: true,
        });

        const timer = setTimeout(() => {
          killed = true;
          child.kill("SIGKILL");
          stderr += `\nExecution timed out after ${clampedTimeoutMs}ms`;
          resolve({ stdout, stderr, exitCode: 124 });
        }, clampedTimeoutMs);

        child.stdout?.on("data", (data) => {
          if (stdout.length < 65536) {
            stdout += data.toString();
          }
        });

        child.stderr?.on("data", (data) => {
          if (stderr.length < 65536) {
            stderr += data.toString();
          }
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
