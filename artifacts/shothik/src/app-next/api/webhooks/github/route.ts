import { NextRequest } from "next/server";
import { isGithubAutoSyncEnabled } from "@/lib/config/system-governance";
import { generateOpenWikiMemory } from "@/lib/hermes/openwiki-service";

export async function POST(request: NextRequest) {
  try {
    const autoSyncEnabled = isGithubAutoSyncEnabled();
    if (!autoSyncEnabled) {
      return Response.json(
        { message: "GitHub Auto-Sync for OpenWiki is currently disabled by governance rules.", reindexed: false },
        { status: 200 }
      );
    }

    const payload = await request.json().catch(() => ({}));
    const repoName = payload?.repository?.full_name || "GitHub Repository";
    const ref = payload?.ref || "refs/heads/main";
    const commits = payload?.commits || [];

    const notes = commits.map(
      (c: any) => `Commit ${c.id?.substring(0, 7) || ""}: ${c.message || "Update"}`
    );

    const topic = `Repository Update: ${repoName} (${ref})`;
    const wiki = await generateOpenWikiMemory(topic, notes.length > 0 ? notes : ["GitHub Push Event Triggered Auto-Sync"]);

    return Response.json({
      success: true,
      reindexed: true,
      data: wiki,
      meta: { repoName, ref, commitCount: commits.length },
    });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "Failed to process GitHub Auto-Sync OpenWiki trigger" },
      { status: 500 }
    );
  }
}
