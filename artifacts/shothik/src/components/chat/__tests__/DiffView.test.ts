import { describe, it, expect } from "vitest";
import { parseUnifiedDiff } from "../DiffView";

describe("parseUnifiedDiff", () => {
  it("handles empty or blank diffs", () => {
    const result = parseUnifiedDiff("");
    expect(result.lines).toHaveLength(0);
    expect(result.additions).toBe(0);
    expect(result.deletions).toBe(0);
  });

  it("parses additions, deletions, context, and hunk line numbers", () => {
    const diff = `@@ -10,3 +10,4 @@
 context line
-old removed line
+new added line 1
+new added line 2
 trailing context`;

    const result = parseUnifiedDiff(diff);
    expect(result.hasLineNumbers).toBe(true);
    expect(result.additions).toBe(2);
    expect(result.deletions).toBe(1);

    const delLine = result.lines.find((l) => l.type === "del");
    expect(delLine?.text).toBe("old removed line");
    expect(delLine?.oldLine).toBe(11);

    const addLine1 = result.lines.find((l) => l.text === "new added line 1");
    expect(addLine1?.type).toBe("add");
    expect(addLine1?.newLine).toBe(11);
  });
});
