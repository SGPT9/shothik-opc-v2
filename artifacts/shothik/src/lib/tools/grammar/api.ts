import { GrammarCheckResult, GrammarCheckRequest, GrammarIssue } from "./types";

export async function checkGrammar(
  request: GrammarCheckRequest
): Promise<GrammarCheckResult> {
  const response = await fetch("/api/v1/nlp/grammar:check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.error || "Failed to check grammar");
  }

  const raw = await response.json();
  const data = raw.data || raw;

  const rawIssues = data.errors || data.corrections || data.issues || [];
  const issues: GrammarIssue[] = rawIssues.map((item: any, index: number) => {
    const original = item.error || item.original || "";
    const replacement = item.correct || item.replacement || item.suggestion || "";
    const startIndex = typeof item.offset === "number" ? item.offset : (request.text.indexOf(original) !== -1 ? request.text.indexOf(original) : index * 10);
    const endIndex = startIndex + (original ? original.length : 5);
    const rawType = (item.type || "grammar").toLowerCase();

    return {
      id: item.errorId || item.id || `issue_${index}`,
      type: (rawType.includes("spell") ? "spelling" : rawType.includes("punct") ? "punctuation" : rawType.includes("style") ? "style" : "grammar") as any,
      message: item.reason || item.message || `Replace with "${replacement}"`,
      suggestion: replacement,
      original,
      replacement,
      explanation: item.reason || item.explanation,
      startIndex,
      endIndex,
      context: item.context || item.sentence || "",
      severity: "medium",
    };
  });

  return {
    success: true,
    text: request.text,
    issues,
    corrections: (data.corrections || []).map((c: any) => ({
      original: c.error || c.original,
      corrected: c.correct || c.corrected,
      explanation: c.reason || c.explanation,
    })),
    correctedText: data.correctedText || request.text,
    cost: 1,
    remainingCredits: 9999,
  };
}

export async function applyCorrection(
  text: string,
  issue: { startIndex: number; endIndex: number; suggestion: string }
): Promise<string> {
  return (
    text.slice(0, issue.startIndex) +
    issue.suggestion +
    text.slice(issue.endIndex)
  );
}

export async function applyAllCorrections(
  text: string,
  issues: Array<{ startIndex: number; endIndex: number; suggestion: string }>
): Promise<string> {
  // Sort by position (descending) to avoid index shifts
  const sortedIssues = [...issues].sort((a, b) => b.startIndex - a.startIndex);
  
  let result = text;
  for (const issue of sortedIssues) {
    result = await applyCorrection(result, issue);
  }
  
  return result;
}
