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

    this.catalogPath = foundCatalog || path.resolve(cwd, "../../reference-repos/AI-skills-for-networks/catalog.json");
    this.skillsRoot = foundSkillsRoot || path.resolve(cwd, "../../reference-repos/AI-skills-for-networks");
  }

  public static getInstance(): McpManager {
    if (!McpManager.instance) {
      McpManager.instance = new McpManager();
    }
    return McpManager.instance;
  }

  public async getCatalog(): Promise<SkillCatalog> {
    if (this.cachedCatalog) return this.cachedCatalog;

    try {
      const content = await fs.readFile(this.catalogPath, "utf-8");
      this.cachedCatalog = JSON.parse(content) as SkillCatalog;
      return this.cachedCatalog;
    } catch (err) {
      // Fallback catalog if file is missing
      return {
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
    const targetPath = path.resolve(this.skillsRoot, match.path, safeFile);

    try {
      const content = await fs.readFile(targetPath, "utf-8");
      return { id, file: safeFile, content };
    } catch {
      return null;
    }
  }
}
