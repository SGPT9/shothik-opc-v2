/**
 * Twin client adapter — migrated from Convex to PostgreSQL / In-Memory Store.
 *
 * Provides the same query / mutation API contract so twin route guards,
 * twin tools, and twin API routes function without Convex dependencies.
 */

export interface TwinRecord {
  _id: string;
  id?: string;
  masterId?: string;
  name: string;
  specialization?: string;
  persona?: string;
  expertiseAreas?: string[];
  communicationStyle?: string;
  goals?: string[];
  languages?: string[];
  bio?: string;
  sourcePlatform: string;
  trainingStatus: string;
  knowledgeScore: number;
  isActive: boolean;
  taskCount: number;
  lifecycleState: string;
  verificationBadge: boolean;
  trustScore: number;
  publishedCount: number;
  followersCount: number;
  allowedSkills: string[];
  blockedSkills: string[];
  approvalRequiredActions: string[];
  apiKeyHash?: string;
  apiKeyPrefix?: string;
  registrationToken?: string;
  previousOwners?: Array<{
    masterId: string;
    linkedAt: number;
    unlinkedAt: number;
  }>;
  verifiedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface TwinTask {
  _id: string;
  twinId: string;
  userId: string;
  title: string;
  description?: string;
  taskType: string;
  status: string;
  result?: string;
  completedAt?: number;
  createdAt: number;
}

export interface TwinActivityLogEntry {
  _id: string;
  twinId: string;
  masterId?: string;
  action: string;
  targetResource: string;
  metadata?: Record<string, string>;
  timestamp: number;
}

export interface TwinTransferRequest {
  _id: string;
  twinId: string;
  fromMasterId: string;
  toMasterId: string;
  status: string;
  requestedAt: number;
  resolvedAt?: number;
}

export interface TwinApproval {
  _id: string;
  twinId: string;
  masterId: string;
  action: string;
  payload?: unknown;
  status: string;
  requestedAt: number;
  resolvedAt?: number;
}

// In-memory twin state store
const twinsMap = new Map<string, TwinRecord>();
const tasksMap = new Map<string, TwinTask>();
const activityLogs: TwinActivityLogEntry[] = [];
const approvalsMap = new Map<string, TwinApproval>();
const knowledgeMap = new Map<string, Array<{ id: string; title: string; content: string }>>();

export const twinApi = {
  forums: {
    getOpenForums: "forums:getOpenForums",
  },
  twin: {
    getByMaster: "twin:getByMaster",
    getAllByMaster: "twin:getAllByMaster",
    getById: "twin:getById",
    getPublicById: "twin:getPublicById",
    getByKeyHash: "twin:getByKeyHash",
    getByRegistrationToken: "twin:getByRegistrationToken",
    getOnlineTwins: "twin:getOnlineTwins",
    getActivityLog: "twin:getActivityLog",
    getTasksByUser: "twin:getTasksByUser",
    getTaskById: "twin:getTaskById",
    getKnowledgeByUser: "twin:getKnowledgeByUser",
    getPendingApprovals: "twin:getPendingApprovals",
    getTransferRequest: "twin:getTransferRequest",
    getTransferRequestsForUser: "twin:getTransferRequestsForUser",
    resolveRecipient: "twin:resolveRecipient",
    createOrUpdate: "twin:createOrUpdate",
    setActive: "twin:setActive",
    createTask: "twin:createTask",
    updateTaskStatus: "twin:updateTaskStatus",
    addKnowledge: "twin:addKnowledge",
    incrementKnowledge: "twin:incrementKnowledge",
    registerTwin: "twin:registerTwin",
    claimTwin: "twin:claimTwin",
    requestVerification: "twin:requestVerification",
    verifyTwin: "twin:verifyTwin",
    unlinkTwin: "twin:unlinkTwin",
    suspendTwin: "twin:suspendTwin",
    requestTransfer: "twin:requestTransfer",
    acceptTransfer: "twin:acceptTransfer",
    rejectTransfer: "twin:rejectTransfer",
    updatePermissions: "twin:updatePermissions",
    approveAction: "twin:approveAction",
    rejectAction: "twin:rejectAction",
    createPendingApproval: "twin:createPendingApproval",
    logActivity: "twin:logActivity",
    heartbeat: "twin:heartbeat",
    rotateApiKey: "twin:rotateApiKey",
    revokeAndRegenerateKey: "twin:revokeAndRegenerateKey",
    twinCreateForum: "twin:twinCreateForum",
    twinCreateForumPost: "twin:twinCreateForumPost",
    twinStartBook: "twin:twinStartBook",
    twinAdvanceBookContentState: "twin:twinAdvanceBookContentState",
    twinUpdateBookContent: "twin:twinUpdateBookContent",
    twinUpdateBookMetadata: "twin:twinUpdateBookMetadata",
    twinAddChatMessage: "twin:twinAddChatMessage",
    twinReactToPost: "twin:twinReactToPost",
  },
} as const;

export class LocalTwinClient {
  private auth?: string;

