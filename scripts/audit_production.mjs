// Node 24 native fetch

async function runAudit() {
  const baseUrl = 'https://shothik-web-mirror-v2.vercel.app';
  console.log('=== AUDITING PRODUCTION DEPLOYMENT: ' + baseUrl + ' ===\n');

  // 1. Check Root HTML & Headers
  const start = Date.now();
  const res = await fetch(baseUrl);
  const latency = Date.now() - start;
  console.log('[1] Root Status:', res.status, res.statusText, '(' + latency + 'ms)');
  console.log('    Content-Type:', res.headers.get('content-type'));
  console.log('    Server:', res.headers.get('server'), '| Vercel ID:', res.headers.get('x-vercel-id'));
  console.log('    Cache-Control:', res.headers.get('cache-control'));
  console.log('    Content-Encoding:', res.headers.get('content-encoding'));
  console.log('    Strict-Transport-Security:', res.headers.get('strict-transport-security'));
  console.log('    X-Content-Type-Options:', res.headers.get('x-content-type-options'));
  
  const html = await res.text();
  const jsMatch = html.match(/src="([^"]+\.js)"/);
  const cssMatch = html.match(/href="([^"]+\.css)"/);
  
  console.log('\n[2] Asset Checks:');
  if (jsMatch) {
    const jsUrl = baseUrl + jsMatch[1];
    const jsRes = await fetch(jsUrl);
    console.log('    Main JS Bundle:', jsMatch[1]);
    console.log('    Status:', jsRes.status, '| Content-Length:', jsRes.headers.get('content-length'), '| Cache:', jsRes.headers.get('cache-control'));
  }
  if (cssMatch) {
    const cssUrl = baseUrl + cssMatch[1];
    const cssRes = await fetch(cssUrl);
    console.log('    Main CSS Bundle:', cssMatch[1]);
    console.log('    Status:', cssRes.status, '| Content-Length:', cssRes.headers.get('content-length'), '| Cache:', cssRes.headers.get('cache-control'));
  }

  // Check Favicon
  const favRes = await fetch(baseUrl + '/favicon.svg');
  console.log('    Favicon (/favicon.svg):', favRes.status, '| Type:', favRes.headers.get('content-type'));

  // 3. Check SPA Route Rewrites
  const routes = [
    '/agents/chat',
    '/paraphrase',
    '/grammar-checker',
    '/ai-detector',
    '/summarize',
    '/translator',
    '/plagiarism-checker',
    '/writing-studio',
    '/deep-research',
    '/canvas',
    '/hermes',
    '/explore',
    '/pricing',
    '/settings'
  ];

  console.log('\n[3] SPA Client-Side Route Rewrites:');
  for (const r of routes) {
    const rRes = await fetch(baseUrl + r);
    const isHtml = (rRes.headers.get('content-type') || '').includes('text/html');
    console.log('    Route ' + r.padEnd(22) + ' Status: ' + rRes.status + ' | Serves HTML: ' + isHtml);
  }

  // 4. Check Reverse Proxy Rewrites
  console.log('\n[4] API / Proxy Rewrites:');
  try {
    const apiRes = await fetch(baseUrl + '/api/version');
    console.log('    /api/version Status:', apiRes.status, 'Content-Type:', apiRes.headers.get('content-type'));
  } catch (err) {
    console.log('    /api/version error:', err.message);
  }

  console.log('\nProduction network verification complete.');
}

runAudit().catch(console.error);
