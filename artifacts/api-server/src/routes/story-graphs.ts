import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";
import { db, projectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export const storyGraphsRouter = Router();

export interface StoryNode {
  id: string;
  title: string;
  type: "start" | "normal" | "branch" | "merge" | "ending" | "explore";
  sceneDesc: string;
  dialogue: Array<{ speaker: string; text: string; emotion?: string }>;
  choices: Array<{
    id: string;
    text: string;
    targetNodeId: string;
    condition?: { var: string; op: string; value: any };
    effects?: Array<{ var: string; op: string; value: any }>;
  }>;
  position?: { x: number; y: number };
}

export interface StoryGraph {
  projectId: string;
  title: string;
  variables: Array<{ name: string; type: string; default: any; desc: string }>;
  endings: Array<{ id: string; nodeId: string; title: string; type: string; description: string }>;
  nodes: StoryNode[];
}

const activeGraphs = new Map<string, StoryGraph>();

function generateMockGraph(projectId: string, projectTitle: string): StoryGraph {
  return {
    projectId,
    title: projectTitle || "The Silent Witness: Interactive Narrative",
    variables: [
      { name: "trust_syndicate", type: "number", default: 50, desc: "Trust score with University Syndicate" },
      { name: "has_master_plate", type: "boolean", default: false, desc: "Possession of the 1952 printing plate" },
      { name: "censor_suspicion", type: "number", default: 10, desc: "Suspicion level of state censors" }
    ],
    endings: [
      { id: "end-1", nodeId: "node-ending-martyr", title: "The Martyr's Memorial", type: "bittersweet", description: "The unredacted manuscript reaches millions while Rahman stands trial." },
      { id: "end-2", nodeId: "node-ending-triumph", title: "The Midnight Press Triumph", type: "victorious", description: "All 5,000 underground copies are distributed before dawn across Sadarghat." }
    ],
    nodes: [
      {
        id: "node-start",
        title: "Act I: Midnight in Curzon Hall",
        type: "start",
        sceneDesc: "Heavy monsoon rain strikes the red brick arches of Curzon Hall. Inside the archives, an ancient iron chest sits half-unlocked.",
        dialogue: [
          { speaker: "Professor Rahman", text: "The watermark doesn't lie, Elena. This isn't just an essay—it's the original testimony.", emotion: "urgent" },
          { speaker: "Dr. Elena Vance", text: "If we touch that seal, the Ministry's automated sirens will trigger in four minutes.", emotion: "cautious" }
        ],
        choices: [
          {
            id: "choice-1",
            text: "Break the lead seal immediately and extract the 1952 master printing plate",
            targetNodeId: "node-break-seal",
            effects: [
              { var: "has_master_plate", op: "set", value: true },
              { var: "censor_suspicion", op: "add", value: 30 }
            ]
          },
          {
            id: "choice-2",
            text: "Photograph the cipher key through the display glass and retreat quietly",
            targetNodeId: "node-photograph-glass",
            effects: [
              { var: "trust_syndicate", op: "add", value: 15 }
            ]
          }
        ],
        position: { x: 100, y: 150 }
      },
      {
        id: "node-break-seal",
        title: "Act II-A: The Cold Siren Alarm",
        type: "branch",
        sceneDesc: "The seal snaps with a brittle ring. Flashing amber beacons illuminate the courtyard. Footsteps echo from the eastern colonnade.",
        dialogue: [
          { speaker: "Elena Vance", text: "We have two minutes! Down to the old heating tunnels or out across the physics lawn?", emotion: "panicked" }
        ],
        choices: [
          {
            id: "choice-2a",
            text: "Dash through the underground steam tunnels toward the Buriganga ferry wharf",
            targetNodeId: "node-ending-triumph",
            effects: [
              { var: "censor_suspicion", op: "add", value: 20 }
            ]
          },
          {
            id: "choice-2b",
            text: "Rahman stays behind to delay the guards while Elena escapes with the plate",
            targetNodeId: "node-ending-martyr",
            effects: [
              { var: "trust_syndicate", op: "set", value: 100 }
            ]
          }
        ],
        position: { x: 380, y: 80 }
      },
      {
        id: "node-photograph-glass",
        title: "Act II-B: The Silent Decryption",
        type: "branch",
        sceneDesc: "A safe retreat into the dimly lit tea stall outside Nilkhet. Rain streams down the plastic tarpaulin as the photographs render.",
        dialogue: [
          { speaker: "Marcus Sterling", text: "The glass distorted the third cipher row, but the watermark sequence is intact.", emotion: "relieved" }
        ],
        choices: [
          {
            id: "choice-3a",
            text: "Rush to the midnight printing press with partial cipher keys",
            targetNodeId: "node-ending-triumph"
          }
        ],
        position: { x: 380, y: 240 }
      },
      {
        id: "node-ending-triumph",
        title: "Finale: The Midnight Press Triumph",
        type: "ending",
        sceneDesc: "By 4:30 AM, the offset lithographs thunder beneath the Sadarghat warehouses. Five thousand copies of the true Language Movement testimony hit the morning stalls.",
        dialogue: [
          { speaker: "Publisher Chief", text: "Every vendor in Dhaka has a copy. The censors can't burn dawn.", emotion: "proud" }
        ],
        choices: [],
        position: { x: 680, y: 80 }
      },
      {
        id: "node-ending-martyr",
        title: "Finale: The Martyr's Legacy",
        type: "ending",
        sceneDesc: "Professor Rahman stands calm behind police cordons while the international press flashes outside. In Paris and London, Elena broadcasts the decrypted manuscript online.",
        dialogue: [
          { speaker: "Professor Rahman", text: "Ideas do not accept handcuffs.", emotion: "serene" }
        ],
        choices: [],
        position: { x: 680, y: 240 }
      }
    ]
  };
}

function sanitizeId(id: string): string {
  const s = id.replace(/[^A-Za-z0-9_]/g, "_");
  return /^[0-9]/.test(s) ? `n_${s}` : s;
}

function compileToInk(graph: StoryGraph): string {
  const lines: string[] = [];
  lines.push(`// ${graph.title} — Compiled by Shothik Interactive Story Engine`);
  lines.push(`// Target: Inkle's Ink Narrative Script (Unity / Godot / Web)`);
  lines.push("");

  for (const v of graph.variables) {
    const val = typeof v.default === "string" ? JSON.stringify(v.default) : String(v.default);
    lines.push(`VAR ${sanitizeId(v.name)} = ${val}`);
  }
  lines.push("");

  const start = graph.nodes.find(n => n.type === "start") || graph.nodes[0];
  if (start) {
    lines.push(`-> node_${sanitizeId(start.id)}`);
    lines.push("");
  }

  for (const node of graph.nodes) {
    lines.push(`=== node_${sanitizeId(node.id)} ===`);
    if (node.title) lines.push(`# ${node.title}`);
    if (node.sceneDesc) lines.push(node.sceneDesc);
    for (const d of node.dialogue) {
      lines.push(`${d.speaker}: "${d.text}"`);
    }

    if (node.type === "ending" || node.choices.length === 0) {
      lines.push("-> END");
      lines.push("");
      continue;
    }

    for (const c of node.choices) {
      let condStr = "";
      if (c.condition) {
        condStr = ` {${sanitizeId(c.condition.var)} ${c.condition.op} ${c.condition.value}}`;
      }
      lines.push(`*${condStr} [${c.text}]`);
      for (const e of c.effects || []) {
        if (e.op === "add") lines.push(`    ~ ${sanitizeId(e.var)} += ${e.value}`);
        else if (e.op === "sub") lines.push(`    ~ ${sanitizeId(e.var)} -= ${e.value}`);
        else lines.push(`    ~ ${sanitizeId(e.var)} = ${e.value}`);
      }
      lines.push(`    -> node_${sanitizeId(c.targetNodeId)}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function compileToHtml(graph: StoryGraph): string {
  const graphJson = JSON.stringify(graph).replace(/</g, "\\u003c");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${graph.title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 24px; display: flex; justify-content: center; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; max-width: 680px; width: 100%; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    h1 { font-size: 20px; color: #a855f7; margin-top: 0; }
    .desc { font-size: 15px; line-height: 1.6; color: #cbd5e1; margin-bottom: 24px; }
    .dialogue { background: #0f172a; border-left: 3px solid #8b5cf6; padding: 12px 16px; margin: 12px 0; border-radius: 4px; font-size: 14px; }
    .speaker { font-weight: bold; color: #c084fc; margin-bottom: 4px; }
    .choices { display: flex; flex-direction: column; gap: 12px; margin-top: 28px; }
    button { background: #7c3aed; color: white; border: none; padding: 14px 20px; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; text-align: left; transition: all 0.2s; }
    button:hover { background: #9333ea; transform: translateY(-1px); }
    .restart { background: #334155; margin-top: 24px; text-align: center; }
    .status { font-size: 11px; font-family: monospace; color: #64748b; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="card" id="app"></div>
  <script>
    const graph = ${graphJson};
    let currentNodeId = graph.nodes.find(n => n.type === 'start')?.id || graph.nodes[0]?.id;
    let variables = {};
    graph.variables.forEach(v => variables[v.name] = v.default);

    function render() {
      const node = graph.nodes.find(n => n.id === currentNodeId);
      if (!node) return;
      const app = document.getElementById('app');
      let html = '<h1>' + node.title + '</h1>';
      if (node.sceneDesc) html += '<p class="desc">' + node.sceneDesc + '</p>';
      
      if (node.dialogue && node.dialogue.length > 0) {
        node.dialogue.forEach(d => {
          html += '<div class="dialogue"><div class="speaker">' + d.speaker + '</div><div>' + d.text + '</div></div>';
        });
      }

      if (node.type === 'ending' || !node.choices || node.choices.length === 0) {
        html += '<div style="color: #34d399; font-weight: bold; margin-top: 20px;">[FINALE REACHED]</div>';
        html += '<button class="restart" onclick="restart()">Restart Adventure</button>';
      } else {
        html += '<div class="choices">';
        node.choices.forEach(c => {
          html += '<button onclick="choose(\\'' + c.targetNodeId + '\\')">' + c.text + '</button>';
        });
        html += '</div>';
      }

      html += '<div class="status">Node ID: ' + node.id + ' | Shothik Interactive Story Engine</div>';
      app.innerHTML = html;
    }

    function choose(targetId) {
      currentNodeId = targetId;
      render();
    }

    function restart() {
      currentNodeId = graph.nodes.find(n => n.type === 'start')?.id || graph.nodes[0]?.id;
      render();
    }

    render();
  </script>
</body>
</html>`;
}

/**
 * GET /api/v1/projects/:id/story-graph
 * Retrieves interactive story graph DAG.
 */
storyGraphsRouter.get("/v1/projects/:id/story-graph", async (req: Request, res: Response) => {
  try {
    const projectId = String(req.params.id);
    let graph = activeGraphs.get(projectId);

    if (!graph) {
      let title = "The Silent Witness: Interactive Story";
      if (db) {
        try {
          const [proj] = await db.select().from(projectsTable).where(eq(projectsTable.id, projectId));
          if (proj?.title) title = proj.title;
        } catch {
          // ignore
        }
      }
      graph = generateMockGraph(projectId, title);
      activeGraphs.set(projectId, graph);
    }

    return res.json({
      success: true,
      data: graph
    });
  } catch (err: any) {
    logger.error(`[story-graph] Error retrieving graph: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/projects/:id/story-graph/delta
 * Applies node updates or mutations to the DAG.
 */
storyGraphsRouter.post("/v1/projects/:id/story-graph/delta", async (req: Request, res: Response) => {
  try {
    const projectId = String(req.params.id);
    const { delta } = req.body;

    let graph = activeGraphs.get(projectId);
    if (!graph) {
      graph = generateMockGraph(projectId, "Manuscript Story Graph");
      activeGraphs.set(projectId, graph);
    }

    if (delta?.nodes?.upsert && Array.isArray(delta.nodes.upsert)) {
      for (const node of delta.nodes.upsert) {
        const existingIdx = graph.nodes.findIndex(n => n.id === node.id);
        if (existingIdx >= 0) {
          graph.nodes[existingIdx] = { ...graph.nodes[existingIdx], ...node };
        } else {
          graph.nodes.push(node);
        }
      }
    }

    return res.json({
      success: true,
      message: "Story graph delta committed successfully",
      data: graph
    });
  } catch (err: any) {
    logger.error(`[story-graph] Error applying delta: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/projects/:id/story-graph/export/ink
 * Compiles story graph to Inkle .ink scripting language.
 */
storyGraphsRouter.get("/v1/projects/:id/story-graph/export/ink", async (req: Request, res: Response) => {
  try {
    const projectId = String(req.params.id);
    let graph = activeGraphs.get(projectId);
    if (!graph) {
      graph = generateMockGraph(projectId, "Interactive Narrative");
      activeGraphs.set(projectId, graph);
    }

    const inkText = compileToInk(graph);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${projectId}-story.ink"`);
    return res.send(inkText);
  } catch (err: any) {
    logger.error(`[story-graph] Error exporting Ink: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/projects/:id/story-graph/export/html
 * Compiles story graph to standalone playable HTML game bundle.
 */
storyGraphsRouter.get("/v1/projects/:id/story-graph/export/html", async (req: Request, res: Response) => {
  try {
    const projectId = String(req.params.id);
    let graph = activeGraphs.get(projectId);
    if (!graph) {
      graph = generateMockGraph(projectId, "Interactive Narrative");
      activeGraphs.set(projectId, graph);
    }

    const htmlBundle = compileToHtml(graph);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(htmlBundle);
  } catch (err: any) {
    logger.error(`[story-graph] Error exporting HTML: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});
