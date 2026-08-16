# SkillOpt Design Patterns & Algorithms

## 1. Bounded Textual Edit Pattern
```typescript
export interface TextualEdit {
  operation: "ADD" | "DELETE" | "REPLACE";
  targetSection: string;
  diffContent: string;
  editLengthTokens: number;
}
```

## 2. Validation Acceptance Loop Pattern
```typescript
if (newValidationScore > currentValidationScore) {
  acceptEdit(proposedSkill);
} else {
  pushToRejectedEditBuffer(proposedEdit);
  revertSkill();
}
```

## 3. Zero-Inference-Overhead Deployment Pattern
Optimized `SKILL.md` is loaded static at runtime, adding +0ms latency during inference while yielding +24.8 point accuracy gains.