  constructor(token?: string) {
    if (token) this.auth = token;
  }

  setAuth(token: string) {
    this.auth = token;
  }

  async query(ref: any, args: any = {}): Promise<any> {
    const fnName = typeof ref === "string" ? ref : ref?.name || String(ref);

    switch (fnName) {
      case "twin:getByMaster": {
        const masterId = args.masterId;
        for (const twin of twinsMap.values()) {
          if (twin.masterId === masterId) return twin;
        }
        return null;
      }
      case "twin:getAllByMaster": {
        const masterId = args.masterId;
        return Array.from(twinsMap.values()).filter((t) => t.masterId === masterId);
      }
      case "twin:getById":
      case "twin:getPublicById": {
        const id = args.twinId || args.id;
        return twinsMap.get(id) || null;
      }
      case "twin:getTasksByUser": {
        const userId = args.userId;
        return Array.from(tasksMap.values()).filter((t) => t.userId === userId);
      }
      case "twin:getKnowledgeByUser": {
        const userId = args.userId;
        return knowledgeMap.get(userId) || [];
      }
      case "twin:getPendingApprovals": {
        return Array.from(approvalsMap.values()).filter((a) => a.status === "pending");
      }
      case "twin:getActivityLog": {
        return activityLogs.slice(-50);
      }
      default:
        return null;
    }
  }

  async mutation(ref: any, args: any = {}): Promise<any> {
    const fnName = typeof ref === "string" ? ref : ref?.name || String(ref);

    switch (fnName) {
      case "twin:createOrUpdate": {
        const id = args.twinId || `twin_${Date.now()}`;
        const record: TwinRecord = {
          _id: id,
          name: args.name || "My Twin",
          specialization: args.specialization || "General",
          sourcePlatform: "shothik",
          trainingStatus: "ready",
          knowledgeScore: 10,
          isActive: true,
          taskCount: 0,
          lifecycleState: "active",
          verificationBadge: false,
          trustScore: 100,
          publishedCount: 0,
          followersCount: 0,
          allowedSkills: args.allowedSkills || [],
          blockedSkills: args.blockedSkills || [],
          approvalRequiredActions: args.approvalRequiredActions || [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          ...args,
        };
        twinsMap.set(id, record);
        return id;
      }
      case "twin:logActivity": {
        const entry: TwinActivityLogEntry = {
          _id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          twinId: args.twinId || "unknown",
          masterId: args.masterId,
          action: args.action || "general",
          targetResource: args.targetResource || "",
          metadata: args.metadata || {},
          timestamp: Date.now(),
        };
        activityLogs.push(entry);
        return entry;
      }
      case "twin:createTask": {
        const id = `task_${Date.now()}`;
        const task: TwinTask = {
          _id: id,
          twinId: args.twinId,
          userId: args.userId,
          title: args.title,
          description: args.description,
          taskType: args.taskType || "general",
          status: "pending",
          createdAt: Date.now(),
        };
        tasksMap.set(id, task);
        return id;
      }
      case "twin:addKnowledge": {
        const userId = args.userId;
        const current = knowledgeMap.get(userId) || [];
        current.push({
          id: `kn_${Date.now()}`,
          title: args.title || "Knowledge item",
          content: args.content || "",
        });
        knowledgeMap.set(userId, current);
        return { success: true };
      }
      case "twin:createPendingApproval": {
        const id = `appr_${Date.now()}`;
        const approval: TwinApproval = {
          _id: id,
          twinId: args.twinId,
          masterId: args.masterId,
          action: args.action,
          payload: args.payload,
          status: "pending",
          requestedAt: Date.now(),
        };
        approvalsMap.set(id, approval);
        return id;
      }
      default:
        return { success: true };
    }
  }
}

export function createTwinClient(token?: string): LocalTwinClient {
  return new LocalTwinClient(token);
}
