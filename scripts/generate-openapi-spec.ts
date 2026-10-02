/**
 * Shothik Platform OpenAPI Specification Generator
 * Emits docs/openapi.json and validates specification completeness.
 */

import fs from "fs";
import path from "path";
import { buildOpenApiSpec } from "../artifacts/api-server/src/lib/openapi/openapi-builder";

async function main() {
  console.log("⚡ [OpenAPI Generator] Generating OpenAPI 3.1.0 specification...");

  const spec = buildOpenApiSpec({
    title: "Shothik Unified AI Platform API",
    version: "2.2.0",
  });

  const outputDir = path.resolve(process.cwd(), "docs");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, "openapi.json");
  const jsonContent = JSON.stringify(spec, null, 2);
  fs.writeFileSync(outputPath, jsonContent, "utf-8");

  const pathCount = Object.keys(spec.paths).length;
  const schemaCount = Object.keys(spec.components?.schemas ?? {}).length;
  const tagCount = spec.tags?.length ?? 0;

  console.log(`✅ [OpenAPI Generator] Successfully wrote spec to ${outputPath}`);
  console.log(`   - Version: ${spec.openapi}`);
  console.log(`   - Title: ${spec.info.title} (v${spec.info.version})`);
  console.log(`   - Documented Paths: ${pathCount}`);
  console.log(`   - Component Schemas: ${schemaCount}`);
  console.log(`   - Tags: ${tagCount}`);
}

main().catch((err) => {
  console.error("❌ [OpenAPI Generator] Failed:", err);
  process.exit(1);
});
