import { db, bookSuiteManifestsTable, chatMessagesTable } from "@workspace/db";
import { and, eq, asc } from "drizzle-orm";
import { logger } from "../logger";

export type SuiteModuleType =
  | "chrono_braider"
  | "plot_divergence"
  | "lore_wiki"
  | "book_jacket"
  | "cip_barcode";

/**
 * Write-through Supabase PostgreSQL persistence for Writing Suite & Novel Engine modules.
 */
export async function persistSuiteManifest(
  projectId: string,
  moduleType: SuiteModuleType,
  state: unknown,
  userId = "usr_default",
): Promise<void> {
  try {
    await db
      .insert(bookSuiteManifestsTable)
      .values({
        projectId,
        userId,
        moduleType,
        state: (state as Record<string, unknown>) || {},
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [bookSuiteManifestsTable.projectId, bookSuiteManifestsTable.moduleType],
        set: {
          state: (state as Record<string, unknown>) || {},
          updatedAt: new Date(),
        },
      });
  } catch (err: any) {
    logger.debug(
      { projectId, moduleType, err: err?.message },
      "[SuiteManifestStore] Non-blocking DB sync skipped",
    );
  }
}

export async function loadSuiteManifest<T>(
  projectId: string,
  moduleType: SuiteModuleType,
): Promise<T | null> {
  try {
    const [row] = await db
      .select()
      .from(bookSuiteManifestsTable)
      .where(
        and(
          eq(bookSuiteManifestsTable.projectId, projectId),
          eq(bookSuiteManifestsTable.moduleType, moduleType),
        ),
      )
      .limit(1);
    return (row?.state as T) ?? null;
  } catch {
    return null;
  }
}

export async function persistCharacterThreadMessage(
  threadId: string,
  authorId: string,
  role: "author" | "character",
  content: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    await db.insert(chatMessagesTable).values({
      threadId,
      authorId,
      role,
      content,
      metadata,
    });
  } catch (err: any) {
    logger.debug({ threadId, err: err?.message }, "[SuiteManifestStore] Non-blocking chat message sync skipped");
  }
}

export async function loadCharacterThreadMessages(threadId: string) {
  try {
    return await db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.threadId, threadId))
      .orderBy(asc(chatMessagesTable.createdAt));
  } catch {
    return [];
  }
}
