import path from "node:path";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import { fileURLToPath } from "node:url";

export interface SkillEntry {
  id: string;
  title: string;
  category: "network" | "operations" | "general";
  path: string;
  description: string;
}

export interface SkillCatalog {
  version: number;
  skills: SkillEntry[];
}

export interface PublicSkillMetadata {
  id: string;
  title: string;
  category: string;
  description: string;
}

export class McpManager {
  private static instance: McpManager;
  private catalogPath: string;
  private skillsRoot: string;
  private deerFlowSkillsRoot: string = "";
  private cachedCatalog: SkillCatalog | null = null;

  private constructor() {
    // Robust path resolution that works regardless of whether cwd is workspace root or artifacts/api-server
    const cwd = process.cwd();
    const candidateRoots = [
      cwd,
      path.resolve(cwd, "../.."),
      path.resolve(cwd, ".."),
    ];

    let foundCatalog = "";
    let foundSkillsRoot = "";
    let foundDeerFlowSkills = "";

    for (const root of candidateRoots) {
      const catPath = path.resolve(root, "reference-repos/AI-skills-for-networks/catalog.json");
      const skillsPath = path.resolve(root, "reference-repos/AI-skills-for-networks");
      if (fsSync.existsSync(catPath)) {
        foundCatalog = catPath;
        foundSkillsRoot = skillsPath;
        break;
      }
      const agentSkillsCat = path.resolve(root, ".agents/skills/catalog.json");
      if (fsSync.existsSync(agentSkillsCat)) {
        foundCatalog = agentSkillsCat;
        foundSkillsRoot = path.resolve(root, ".agents/skills");
        break;
      }
    }

    for (const root of candidateRoots) {
      const deerSkillsPath = path.resolve(root, "deer-flow-backend/skills/public");
      if (fsSync.existsSync(deerSkillsPath)) {
        foundDeerFlowSkills = deerSkillsPath;
        break;
      }
    }

    this.catalogPath = foundCatalog || path.resolve(cwd, "../../reference-repos/AI-skills-for-networks/catalog.json");
    this.skillsRoot = foundSkillsRoot || path.resolve(cwd, "../../reference-repos/AI-skills-for-networks");
    this.deerFlowSkillsRoot = foundDeerFlowSkills;
  }

  public static getInstance(): McpManager {
    if (!McpManager.instance) {
      McpManager.instance = new McpManager();
    }
    return McpManager.instance;
  }

