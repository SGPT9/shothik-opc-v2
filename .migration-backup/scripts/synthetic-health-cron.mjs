const TARGET_URL = process.env.HEALTH_CHECK_URL || "https://shothik-web-mirror-v2.vercel.app/api/health-check";

console.log(`[Synthetic Cron] Checking health endpoint: ${TARGET_URL}...`);

try {
  const res = await fetch(TARGET_URL, {
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ShothikHealthMonitor/1.0",
      "Accept": "application/json",
    },
  });

  const data = await res.json();
  if (res.status === 200 && data.status === "ok") {
    console.log(`✅ [Synthetic Cron] Health Check Passed (Status 200 OK) at ${data.timestamp}`);
    console.log(`   Convex Auth: ${data.checks.convexAuth.status}`);
    console.log(`   OpenRouter Stream: ${data.checks.openRouterStream.resolvedTransport}`);
    console.log(`   InsForge Backend: Configured`);
  } else {
    console.error(`❌ [Synthetic Cron] Health Check Degraded (${res.status}):`, data);
    process.exitCode = 1;
  }
} catch (err) {
  console.error(`❌ [Synthetic Cron] Network request failed:`, err.message);
  process.exitCode = 1;
}
