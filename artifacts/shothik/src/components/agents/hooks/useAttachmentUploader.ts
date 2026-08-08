import { useState, useCallback } from "react";

export interface AttachmentItem {
  id: string;
  name: string;
  size: number;
  url: string;
  type: string;
}

export function useAttachmentUploader() {
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const addAttachment = useCallback((item: AttachmentItem) => {
    setAttachments((prev) => [...prev, item]);
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const clearAttachments = useCallback(() => {
    setAttachments([]);
    setUploadError(null);
  }, []);

  return {
    attachments,
    isUploading,
    uploadError,
    addAttachment,
    removeAttachment,
    clearAttachments,
    setIsUploading,
    setUploadError,
  };
}
