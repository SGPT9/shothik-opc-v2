import { useState, useCallback } from "react";
import {
  exportManuscriptDocument,
  createPhysicalPrintOrder,
  type ExportFormatType,
  type PrintOrderRequest,
  type PrintOrderResponse
} from "@/lib/book/manuscript-exporter";

export type ExportFormat = "pdf" | "epub" | "docx" | "markdown" | "html";

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
    { id: "p4", name: "Steadfast Print-on-Demand (BD)", connected: true, status: "bKash MFS Active" },
  ]);

  const triggerExport = useCallback(async (format: ExportFormat, content: string, title: string, author: string = "Author") => {
    setIsExporting(true);
    setExportFormat(format);

    try {
      const formatType: ExportFormatType = format === 'pdf' ? 'html' : (format as ExportFormatType);
      const exported = await exportManuscriptDocument({
        title: title || 'Untitled Manuscript',
        author,
        chapters: [{ index: 1, title: 'Manuscript Body', content: content || 'No content provided.' }]
      }, formatType);

      // Trigger real browser file download
      if (typeof window !== 'undefined') {
        const blob = new Blob([exported.content], { type: exported.mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = exported.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      return {
        success: true,
        filename: exported.filename,
        sizeBytes: exported.sizeBytes
      };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    } finally {
      setIsExporting(false);
    }
  }, []);

  const orderAuthorCopies = useCallback(async (orderReq: Omit<PrintOrderRequest, 'payload'> & { title: string; content: string }): Promise<PrintOrderResponse> => {
    return createPhysicalPrintOrder({
      payload: {
        title: orderReq.title,
        chapters: [{ index: 1, title: 'Complete Manuscript', content: orderReq.content }]
      },
      customerName: orderReq.customerName,
      phone: orderReq.phone,
      deliveryAddress: orderReq.deliveryAddress,
      deliveryZone: orderReq.deliveryZone,
      copies: orderReq.copies,
      binding: orderReq.binding,
      paymentMethod: orderReq.paymentMethod
    });
  }, []);

  return {
    isExporting,
    exportFormat,
    channels,
    triggerExport,
    orderAuthorCopies,
    setChannels,
  };
}

