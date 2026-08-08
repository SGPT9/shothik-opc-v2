export interface InsForgeRlsPolicy {
  tableName: string;
  policyName: string;
  definition: string;
  targetRole: string;
}

export const INSFORGE_RLS_POLICIES: InsForgeRlsPolicy[] = [
  {
    tableName: "twin_knowledge_vectors",
    policyName: "twin_vectors_user_isolation",
    definition: "USING (auth.uid() = twin_id)",
    targetRole: "authenticated",
  },
  {
    tableName: "story_bible_lore",
    policyName: "story_lore_user_isolation",
    definition: "USING (auth.uid() = user_id)",
    targetRole: "authenticated",
  },
  {
    tableName: "deerflow_checkpoints",
    policyName: "checkpoints_project_isolation",
    definition: "USING (auth.uid() = owner_id)",
    targetRole: "authenticated",
  },
];

export class InsForgeRlsManager {
  /**
   * Verify that a user ID has permission to access the target RLS resource.
   */
  static verifyAccess(resourceUserId: string, currentUserId: string | null): boolean {
    if (!currentUserId) return false;
    return resourceUserId === currentUserId;
  }
}
