import { useState, useCallback } from "react";

export type ExportFormat = "pdf" | "epub" | "docx";

export interface PublishingChannel {
  id: string;
  name: string;
  connected: boolean;
  status: string;
}

export function useBookPublishing() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("pdf");
  const [channels, setChannels] = useState<PublishingChannel[]>([
    { id: "p1", name: "Shothik Books & Marketplace", connected: true, status: "Ready to publish" },
    { id: "p2", name: "Amazon KDP Direct", connected: false, status: "Not connected" },
    { id: "p3", name: "PublishDrive", connected: true, status: "API Connected" },
  ]);

  const triggerExport = useCallback(async (format: ExportFormat, content: string, title: string) => {
    setIsExporting(true);
    setExportFormat(format);

    try {
      // Simulate FAANG export generation delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      return { success: true, downloadUrl: `/api/export?format=${format}&title=${encodeURIComponent(title)}` };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    isExporting,
    exportFormat,
    channels,
    triggerExport,
    setChannels,
  };
}
