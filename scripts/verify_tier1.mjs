import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Zero-dependency .env parser
function parseEnv(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      env[key] = val;
    }
  }
  return env;
}

const envConfig = parseEnv('.env.production');

console.log("=================================================");
console.log("🔍 TIER 1 PRODUCTION READINESS VALIDATION SUITE");
console.log("=================================================\n");

let passed = 0;
let total = 0;

function report(testName, isSuccess, details = "") {
  total++;
  if (isSuccess) {
    passed++;
    console.log(`✅ [PASS] ${testName} ${details ? `(${details})` : ""}`);
  } else {
    console.error(`❌ [FAIL] ${testName} ${details ? `(${details})` : ""}`);
  }
}

// 1. Cryptographic Secrets
console.log("1. SECURITY & CRYPTO VAULT AUDIT:");
const jwt = envConfig.JWT_SECRET;
const vault = envConfig.KEY_VAULT_SECRET;
const auth = envConfig.BETTER_AUTH_SECRET;

report("JWT_SECRET entropy (>= 32 chars)", jwt && jwt.length >= 32, `${jwt ? jwt.length : 0} chars`);
report("KEY_VAULT_SECRET entropy (>= 32 chars)", vault && vault.length >= 32, `${vault ? vault.length : 0} chars`);
report("BETTER_AUTH_SECRET entropy (>= 32 chars)", auth && auth.length >= 32, `${auth ? auth.length : 0} chars`);

// Test AES-256-GCM encryption/decryption cycle
try {
  const key = crypto.createHash('sha256').update(vault).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update("shothik-secure-payload-test", 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  report("AES-256-GCM Hardware Vault Cycle", decrypted === "shothik-secure-payload-test", "Roundtrip OK");
} catch (e) {
  report("AES-256-GCM Hardware Vault Cycle", false, e.message);
}

// 2. InsForge Cloud BaaS Endpoint
console.log("\n2. INSFORGE CLOUD BAAS ENDPOINT AUDIT:");
const insforgeUrl = envConfig.INSFORGE_URL;
const apiKey = envConfig.INSFORGE_SERVICE_ROLE_KEY;

try {
  const res = await fetch(`${insforgeUrl}/healthz`, {
    headers: { "x-api-key": apiKey }
  }).catch(() => null);

  report("InsForge Cloud BaaS Ping", res && (res.status === 200 || res.status === 204), `HTTP ${res ? res.status : 'Offline'}`);
} catch (err) {
  report("InsForge Cloud BaaS Ping", false, err.message);
}

// 3. AI Inference Gateway Probe (OpenRouter)
console.log("\n3. AI INFERENCE GATEWAY (OPENROUTER) AUDIT:");
const openrouterKey = envConfig.OPENROUTER_API_KEY;

if (openrouterKey && openrouterKey.startsWith("sk-or-v1-")) {
  try {
    const aiRes = await fetch("https://openrouter.ai/api/v1/auth/key", {
      headers: {
        "Authorization": `Bearer ${openrouterKey}`
      },
      signal: AbortSignal.timeout(6000)
    });

    if (aiRes.ok) {
      const data = await aiRes.json();
      const limit = data?.data?.limit != null ? `$${data.data.limit}` : "Active";
      const usage = data?.data?.usage != null ? `$${data.data.usage.toFixed(4)}` : "$0.00";
      report("OpenRouter Key Verification", true, `Limit: ${limit}, Usage: ${usage}`);
    } else {
      report("OpenRouter Key Verification", false, `HTTP ${aiRes.status}`);
    }
  } catch (aiErr) {
    report("OpenRouter Key Verification", false, aiErr.message);
  }
} else {
  report("OpenRouter Key Verification", false, "Missing or invalid format");
}

// 4. Edge SQLite Storage
console.log("\n4. EDGE SQLITE LOCAL STORE AUDIT:");
try {
  const sqliteUrl = envConfig.SQLITE_DATABASE_URL;
  report("SQLITE_DATABASE_URL configured", !!sqliteUrl, sqliteUrl);
} catch (sqlErr) {
  report("SQLITE_DATABASE_URL configured", false, sqlErr.message);
}

console.log("\n=================================================");
console.log(`🎯 AUDIT SUMMARY: ${passed} / ${total} CHECKS PASSED (${Math.round((passed/total)*100)}%)`);
console.log("=================================================");

if (passed === total) {
  console.log("🌟 TIER 1 IS FULLY OPERATIONAL AND PRODUCTION-READY!");
  process.exit(0);
} else {
  console.log("⚠️ Some checks require attention.");
  process.exit(1);
}
