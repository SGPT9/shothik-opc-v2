import { useState, useCallback, useMemo } from "react";
import { getWordCount, stripHtml } from "@/lib/writing-utils";
import { countCitations, generateReferenceList, type CitationStyle } from "@/lib/reference-list";
import { computeReadinessScore } from "@/lib/projectMetrics";

export function useWritingEditor(initialContent: string = "", initialTitle: string = "Untitled Project") {
  const [content, setContent] = useState<string>(initialContent);
  const [title, setTitle] = useState<string>(initialTitle);
  const [citationStyle, setCitationStyle] = useState<CitationStyle>("APA");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const wordCount = useMemo(() => getWordCount(content), [content]);
  const plainText = useMemo(() => stripHtml(content), [content]);
  const citationCount = useMemo(() => countCitations(plainText), [plainText]);

  const readinessScore = useMemo(
    () => computeReadinessScore({ wordCount, citationCount, plainText }),
    [wordCount, citationCount, plainText]
  );

  const referenceList = useMemo(
    () => generateReferenceList(plainText, citationStyle),
    [plainText, citationStyle]
  );

  return {
    content,
    title,
    citationStyle,
    isSaving,
    lastSaved,
    wordCount,
    plainText,
    citationCount,
    readinessScore,
    referenceList,
    setContent,
    setTitle,
    setCitationStyle,
    setIsSaving,
    setLastSaved,
  };
}
