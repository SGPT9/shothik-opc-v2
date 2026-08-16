---
name: skillopt
description: SkillOpt - Executive Strategy for Self-Evolving Agent Skills via text-space optimization, bounded add/delete/replace edits, textual learning-rate budgets, and zero-inference-overhead transferability.
---

# SkillOpt: Executive Strategy for Self-Evolving Agent Skills

SkillOpt treats an **Agent Skill document** (`SKILL.md`) as external trainable state for frozen LLM agents, optimizing it with textual gradients without mutating model weights or adding inference latency.

## Core Optimization Principles

1. **Text-Space Optimization**:
   - Scored execution rollouts generate feedback traces.
   - An optimizer LLM proposes bounded `add`, `delete`, or `replace` edits to the `SKILL.md` file.

2. **Validation Gate & Strict Acceptance**:
   - Edits are accepted ONLY when the validation accuracy strictly improves on held-out tasks ($S_{val}' > S_{val}$).

3. **Textual Learning-Rate Budget**:
   - Limits the maximum character/line diff per iteration to prevent catastrophic forgetting and skill bloat.

4. **Rejected-Edit Buffer**:
   - Maintains negative memory of failed skill edits so the optimizer avoids repeating unhelpful instruction changes.

5. **Epoch-Wise Slow/Meta Updates**:
   - Periodically consolidates redundant rules into compact, high-density mental models.

## Usage & Execution

```bash
# Execute SkillOpt optimization loop on an agent skill
shothik skillopt optimize --skill=.agents/skills/skillopt --val-split=0.2 --lr-budget=300
```
