import fs from "fs";

const appPath = "c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/App.tsx";
const content = fs.readFileSync(appPath, "utf8");

const routeRegex = /<Route\s+path=["']([^"']+)["'](?:\s+component=\{([^}]+)\})?/g;
const clientRoutes: Array<{ path: string; component?: string; layout: string }> = [];

let match;
while ((match = routeRegex.exec(content)) !== null) {
  const p = match[1];
  const comp = match[2] || "Inline/Children";
  let layout = "Unwrapped";
  if (comp.includes("WithLayout") && comp.includes("Primary")) {
    layout = "PrimaryLayout (Sidebar + Shell)";
  } else if (comp.includes("WithLayout") && comp.includes("Secondary")) {
    layout = "SecondaryLayout (Public Topbar + Footer)";
  } else if (p.startsWith("/auth/")) {
    layout = "Auth (Clean Shell)";
  } else if (p.startsWith("/slide")) {
    layout = "Slide Layout";
  }

  clientRoutes.push({ path: p, component: comp, layout });
}

console.log(`Audited ${clientRoutes.length} frontend client routes.`);
fs.writeFileSync("c:/Users/USER/hermes/shothik-web-mirror-v2/.data/client_route_audit.json", JSON.stringify(clientRoutes, null, 2));
