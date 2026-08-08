import { useState, useEffect, useCallback } from "react";
import { getInsforgeBrowserClient } from "@/lib/insforge/client";
import type { TaskItem } from "@/app-next/(primary-layout)/twin/types";

export function useInsforgeTasks(companyId: string = "comp_verifiq") {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks from InsForge BaaS or local fallback
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const client = getInsforgeBrowserClient();
      if (!client) {
        setLoading(false);
        return;
      }

      const { data, error: dbError } = await (client as any)
        .from("opc_tasks")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (dbError) throw dbError;

      if (data && data.length > 0) {
        setTasks(data);
      }
    } catch (err: unknown) {
      console.warn("[InsForge Tasks] DB fetch error or missing table, using reactive state:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create new task in InsForge BaaS (array payload format)
  const addTask = useCallback(
    async (task: Omit<TaskItem, "id">) => {
      const newTask: TaskItem = {
        ...task,
        id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      };

      setTasks((prev) => [newTask, ...prev]);

      try {
        const client = getInsforgeBrowserClient();
        if (client) {
          const { error: dbError } = await (client as any)
            .from("opc_tasks")
            .insert([{ ...newTask, company_id: companyId }]);
          if (dbError) console.error("[InsForge Tasks] Insert error:", dbError);
        }
      } catch (err) {
        console.error("[InsForge Tasks] Add task failed:", err);
      }
    },
    [companyId]
  );

  // Update task status in InsForge BaaS
  const updateStatus = useCallback(
    async (taskId: string, status: TaskItem["status"]) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status } : t))
      );

      try {
        const client = getInsforgeBrowserClient();
        if (client) {
          await (client as any)
            .from("opc_tasks")
            .update({ status })
            .eq("id", taskId);
        }
      } catch (err) {
        console.error("[InsForge Tasks] Update status failed:", err);
      }
    },
    []
  );

  // Delete task from InsForge BaaS
  const deleteTask = useCallback(async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      const client = getInsforgeBrowserClient();
      if (client) {
        await (client as any).from("opc_tasks").delete().eq("id", taskId);
      }
    } catch (err) {
      console.error("[InsForge Tasks] Delete task failed:", err);
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    addTask,
    updateStatus,
    deleteTask,
  };
}
