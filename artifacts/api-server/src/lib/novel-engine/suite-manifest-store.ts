import { db, bookSuiteManifestsTable, chatMessagesTable, engineKvSnapshotsTable } from "@workspace/db";
import { and, eq, asc } from "drizzle-orm";
import { logger } from "../logger";

export type SuiteModuleType =
  | "chrono_braider"
  | "plot_divergence"
  | "lore_wiki"
  | "book_jacket"
  | "cip_barcode"
  | "story_bible"
  | "story_graphs"
  | "foreshadowing"
  | "multiverse"
  | "room_blocking"
  | "soundscape"
  | "voice_casting"
  | "booktok"
  | "phoneme_tuner"
  | "short_fiction"
  | "tabletop"
  | "style_dna";

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

export async function persistEngineSnapshot(
  namespace: string,
  entityId: string,
  payload: unknown,
  userId = "system",
): Promise<void> {
  try {
    await db
      .insert(engineKvSnapshotsTable)
      .values({
        namespace,
        entityId,
        userId,
        payload: (payload as Record<string, unknown>) || {},
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [engineKvSnapshotsTable.namespace, engineKvSnapshotsTable.entityId],
        set: {
          payload: (payload as Record<string, unknown>) || {},
          updatedAt: new Date(),
        },
      });
  } catch (err: any) {
    logger.debug({ namespace, entityId, err: err?.message }, "[SuiteManifestStore] Engine KV snapshot sync skipped");
  }
}

export async function loadEngineSnapshot<T>(
  namespace: string,
  entityId: string,
): Promise<T | null> {
  try {
    const [row] = await db
      .select()
      .from(engineKvSnapshotsTable)
      .where(
        and(
          eq(engineKvSnapshotsTable.namespace, namespace),
          eq(engineKvSnapshotsTable.entityId, entityId),
        ),
      )
      .limit(1);
    return (row?.payload as T) ?? null;
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
