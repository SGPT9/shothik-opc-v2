/**
 * useTwin — stubbed for frontend-only mode.
 * When the backend is connected, replace this file with the original
 * from .migration-backup/hooks/useTwin.ts
 */
import { useSelector } from "react-redux";
import { useCallback, useState } from "react";
import type { TwinRecord, TwinTask, TwinActivityLogEntry, TwinApproval, TwinTransferRequest } from "@/lib/twin-convex";

interface AuthState {
  auth: { user: { id?: string; _id?: string; userId?: string; name?: string } | null };
}

export function useTwin() {
  const { user } = useSelector((state: AuthState) => state.auth);
  const userId = user?.id ?? user?._id ?? user?.userId ?? null;
  const userName = user?.name ?? null;

  const [isSaving, setIsSaving] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);

  const profile: TwinRecord | null = null;
  const tasks: TwinTask[] = [];
  const knowledge: { sourceType: string }[] = [];
  const activityLog: TwinActivityLogEntry[] = [];
  const activityHasMore = false;
  const pendingApprovals: TwinApproval[] = [];
  const transferRequests = { incoming: [] as TwinTransferRequest[], outgoing: [] as TwinTransferRequest[] };
  const styleProfile = null;

  const createTwin = useCallback(async (name: string, specialization?: string) => {
    console.log("[useTwin stub] createTwin called — backend not connected");
    return null;
  }, []);

  const updateProfile = useCallback(async (_data: Record<string, unknown>) => {
    console.log("[useTwin stub] updateProfile called — backend not connected");
  }, []);

  const updatePermissions = useCallback(async (_data: Record<string, unknown>) => {
    console.log("[useTwin stub] updatePermissions called — backend not connected");
  }, []);

  const trainNow = useCallback(async () => {
    console.log("[useTwin stub] trainNow called — backend not connected");
  }, []);

  const queueTask = useCallback(async (_task: { title: string; description?: string }) => {
    console.log("[useTwin stub] queueTask called — backend not connected");
  }, []);

  const toggleActive = useCallback(async () => {
    console.log("[useTwin stub] toggleActive called — backend not connected");
  }, []);

  const resolveApproval = useCallback(async (_approvalId: string, _approved: boolean) => {
    console.log("[useTwin stub] resolveApproval called — backend not connected");
  }, []);

  const initiateTransfer = useCallback(async (_recipientId: string) => {
    console.log("[useTwin stub] initiateTransfer called — backend not connected");
    return null;
  }, []);

  const acceptTransfer = useCallback(async (_requestId: string) => {
    console.log("[useTwin stub] acceptTransfer called — backend not connected");
  }, []);

  const rejectTransfer = useCallback(async (_requestId: string) => {
    console.log("[useTwin stub] rejectTransfer called — backend not connected");
  }, []);

  const resolveRecipient = useCallback(async (_identifier: string) => {
    console.log("[useTwin stub] resolveRecipient called — backend not connected");
    return null;
  }, []);

  const claimTwin = useCallback(async (_token: string) => {
    console.log("[useTwin stub] claimTwin called — backend not connected");
  }, []);

  const loadMoreActivity = useCallback(async () => {}, []);

  return {
    userId,
    userName,
    profile,
    tasks,
    knowledge,
    activityLog,
    activityHasMore,
    pendingApprovals,
    transferRequests,
    styleProfile,
    isSaving,
    isTraining,
    trainingProgress,
    createTwin,
    updateProfile,
    updatePermissions,
    trainNow,
    queueTask,
    toggleActive,
    resolveApproval,
    initiateTransfer,
    acceptTransfer,
    rejectTransfer,
    resolveRecipient,
    claimTwin,
    loadMoreActivity,
  };
}
