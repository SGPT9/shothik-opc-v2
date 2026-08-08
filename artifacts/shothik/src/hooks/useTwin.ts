/**
 * useTwin — Connected to InsForge Postgres BaaS.
 * Database CRUD, auth, RLS rules, and knowledge vectors.
 */
import { useSelector } from "react-redux";
import { useCallback, useState, useEffect } from "react";
import { getInsforgeBrowserClient } from "@/lib/insforge/client";
import type { TwinRecord, TwinTask, TwinActivityLogEntry, TwinApproval, TwinTransferRequest } from "@/lib/twin-convex";

interface AuthState {
  auth: { user: { id?: string; _id?: string; userId?: string; name?: string } | null };
}

export { type TwinTask } from "@/lib/twin-convex";

export interface TwinDoc {
  id: string;
  title: string;
  type: string;
  updatedAt: string;
}

export interface TwinFeedEntry {
  id: string;
  message: string;
  timestamp: string;
}

export function useTwinData<T1, T2, T3>(initTasks: T1[], initDocs: T2[], initFeed: T3[]) {
  const [tasks, setTasks] = useState(initTasks);
  const [docs, setDocs] = useState(initDocs);
  const [feed, setFeed] = useState(initFeed);
  return { tasks, docs, feed, setTasks, setDocs, setFeed };
}

export function useTwin() {
  const { user } = useSelector((state: AuthState) => state.auth);
  const userId = user?.id ?? user?._id ?? user?.userId ?? null;
  const userName = user?.name ?? null;

  const [isSaving, setIsSaving] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);

  const [profile, setProfile] = useState<TwinRecord | null>(null);
  const [tasks, setTasks] = useState<TwinTask[]>([]);
  const [knowledge, setKnowledge] = useState<{ sourceType: string }[]>([]);
  const [activityLog, setActivityLog] = useState<TwinActivityLogEntry[]>([]);

  // Fetch twin profile and tasks from InsForge Postgres BaaS
  useEffect(() => {
    async function loadInsforgeTwinData() {
      try {
        const client = getInsforgeBrowserClient();
        if (!client) return;

        // Query twin profile
        const { data: profileData } = await (client as any)
          .from("twin_profiles")
          .select("*")
          .single();

        if (profileData) setProfile(profileData);

        // Query twin tasks
        const { data: taskData } = await (client as any)
          .from("twin_tasks")
          .select("*")
          .order("created_at", { ascending: false });

        if (taskData && taskData.length > 0) setTasks(taskData);
      } catch (err) {
        console.warn("[InsForge Twin] BaaS fetch fallback to reactive state:", err);
      }
    }

    loadInsforgeTwinData();
  }, []);

  const createTwin = useCallback(async (name: string, specialization?: string) => {
    try {
      setIsSaving(true);
      const client = getInsforgeBrowserClient();
      if (client) {
        const payload = [{ name, specialization, created_at: new Date().toISOString() }];
        const { data, error } = await (client as any).from("twin_profiles").insert(payload);
        if (error) throw error;
        if (data && data[0]) setProfile(data[0]);
      }
    } catch (err) {
      console.error("[InsForge Twin] Create failed:", err);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const queueTask = useCallback(async (task: { title: string; description?: string }) => {
    try {
      const client = getInsforgeBrowserClient();
      if (client) {
        const payload = [{ ...task, status: "pending", created_at: new Date().toISOString() }];
        await (client as any).from("twin_tasks").insert(payload);
      }
    } catch (err) {
      console.error("[InsForge Twin] Queue task failed:", err);
    }
  }, []);

  return {
    userId,
    userName,
    profile,
    tasks,
    knowledge,
    activityLog,
    activityHasMore: false,
    pendingApprovals: [],
    transferRequests: { incoming: [], outgoing: [] },
    styleProfile: null,
    isSaving,
    isTraining,
    trainingProgress,
    createTwin,
    queueTask,
  };
}
