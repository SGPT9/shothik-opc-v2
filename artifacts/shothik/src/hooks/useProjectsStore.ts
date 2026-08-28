import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  getProjects as getLocalProjects,
  createProject as createLocalProject,
  updateProject as updateLocalProject,
  deleteProject as deleteLocalProject,
  getTemplates,
  getDefaultSections,
} from "@/lib/projects-store";

export { getTemplates, getDefaultSections };

interface AuthState {
  auth: {
    user: {
      id?: string;
      _id?: string;
      [key: string]: unknown;
    } | null;
  };
}

export interface ProjectParams {
  title: string;
  type: string;
  template?: string;
  description?: string;
  settings?: Record<string, unknown>;
  researchNotes?: unknown;
  agentChapters?: unknown;
}

export interface ProjectData {
  _id: string;
  id?: string;
  title: string;
  type: string;
  template?: string | null;
  description: string;
  content: string;
  sections: unknown[];
  settings: Record<string, unknown>;
  wordCount: number;
  progress: number;
  starred: boolean;
  lastEditedAt: number;
  _creationTime: number;
}

export interface ProjectUpdates {
  title?: string;
  description?: string;
  content?: string;
  wordCount?: number;
  progress?: number;
  starred?: boolean;
  sections?: unknown[];
  settings?: Record<string, unknown>;
}

function mapPgProjectToProjectData(item: any): ProjectData {
  return {
    _id: item.id,
    id: item.id,
    title: item.title,
    type: item.type,
    template: item.template ?? null,
    description: item.description ?? "",
    content: item.content ?? "",
    sections: Array.isArray(item.sections) ? item.sections : [],
    settings: (item.settings as Record<string, unknown>) ?? {},
    wordCount: item.wordCount ?? 0,
    progress: item.progress ?? 0,
    starred: !!item.starred,
    lastEditedAt: item.updatedAt ? new Date(item.updatedAt).getTime() : Date.now(),
    _creationTime: item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
  };
}

export function useProjectsStore() {
  const user = useSelector((state: AuthState) => state.auth?.user);
  const userId = user?.id || user?._id || null;

  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCloudProjects = useCallback(async (uid: string) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/v1/projects", {
        headers: {
          "x-user-id": uid,
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map(mapPgProjectToProjectData);
        setProjects(mapped);
      }
    } catch (err) {
      console.error("[useProjectsStore] Failed to fetch cloud projects, using local cache:", err);
      setProjects(getLocalProjects() as ProjectData[]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      setProjects(getLocalProjects() as ProjectData[]);
      setIsLoading(false);
    } else {
      fetchCloudProjects(userId);
    }
  }, [userId, fetchCloudProjects]);

  const createProject = useCallback(
    async (params: ProjectParams): Promise<ProjectData> => {
      const defaultSections = getDefaultSections(params.type);

      if (userId) {
        try {
          const res = await fetch("/api/v1/projects", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-user-id": userId,
            },
            body: JSON.stringify({
              title: params.title,
              type: params.type,
              template: params.template || null,
              description: params.description || "",
              sections: defaultSections,
              settings: params.settings || {},
            }),
          });
          if (!res.ok) throw new Error(`Failed to create project: HTTP ${res.status}`);
          const json = await res.json();
          if (!json.success || !json.data) throw new Error(json.error || "Failed to create project");
          const created = mapPgProjectToProjectData(json.data);
          setProjects((prev) => [created, ...prev]);
          return created;
        } catch (err) {
          console.error("[useProjectsStore] Cloud create failed, fallback to local:", err);
          const project = createLocalProject(params as any);
          setProjects(getLocalProjects() as ProjectData[]);
          return project as ProjectData;
        }
      } else {
        const project = createLocalProject(params as any);
        setProjects(getLocalProjects() as ProjectData[]);
        return project as ProjectData;
      }
    },
    [userId]
  );

  const updateProject = useCallback(
    async (id: string, updates: ProjectUpdates) => {
      if (userId) {
        try {
          const res = await fetch(`/api/v1/projects/${encodeURIComponent(id)}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "x-user-id": userId,
            },
            body: JSON.stringify(updates),
          });
          if (!res.ok) throw new Error(`Failed to update project: HTTP ${res.status}`);
          const json = await res.json();
          if (json.success && json.data) {
            const updatedItem = mapPgProjectToProjectData(json.data);
            setProjects((prev) =>
              prev.map((p) => (p._id === id || p.id === id ? updatedItem : p))
            );
          }
        } catch (err) {
          console.error("[useProjectsStore] Cloud update failed, updating local:", err);
          updateLocalProject(id, updates);
          setProjects(getLocalProjects() as ProjectData[]);
        }
      } else {
        updateLocalProject(id, updates);
        setProjects(getLocalProjects() as ProjectData[]);
      }
    },
    [userId]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      if (userId) {
        try {
          const res = await fetch(`/api/v1/projects/${encodeURIComponent(id)}`, {
            method: "DELETE",
            headers: {
              "x-user-id": userId,
            },
          });
          if (!res.ok) throw new Error(`Failed to delete project: HTTP ${res.status}`);
          setProjects((prev) => prev.filter((p) => p._id !== id && p.id !== id));
        } catch (err) {
          console.error("[useProjectsStore] Cloud delete failed, deleting local:", err);
          deleteLocalProject(id);
          setProjects(getLocalProjects() as ProjectData[]);
        }
      } else {
        deleteLocalProject(id);
        setProjects(getLocalProjects() as ProjectData[]);
      }
    },
    [userId]
  );

  return {
    projects,
    isLoading,
    isAuthenticated: !!userId,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects: () => userId ? fetchCloudProjects(userId) : setProjects(getLocalProjects() as ProjectData[]),
  };
}