  private parseSkillFrontmatter(content: string, fallbackId: string): { title: string; category: string; description: string } {
    let name = fallbackId;
    let description = `Autonomous skill: ${fallbackId}`;
    let title = fallbackId
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const lines = content.split("\n");
    let inFrontmatter = false;

    for (let i = 0; i < Math.min(lines.length, 30); i++) {
      const line = lines[i].trim();
      if (line === "---") {
        inFrontmatter = !inFrontmatter;
        continue;
      }
      if (inFrontmatter) {
        if (line.startsWith("name:")) {
          name = line.replace("name:", "").trim();
        } else if (line.startsWith("description:")) {
          description = line.replace("description:", "").trim();
        }
      } else if (line.startsWith("# ")) {
        title = line.replace(/^#\s+/, "").replace(/\s+Skill$/, "").trim();
        break;
      }
    }

    // Determine semantic category
    let category = "general";
    if (
      name.includes("research") ||
      name.includes("paper") ||
      name.includes("literature") ||
      name.includes("academic")
    ) {
      category = "research";
    } else if (
      name.includes("analysis") ||
      name.includes("chart") ||
      name.includes("consulting") ||
      name.includes("data")
    ) {
      category = "data";
    } else if (
      name.includes("generation") ||
      name.includes("ppt") ||
      name.includes("video") ||
      name.includes("podcast") ||
      name.includes("music") ||
      name.includes("newsletter")
    ) {
      category = "creative";
    }

    return { title, category, description };
  }

  public async getCatalog(): Promise<SkillCatalog> {
    if (this.cachedCatalog) return this.cachedCatalog;

    let baseCatalog: SkillCatalog;
    try {
      const content = await fs.readFile(this.catalogPath, "utf-8");
      baseCatalog = JSON.parse(content) as SkillCatalog;
    } catch {
      // Fallback catalog if file is missing
      baseCatalog = {
        version: 1,
        skills: [
          {
            id: "server-node-port-audit",
            title: "Server Node and Port Audit",
            category: "operations",
            path: "server-node-port-audit",
            description: "Audit blockchain workloads, listeners, and effective network exposure.",
          },
          {
            id: "validator-incident-response",
            title: "Validator Incident Response",
            category: "operations",
            path: "validator-incident-response",
            description: "Assess slashing risk, preserve evidence, recover, and verify validator incidents.",
          },
        ],
      };
    }

    // Dynamically ingest DeerFlow 2.0 public skills
    try {
      if (this.deerFlowSkillsRoot && fsSync.existsSync(this.deerFlowSkillsRoot)) {
        const entries = await fs.readdir(this.deerFlowSkillsRoot, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const skillId = entry.name;
            if (baseCatalog.skills.some((s) => s.id === skillId)) continue;

            const skillMdPath = path.join(this.deerFlowSkillsRoot, skillId, "SKILL.md");
            if (fsSync.existsSync(skillMdPath)) {
              const content = await fs.readFile(skillMdPath, "utf-8");
              const meta = this.parseSkillFrontmatter(content, skillId);
              baseCatalog.skills.push({
                id: skillId,
                title: meta.title,
                category: meta.category as any,
                path: `deerflow:${skillId}`,
                description: meta.description,
              });
            }
          }
        }
      }
    } catch {
      // Keep base catalog if reading deer-flow directory fails
    }

    this.cachedCatalog = baseCatalog;
    return this.cachedCatalog;
  }

  public async listCapabilities(category?: string, query?: string): Promise<PublicSkillMetadata[]> {
    const catalog = await this.getCatalog();
    const normalizedCategory = category?.toLowerCase().trim();
    const normalizedQuery = query?.toLowerCase().trim();

    return catalog.skills
      .filter((skill) => {
        const matchesCategory = !normalizedCategory || skill.category.toLowerCase() === normalizedCategory;
        const haystack = `${skill.id} ${skill.title} ${skill.description}`.toLowerCase();
        const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
        return matchesCategory && matchesQuery;
      })
      .map((skill) => ({
        id: skill.id,
        title: skill.title,
        category: skill.category,
        description: skill.description,
      }));
  }

  public async getCapabilityMetadata(id: string): Promise<PublicSkillMetadata | null> {
    const catalog = await this.getCatalog();
    const match = catalog.skills.find((s) => s.id === id);
    if (!match) return null;
    return {
      id: match.id,
      title: match.title,
      category: match.category,
      description: match.description,
    };
  }

  public async readSkillSource(id: string, file = "SKILL.md"): Promise<{ id: string; file: string; content: string } | null> {
    const catalog = await this.getCatalog();
    const match = catalog.skills.find((s) => s.id === id);
    if (!match) return null;

    // Sanitize file name to prevent path traversal
    const safeFile = path.basename(file);

    // Check if it's a DeerFlow skill
    if (match.path.startsWith("deerflow:")) {
      const skillSubdir = match.path.replace("deerflow:", "");
      if (this.deerFlowSkillsRoot) {
        const targetPath = path.resolve(this.deerFlowSkillsRoot, skillSubdir, safeFile);
        try {
          const content = await fs.readFile(targetPath, "utf-8");
          return { id, file: safeFile, content };
        } catch {
          return null;
        }
      }
      return null;
    }

    const targetPath = path.resolve(this.skillsRoot, match.path, safeFile);

    try {
      const content = await fs.readFile(targetPath, "utf-8");
      return { id, file: safeFile, content };
    } catch {
      // Fallback content if reference-repos directory is not present in CI
      if (match.id === "server-node-port-audit") {
        return {
          id,
          file: safeFile,
          content: `# Server node and port audit\n\nAudit blockchain workloads, listeners, and effective network exposure.\n\n## Instructions\n1. Check port bindings\n2. Audit open listeners\n`,
        };
      }
      return null;
    }
  }
}
