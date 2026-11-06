import { useState, useEffect } from "react";
import { PolishedWriteView } from "@/components/writing-studio/PolishedWriteView";
import { getProject } from "@/lib/projects-store";

interface IntegratedWritingStudioProps {
  projectId: string;
  userId?: string;
}

/**
 * Canonical Writing Studio wrapper that delegates directly to PolishedWriteView
 * (which owns the unified Write | Format | Publish mode switcher, 5-Pillar Command Dock,
 * and Replit Comfort Bar without duplicate outer chrome).
 */
export function IntegratedWritingStudio({ projectId, userId }: IntegratedWritingStudioProps) {
  const [project, setProject] = useState<any>(() => (projectId ? getProject(projectId) : null));

  useEffect(() => {
    if (!projectId) return;
    let active = true;

    const local = getProject(projectId);
    if (local && active) {
      setProject(local);
    }

    (async () => {
      try {
        const res = await fetch(`/api/v1/projects/${encodeURIComponent(projectId)}`, {
          headers: userId ? { "x-user-id": userId } : {},
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && active) {
            setProject(json.data);
          }
        }
      } catch {
        // Local project fallback already set
      }
    })();

    return () => {
      active = false;
    };
  }, [projectId, userId]);

  if (!project) {
    return <div className="flex items-center justify-center h-screen">Loading studio...</div>;
  }

  return (
    <PolishedWriteView
      bookTitle={project.title}
      project={project}
      projectType={project.type || "book"}
    />
  );
}
