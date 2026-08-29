import fs from 'fs';
import path from 'path';

const routesDir = path.resolve('artifacts/api-server/src/routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.ts') && !f.includes('.test.') && f !== 'index.ts');

export interface EndpointAudit {
  file: string;
  method: string;
  route: string;
  hasV1: boolean;
  hasIdempotency: boolean;
  hasZodValidation: boolean;
  hasErrorCatch: boolean;
  hasDeprecationNotice: boolean;
  envelopeConsistency: "standard_envelope" | "stream_or_raw" | "ad_hoc";
}

const audits: EndpointAudit[] = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(routesDir, file), 'utf-8');
  
  const routeRegex = /router\.(get|post|put|delete|patch)\s*\(\s*(\[[^\]]+\]|"[^"]+"|'[^']+')/g;
  let match;
  while ((match = routeRegex.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    let rawRoute = match[2];
    let routeList: string[] = [];
    if (rawRoute.startsWith('[')) {
      try {
        routeList = eval(rawRoute);
      } catch {
        routeList = [rawRoute];
      }
    } else {
      routeList = [rawRoute.replace(/['"]/g, '')];
    }
    
    const snippet = content.slice(match.index, match.index + 1200);
    const hasIdempotency = snippet.includes('idempotencyMiddleware');
    const hasZodValidation = snippet.includes('.safeParse(') || snippet.includes('.parse(') || snippet.includes('Schema');
    const hasErrorCatch = snippet.includes('try {') && snippet.includes('catch');
    const hasDeprecationNotice = snippet.includes('Sunset') || snippet.includes('Deprecated') || snippet.includes('RFC 8594');
    
    let envelopeConsistency: EndpointAudit["envelopeConsistency"] = "ad_hoc";
    if (snippet.includes('text/event-stream') || snippet.includes('res.write(') || snippet.includes('res.send(')) {
      envelopeConsistency = "stream_or_raw";
    } else if (snippet.includes('success: true') || snippet.includes('success: false') || snippet.includes('{ data:')) {
      envelopeConsistency = "standard_envelope";
    }

    for (const r of routeList) {
      audits.push({
        file,
        method,
        route: r,
        hasV1: r.startsWith('/v1/') || r.startsWith('/api/v1/'),
        hasIdempotency,
        hasZodValidation,
        hasErrorCatch,
        hasDeprecationNotice,
        envelopeConsistency,
      });
    }
  }
}

const v1Endpoints = audits.filter(a => a.hasV1);
const legacyEndpoints = audits.filter(a => !a.hasV1);
const mutatingEndpoints = audits.filter(a => a.method === 'POST' || a.method === 'PUT' || a.method === 'DELETE');
const idempotentMutations = mutatingEndpoints.filter(a => a.hasIdempotency);
const validatedEndpoints = audits.filter(a => a.hasZodValidation);
const standardEnvelopes = audits.filter(a => a.envelopeConsistency === 'standard_envelope');

console.log('=== SHOTHIK BACKEND ARCHITECTURAL AUDIT ===');
console.log(`Total Discovered Endpoints: ${audits.length}`);
console.log(`Canonical /v1/ Endpoints: ${v1Endpoints.length} (${Math.round((v1Endpoints.length / audits.length) * 100)}%)`);
console.log(`Legacy / Unversioned Endpoints: ${legacyEndpoints.length} (${Math.round((legacyEndpoints.length / audits.length) * 100)}%)`);
console.log(`Mutating Endpoints (POST/PUT/DELETE): ${mutatingEndpoints.length}`);
console.log(`Idempotency Guarded Mutations: ${idempotentMutations.length} (${Math.round((idempotentMutations.length / mutatingEndpoints.length) * 100)}%)`);
console.log(`Zod Schema Validated Endpoints: ${validatedEndpoints.length} (${Math.round((validatedEndpoints.length / audits.length) * 100)}%)`);
console.log(`Standard Envelope (success/data/error): ${standardEnvelopes.length} (${Math.round((standardEnvelopes.length / audits.length) * 100)}%)`);

console.log('\n--- BREAKDOWN BY DOMAIN FILE ---');
const byFile: Record<string, { total: number; v1: number; legacy: number; mutations: number; idempotent: number }> = {};
for (const a of audits) {
  if (!byFile[a.file]) {
    byFile[a.file] = { total: 0, v1: 0, legacy: 0, mutations: 0, idempotent: 0 };
  }
  byFile[a.file].total++;
  if (a.hasV1) byFile[a.file].v1++;
  else byFile[a.file].legacy++;
  if (['POST', 'PUT', 'DELETE'].includes(a.method)) {
    byFile[a.file].mutations++;
    if (a.hasIdempotency) byFile[a.file].idempotent++;
  }
}

console.table(byFile);

fs.writeFileSync('scripts/backend_audit_results.json', JSON.stringify(audits, null, 2));
console.log('\nSaved detailed audit to scripts/backend_audit_results.json');
