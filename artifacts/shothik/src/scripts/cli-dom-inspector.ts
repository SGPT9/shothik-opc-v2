import { JSDOM } from "jsdom";

async function runCliDomAudit() {
  console.log("🔍 [CLI DOM Inspector] Fetching live HTML from http://localhost:5001...");

  try {
    const res = await fetch("http://localhost:5001");
    const html = await res.text();

    const dom = new JSDOM(html);
    const document = dom.window.document;

    console.log("✅ [CLI DOM Inspector] HTML fetched successfully!");
    console.log(`📄 Page Title: "${document.title}"`);

    // Audit buttons and ARIA labels
    const buttons = document.querySelectorAll("button");
    console.log(`🔘 Interactive Buttons Count: ${buttons.length}`);

    // Audit input elements
    const inputs = document.querySelectorAll("input, textarea");
    console.log(`⌨️ Input / Textarea Elements Count: ${inputs.length}`);

    // Audit ARIA bindings
    const ariaLabels = document.querySelectorAll("[aria-label]");
    console.log(`🏷️ Elements with ARIA Labels: ${ariaLabels.length}`);

    console.log("\n📋 Sample ARIA Bindings:");
    ariaLabels.forEach((el, idx) => {
      if (idx < 5) {
        console.log(`  - [${el.tagName.toLowerCase()}] aria-label="${el.getAttribute("aria-label")}"`);
      }
    });

    console.log("\n✨ CLI DOM Audit Finished cleanly!");
  } catch (err: any) {
    console.error("❌ [CLI DOM Inspector Error]:", err.message);
  }
}

runCliDomAudit();
