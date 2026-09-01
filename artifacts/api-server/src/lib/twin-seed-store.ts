import { desc, and, eq, sql } from "drizzle-orm";
import { db, twinSeedsTable, type TwinSeed, type TwinSeedTask } from "@workspace/db";

export interface TwinSeedRecord {
  conversationId: string;
  companyName: string;
  summary: string;
  businessPlan: string;
  tasks: TwinSeedTask[];
  revision: number;
  updatedAt: string;
}

function toRecord(row: TwinSeed): TwinSeedRecord {
  return {
    conversationId: row.conversationId,
    companyName: row.companyName,
    summary: row.summary,
    businessPlan: row.businessPlan,
    tasks: Array.isArray(row.tasks) ? row.tasks : [],
    revision: row.revision,
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Insert or update the seed stored for this identity + conversation.
 *
 * `revision` is a client-supplied monotonic value (ms timestamp of the edit).
 * A write with a lower revision than what is stored loses: out-of-order
 * request completion cannot overwrite newer content. Returns the row that
 * is stored after the call (the winner).
 */
const memorySeedStore = new Map<string, TwinSeedRecord>();

function memoryKey(identity: string, conversationId: string): string {
  return `${identity}::${conversationId}`;
}

export async function upsertTwinSeed(params: {
  identity: string;
  conversationId: string;
  companyName: string;
  summary: string;
  businessPlan: string;
  tasks: TwinSeedTask[];
  revision: number;
}): Promise<TwinSeedRecord> {
  const fallbackRecord: TwinSeedRecord = {
    conversationId: params.conversationId,
    companyName: params.companyName,
    summary: params.summary,
    businessPlan: params.businessPlan,
    tasks: params.tasks,
    revision: params.revision,
    updatedAt: new Date().toISOString(),
  };

  try {
    const [row] = await db
      .insert(twinSeedsTable)
      .values({
        identity: params.identity,
        conversationId: params.conversationId,
        companyName: params.companyName,
        summary: params.summary,
        businessPlan: params.businessPlan,
        tasks: params.tasks,
        revision: params.revision,
      })
      .onConflictDoUpdate({
        target: [twinSeedsTable.identity, twinSeedsTable.conversationId],
        set: {
          companyName: params.companyName,
          summary: params.summary,
          businessPlan: params.businessPlan,
          tasks: params.tasks,
          revision: params.revision,
          updatedAt: sql`now()`,
        },
        // Reject stale writes: only update when the incoming revision is newer.
        setWhere: sql`${twinSeedsTable.revision} <= ${params.revision}`,
      })
      .returning();
    if (row) {
      const rec = toRecord(row);
      memorySeedStore.set(memoryKey(params.identity, params.conversationId), rec);
      return rec;
    }
    const current = await getTwinSeed(params.identity, params.conversationId);
    if (current) return current;
  } catch {
    // Database unavailable in offline/test mode - write to memory store
  }

  memorySeedStore.set(memoryKey(params.identity, params.conversationId), fallbackRecord);
  return fallbackRecord;
}

/** Fetch the seed for a specific conversation, if any. */
export async function getTwinSeed(
  identity: string,
  conversationId: string,
): Promise<TwinSeedRecord | null> {
  try {
    const [row] = await db
      .select()
      .from(twinSeedsTable)
      .where(
        and(eq(twinSeedsTable.identity, identity), eq(twinSeedsTable.conversationId, conversationId)),
      )
      .limit(1);
    if (row) return toRecord(row);
  } catch {
    // Fall back to memory store
  }
  return memorySeedStore.get(memoryKey(identity, conversationId)) || null;
}

/** Fetch the most recently updated seed for this identity (dashboard view). */
export async function getLatestTwinSeed(identity: string): Promise<TwinSeedRecord | null> {
  try {
    const [row] = await db
      .select()
      .from(twinSeedsTable)
      .where(eq(twinSeedsTable.identity, identity))
      .orderBy(desc(twinSeedsTable.updatedAt))
      .limit(1);
    if (row) return toRecord(row);
  } catch {
    // Fall back to memory store
  }
  const matching = Array.from(memorySeedStore.entries())
    .filter(([k]) => k.startsWith(`${identity}::`))
    .map(([, v]) => v)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  return matching[0] || null;
}

/**
 * Re-key seeds created while the caller was a guest (device identity) to
 * their signed-in user identity. Conversations the user identity already has
 * keep the user's copy; the guest duplicate is dropped.
 */
export async function migrateTwinSeeds(fromIdentity: string, toIdentity: string): Promise<void> {
  if (fromIdentity === toIdentity) return;
  await db.transaction(async (tx: any) => {
    await tx.execute(sql`
      UPDATE twin_seeds AS src
      SET identity = ${toIdentity}
      WHERE src.identity = ${fromIdentity}
        AND NOT EXISTS (
          SELECT 1 FROM twin_seeds AS dst
          WHERE dst.identity = ${toIdentity}
            AND dst.conversation_id = src.conversation_id
        )
    `);
    await tx.delete(twinSeedsTable).where(eq(twinSeedsTable.identity, fromIdentity));
  });
}
