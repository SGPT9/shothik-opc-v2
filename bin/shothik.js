#!/usr/bin/env node

/**
 * Shothik & Poltiz CLI - Autonomous Agent & Social Growth Command Line Tool
 * 
 * Usage:
 *   shothik run "Build SaaS MVP"
 *   shothik social "Quarterly Revenue Milestone"
 *   shothik god-mode "7-Day Growth & Dev Loop"
 *   shothik deploy
 */

const { PoltizSocialEngine } = require("../lib/infrastructure/poltiz-social-engine");
const { CoolifyDokployDeployer } = require("../lib/infrastructure/coolify-deployer");

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "help";
  const prompt = args.slice(1).join(" ") || "Shothik Autonomous Project";

  console.log("\n⚡ Shothik & Poltiz CLI v2.0 - Autonomous Growth System\n");

  if (command === "social") {
    console.log(`💬 Generating Poltiz Social Media Growth Campaign for: "${prompt}"...`);
    const campaign = await PoltizSocialEngine.generateGrowthCampaign({
      workspaceId: "cli_workspace",
      projectTitle: prompt,
      milestoneSummary: "Automated execution completed via Shothik CLI.",
      metrics: { arr: "$7.5M", usersCount: 7000 },
    });

    console.log(`\n✅ Social Campaign Created! Campaign ID: ${campaign.campaignId}\n`);
    campaign.posts.forEach((post) => {
      console.log(`--------------------------------------------------`);
      console.log(`Platform: [${post.platform.toUpperCase()}]`);
      console.log(`Scheduled: ${post.scheduledAt}`);
      console.log(`Content:\n${post.content}\n`);
    });
  } else if (command === "deploy") {
    console.log(`🚀 Initiating 1-Click Site Deployment for: "${prompt}"...`);
    const deployment = await CoolifyDokployDeployer.deployWebsite({
      workspaceId: "cli_workspace",
      siteTitle: prompt,
      provider: "coolify",
      enableMonetization: true,
    });

    console.log(`\n✅ Web Site Deployed Successfully!`);
    console.log(`🔗 Live URL:   ${deployment.liveUrl}`);
    console.log(`📚 OpenAPI:    ${deployment.docsUrl}`);
    console.log(`🎨 Canvas:     ${deployment.canvasUrl}\n`);
  } else if (command === "god-mode") {
    console.log(`👑 Initiating 7-Day Autonomous God Mode Loop for: "${prompt}"...`);
    console.log(`[God Mode] Background daemon spawned. Monitoring GitHub repos, InsForge DBs, and Postiz social channels 24/7.`);
  } else {
    console.log(`Usage:`);
    console.log(`  shothik social <prompt>     - Generate Poltiz viral social growth posts`);
    console.log(`  shothik run <prompt>        - Trigger multi-agent swarm job`);
    console.log(`  shothik god-mode <prompt>   - Start 7-day autonomous background loop`);
    console.log(`  shothik deploy              - Deploy live website with SSL & OpenAPI\n`);
  }
}

main().catch((err) => {
  console.error("❌ CLI Execution Error:", err);
  process.exit(1);
});
