import { execFile } from "node:child_process";
import * as path from "node:path";
import * as fs from "node:fs";

const SAFE_SKILL_NAME_REGEX = /^[a-zA-Z0-9_-]+$/;

/**
 * Run an external skill using the `agy run-skill` command safely without shell interpolation.
 * @param skillName   The folder name of the skill (e.g. "yt-script")
 * @param args        Arguments to pass to the skill as a JSON object.
 * @returns           Promise that resolves with the skill stdout or rejects with stderr.
 */
export async function runSkill(skillName: string, args: Record<string, unknown>): Promise<string> {
  if (!skillName || !SAFE_SKILL_NAME_REGEX.test(skillName)) {
    throw new Error("Invalid skill name: only alphanumeric characters, hyphens, and underscores are permitted.");
  }

  const skillPathsEnv = process.env.SKILL_PATHS;
  if (!skillPathsEnv) {
    throw new Error("SKILL_PATHS env var not set – cannot locate external skills");
  }
  const skillPaths = skillPathsEnv.split(path.delimiter).filter(Boolean);

  let skillDir: string | undefined;
  for (const base of skillPaths) {
    const resolvedBase = path.resolve(base);
    const candidate = path.resolve(resolvedBase, skillName);
    if (!candidate.startsWith(resolvedBase + path.sep)) {
      continue;
    }
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      skillDir = candidate;
      break;
    }
  }

  if (!skillDir) {
    throw new Error(`Skill "${skillName}" not found in any SKILL_PATHS directories`);
  }

  return new Promise<string>((resolve, reject) => {
    const proc = execFile("agy", ["run-skill", skillDir], { cwd: skillDir, timeout: 30000 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Skill execution failed: ${stderr || error.message}`));
      } else {
        resolve(stdout.trim());
      }
    });
    if (proc.stdin) {
      proc.stdin.write(JSON.stringify(args));
      proc.stdin.end();
    }
  });
}
