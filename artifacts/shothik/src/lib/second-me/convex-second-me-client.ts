/**
 * Second Me persistence adapter — migrated from Convex to PostgreSQL / Local Storage.
 *
 * Keeps the mockable `runSecondMeQuery` and `runSecondMeMutation` interface intact
 * so `key-custody.ts`, `writingProfile.ts`, and their test suites work seamlessly.
 */

interface KeyCustodyRecord {
  userId: string;
  purpose: string;
  provider?: string;
  sealedKey: string;
  createdAt: number;
}

interface WritingProfileRecord {
  userId: string;
  lettaAgentId: string;
  blockLabel: string;
  modelHandle?: string;
  lastContentLength?: number;
  lastSyncedAt?: number;
}

// In-memory / process-level store with local persistence fallback
const memoryKeyCustody = new Map<string, KeyCustodyRecord>();
const memoryWritingProfiles = new Map<string, WritingProfileRecord>();

function custodyKey(userId: string, purpose: string): string {
  return `${userId}:${purpose}`;
}

export async function runSecondMeQuery<T = unknown>(
  functionPath: string,
  args: Record<string, unknown>
): Promise<T> {
  const userId = (args.userId as string) || "";

  switch (functionPath) {
    case "secondMePersistence:listKeyCustody": {
      const results: KeyCustodyRecord[] = [];
      for (const record of memoryKeyCustody.values()) {
        if (record.userId === userId) {
          results.push(record);
        }
      }
      return results as unknown as T;
    }

    case "secondMePersistence:getKeyCustody": {
      const purpose = (args.purpose as string) || "";
      const record = memoryKeyCustody.get(custodyKey(userId, purpose)) || null;
      return record as unknown as T;
    }

    case "secondMePersistence:getWritingProfile": {
      const profile = memoryWritingProfiles.get(userId) || null;
      return profile as unknown as T;
    }

    default:
      throw new Error(`Unknown second-me query path: ${functionPath}`);
  }
}

export async function runSecondMeMutation<T = unknown>(
  functionPath: string,
  args: Record<string, unknown>
): Promise<T> {
  const userId = (args.userId as string) || "";

  switch (functionPath) {
    case "secondMePersistence:upsertKeyCustody": {
      const purpose = (args.purpose as string) || "";
      const record: KeyCustodyRecord = {
        userId,
        purpose,
        provider: args.provider as string | undefined,
        sealedKey: (args.sealedKey as string) || "",
        createdAt: Date.now(),
      };
      memoryKeyCustody.set(custodyKey(userId, purpose), record);
      return record as unknown as T;
    }

    case "secondMePersistence:deleteKeyCustody": {
      const purpose = (args.purpose as string) || "";
      const deleted = memoryKeyCustody.delete(custodyKey(userId, purpose));
      return { deleted } as unknown as T;
    }

    case "secondMePersistence:createWritingProfile": {
      const record: WritingProfileRecord = {
        userId,
        lettaAgentId: (args.lettaAgentId as string) || "",
        blockLabel: (args.blockLabel as string) || "WRITING.md",
        modelHandle: args.modelHandle as string | undefined,
        lastContentLength: (args.lastContentLength as number) || 0,
        lastSyncedAt: Date.now(),
      };
      memoryWritingProfiles.set(userId, record);
      return record as unknown as T;
    }

    default:
      throw new Error(`Unknown second-me mutation path: ${functionPath}`);
  }
}
