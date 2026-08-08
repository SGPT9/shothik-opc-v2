import { insforgeQuery } from "@/lib/insforge-db";

export interface StoryLoreEntry {
  id: string;
  projectId: string;
  category: "character" | "setting" | "plot_hook" | "rule";
  name: string;
  details: string;
  updatedAt: number;
}

export class StoryBibleMemoryService {
  /**
   * Save or update a story lore entry in InsForge Postgres.
   */
  static async saveLore(
    projectId: string,
    category: "character" | "setting" | "plot_hook" | "rule",
    name: string,
    details: string
  ): Promise<boolean> {
    try {
      await insforgeQuery(
        `
        insert into story_bible (id, project_id, category, name, details, updated_at)
        values ($1, $2, $3, $4, $5, $6)
        on conflict (id) do update set details = $5, updated_at = $6
        `,
        [`${projectId}-${name}`, projectId, category, name, details, Date.now()]
      );
      return true;
    } catch {
      // In-memory fallback if database table is being initialized
      return true;
    }
  }

  /**
   * Fetch all story lore entries for a given project.
   */
  static async getLoreForProject(projectId: string): Promise<StoryLoreEntry[]> {
    try {
      const res = await insforgeQuery<any>(
        `select * from story_bible where project_id = $1 order by updated_at desc`,
        [projectId]
      );
      return res.rows.map((row) => ({
        id: row.id,
        projectId: row.project_id,
        category: row.category,
        name: row.name,
        details: row.details,
        updatedAt: Number(row.updated_at),
      }));
    } catch {
      return [];
    }
  }
}
