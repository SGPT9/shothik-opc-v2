import { z } from "zod";

export const SwarmAgentRoleSchema = z.enum([
  "commander",
  "frontend_lead",
  "backend_lead",
  "researcher",
  "qa_red_team",
]);
export type SwarmAgentRole = z.infer<typeof SwarmAgentRoleSchema>;

export const LoomfeedTruthStatusSchema = z.enum([
  "consensus",
  "supported",
  "contested",
  "hypothesis",
]);
export type LoomfeedTruthStatus = z.infer<typeof LoomfeedTruthStatusSchema>;

export const EpistemicStampSchema = z.object({
  status: LoomfeedTruthStatusSchema,
  verifiedBy: z.string(),
  sourceCount: z.number().nonnegative(),
  confidence: z.number().min(0).max(1),
  timestamp: z.string(),
});
export type EpistemicStamp = z.infer<typeof EpistemicStampSchema>;

export const MuleMessageSchema = z.object({
  id: z.string(),
  sender: SwarmAgentRoleSchema,
  recipient: z.union([SwarmAgentRoleSchema, z.literal("broadcast")]),
  topic: z.string(),
  payload: z.record(z.any()),
  epistemicStamp: EpistemicStampSchema.optional(),
  timestamp: z.string(),
});
export type MuleMessage = z.infer<typeof MuleMessageSchema>;

export const DAGNodeStatusSchema = z.enum([
  "pending",
  "in_progress",
  "awaiting_approval",
  "completed",
  "failed",
  "blocked",
  "cancelled",
]);
export type DAGNodeStatus = z.infer<typeof DAGNodeStatusSchema>;

export const ApprovalOutcomeSchema = z.enum(["approved", "denied"]);
export type ApprovalOutcome = z.infer<typeof ApprovalOutcomeSchema>;

export const DAGNodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  assignedRole: SwarmAgentRoleSchema,
  dependencies: z.array(z.string()),
  status: DAGNodeStatusSchema,
  requiresApproval: z.boolean().optional(),
  checkpointId: z.string().optional(),
  approvalSummary: z.string().optional(),
  approvalReason: z.string().optional(),
  approvalDetails: z.string().optional(),
  approvalOutcome: ApprovalOutcomeSchema.optional(),
  context: z.record(z.any()).optional(),
  result: z.record(z.any()).optional(),
});
export type DAGNode = z.infer<typeof DAGNodeSchema>;

export const SwarmExecutionPlanSchema = z.object({
  planId: z.string(),
  goal: z.string(),
  nodes: z.array(DAGNodeSchema),
  budgetCredits: z.number().positive(),
  createdAt: z.string(),
});
export type SwarmExecutionPlan = z.infer<typeof SwarmExecutionPlanSchema>;

export const SwarmRunnerStateSchema = z.enum([
  "idle",
  "running",
  "paused",
  "waiting_approval",
  "completed",
  "cancelled",
  "failed",
]);
export type SwarmRunnerState = z.infer<typeof SwarmRunnerStateSchema>;

export interface CheckpointEvent {
  checkpointId: string;
  planId: string;
  nodeId: string;
  actionSummary: string;
  reason: string;
  details?: string;
  createdAt: string;
}

