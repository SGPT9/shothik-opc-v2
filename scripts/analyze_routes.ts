import fs from "fs";
import path from "path";

interface RouteInfo {
  file: string;
  method: string;
  paths: string[];
  line: number;
  hasAuth: boolean;
  hasIdempotency: boolean;
  hasValidation: boolean;
  isStreaming: boolean;
}

const routesDir = "c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/routes";
const files = fs.readdirSync(routesDir).filter((f) => f.endsWith(".ts") && !f.includes(".test."));

const results: RouteInfo[] = [];

for (const file of files) {
  const filePath = path.join(routesDir, file);
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match router.get, router.post, router.put, router.delete, router.patch
    const match = line.match(/router\.(get|post|put|delete|patch)\s*\(\s*(\[[^\]]+\]|"[^"]+"|\'[^']+\')/);
    if (match) {
      const method = match[1].toUpperCase();
      let rawPath = match[2];
      let paths: string[] = [];

      if (rawPath.startsWith("[")) {
        try {
          paths = eval(rawPath);
        } catch {
          paths = [rawPath];
        }
      } else {
        paths = [rawPath.slice(1, -1)];
      }

      // Check following 30 lines for auth, idempotency, streaming, zod validation
      const window = lines.slice(i, i + 30).join("\n");
      const hasAuth = /auth|x-user-id|authenticate|jwt|bearer/i.test(window);
      const hasIdempotency = /idempotency/i.test(window);
      const hasValidation = /parse|safeParse|z\.|schema|validate/i.test(window);
      const isStreaming = /text\/event-stream|sse|res\.write/i.test(window);

      results.push({
        file,
        method,
        paths,
        line: i + 1,
        hasAuth,
        hasIdempotency,
        hasValidation,
        isStreaming,
      });
    }
  }
}

console.log(JSON.stringify(results, null, 2));
fs.writeFileSync("c:/Users/USER/hermes/shothik-web-mirror-v2/.data/route_audit.json", JSON.stringify(results, null, 2));
console.log(`Audited ${results.length} route definitions across ${files.length} files.`);
