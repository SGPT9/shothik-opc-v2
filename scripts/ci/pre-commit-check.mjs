#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");

console.log("🛡️  [ECC Security Gate] Running Shothik Pre-Commit Verifier...\n");

// --- Step 1: Unicode Safety & Secret Hygiene ---
console.log("1️⃣  Scanning for unsafe Unicode bidirectional control characters and hardcoded secrets...");

const DANGEROUS_UNICODE = /[\u202A-\u202E\u2066-\u2069\uFEFF\u0000]/;
const SUSPICIOUS_SECRETS = [
  /(?:api[_-]?key|secret|token|password|auth[_-]?key)[\s]*[=:][\s]*['"][A-Za-z0-9-_]{20,}['"]/i,
  /AIza[0-9A-Za-z-_]{35}/, // Google API key
  /ghp_[0-9a-zA-Z]{36}/,   // GitHub Personal Access Token
  /sk-[a-zA-Z0-9]{48}/,    // OpenAI legacy key pattern
];

const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "coverage",
  ".data",
  ".husky",
  "test-results",
  "playwright-report",
]);

let violations = 0;

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name) && !entry.name.startsWith(".pnpm")) {
        scanDir(path.join(dir, entry.name));
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.yaml', '.yml'].includes(ext)) {
        const fullPath = path.join(dir, entry.name);
        try {
          const content = fs.readFileSync(fullPath, "utf-8");
          if (DANGEROUS_UNICODE.test(content)) {
            console.error(`❌ [Unicode Hazard] Suspicious control characters in ${path.relative(repoRoot, fullPath)}`);
            violations++;
          }
          for (const secretRegex of SUSPICIOUS_SECRETS) {
            const matches = content.match(secretRegex);
            if (matches && !fullPath.includes(".example") && !fullPath.includes("__tests__")) {
              const matchedStr = matches[0].toLowerCase();
              if (
                !matchedStr.includes("mock_") &&
                !matchedStr.includes("dev_") &&
                !matchedStr.includes("test_") &&
                !matchedStr.includes("dummy_") &&
                !matchedStr.includes("placeholder") &&
                !matchedStr.includes("shothik_local_")
              ) {
                console.error(`❌ [Secret Hazard] Potential hardcoded credential in ${path.relative(repoRoot, fullPath)}`);
                violations++;
              }
            }
          }
        } catch {
          // ignore binary or unreadable
        }
      }
    }
  }
}

scanDir(path.join(repoRoot, "artifacts", "api-server", "src"));
scanDir(path.join(repoRoot, "packages", "gortex", "src"));

if (violations > 0) {
  console.error(`\n❌ Pre-commit failed: ${violations} security/unicode hazards detected.`);
  process.exit(1);
}
console.log("   ✅ Unicode safety & secret hygiene clean.\n");

// --- Step 2: TypeScript Typecheck Verification ---
console.log("2️⃣  Verifying TypeScript compilation (@workspace/api-server)...");
try {
  execSync("pnpm --filter @workspace/api-server run typecheck", {
    cwd: repoRoot,
    stdio: "inherit",
  });
  console.log("   ✅ Typecheck passed cleanly.\n");
} catch (error) {
  console.error("❌ TypeScript typecheck failed.");
  process.exit(1);
}

// --- Step 3: Fast ECC Vitest Regression Suite ---
console.log("3️⃣  Running ECC Vitest test suite (pnpm test:ecc)...");
try {
  execSync("pnpm test:ecc", {
    cwd: repoRoot,
    stdio: "inherit",
  });
  console.log("   ✅ All ECC test suites passed with 100% success rate.\n");
} catch (error) {
  console.error("❌ Vitest test execution failed.");
  process.exit(1);
}

console.log("🎉 [ECC Security Gate] Pre-commit validation PASSED! Ready to commit.");
process.exit(0);
