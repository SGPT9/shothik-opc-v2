# Known defects: shaping (judging path)

Inherited from deep-thought, whose judging discipline now lives in `references/judging.md`. The finding transfers: it is about what models do when asked to judge, not about one skill.

Defects confirmed by evidence that no skill-layer edit has been able to move. Kept here rather than in `skills/shaping/`, because a shipped skill should carry instructions, not a record of what was tried.

## Inventing facts the user never supplied

**What it looks like.** Two shapes, both stable across runs:

- A number the user quoted about someone else gets adopted as theirs. Given "my co-founder says our churn is fine because the industry average is 5%", the reply opens with "the business has 5% churn" and goes on to compute an annual figure from it. The user never said what their churn was.
- Circumstances get filled in to make the reasoning concrete. Given two job offers and nothing else, the reply supplies a timeline ("in three years"), a career stage ("at your stage"), and a family ("your house or your kid's college fund").

Measured by the `invented_facts` check in `behavior-eval.json`.

## The size of it is set by the model, not by the skill text

Same skill text, same seven scenarios, same judge (`gpt-5.6-sol`), three runs each:

| Arm | Scenarios clean, per run | Mean | Spread | Reply length |
|---|---|---|---|---|
| `gpt-5.5` (xhigh) | 6,6,6 | 6.0 | 0 | all within limit |
| `gpt-5.6-sol` | 7,4,4 | 5.0 | 3 | all within limit |
| `claude-sonnet-5` | 5,5,4 | 4.67 | 1 | all within limit |
| `claude-haiku-4-5` | 4,4,4 | 4.0 | 0 | all within limit |
| `claude-opus-5` | 2,1,1 | 1.33 | 1 | 8 of 21 over limit |

**Every number in that table is now suspect.** They were produced by `gpt-5.6-sol` under the original wording of the check, and on 2026-07-27 that combination was shown to misjudge. Two judges scoring identical Sonnet transcripts came out 5.67 and 8.67 of 9. Hand review of the scenario `gpt-5.6-sol` failed three times out of three found nothing invented at all: the reply had separated fact from value, marked the unknown as unknown, and asked for the rest. Rewriting the question to exclude general world knowledge, flagged unknowns, questions and conditionals narrowed the gap but did not close it (6.67 against 9.0), so the judge was the variable rather than the wording. The check now pins `claude-opus-5`.

What survives: the arms did differ from each other under a consistent ruler, so the model is one real variable. What does not survive: the size of the gaps, the ordering of the middle arms, and any claim that a given arm invents at a given rate.

That is the whole claim, and it is weaker than it first looks. A fixed text scoring differently across models proves the model matters. It cannot prove the text does not, and the text side was never measured cleanly:

- All twelve text-variation runs used Haiku, an arm this project no longer tests at all (see `README.md` in this directory).
- Two of the three wordings quoted the eval scenarios back at the skill. `their runway, their dependents, their years in the field, their timeline` was copied verbatim out of the s3 failure transcripts, so those runs measured overfitting, not whether a rule works. Commit `1b33d1c` removed the leak.
- No run before `d85dd57` could load `references/`, so any behavior that depends on them was untested throughout.

The honest position: the model dominates what we measured, and the skill-text lever has not had a fair test.

`gpt-5.6-sol` scored itself here. Re-judging those same transcripts with `claude-opus-5` gave 7,6,7 (mean 6.67), so the arm judged itself more harshly, not more kindly. Self-scoring bias is not what the 5.0 reflects. Note the 1.67 gap between the two judges on identical text: the judge is itself a sizeable variable, so never compare numbers produced under different judges.

## What this rules out, and what it does not

**Was ruled out, now unproven: that a stronger model invents less.** An earlier version of this file predicted it, and the table appeared to refute it. Since the table's judge has been shown to misjudge, the refutation goes with it. Capability tier may or may not order this. Nobody has measured it under a ruler that holds.

**Ruled out: that reply length explains it.** Opus is the only arm that ran long, and all three of its over-length scenarios also invented. But three of its six inventing scenarios stayed within the length limit, one of them (s1) failing all three runs at full length compliance. Trimming length would not fix Opus.

**Not established: why the models differ.** The gradient is real and repeatable. Its cause is not known, and no explanation offered so far has survived a prediction test.

## For whoever picks this up

Prohibitions and substitute actions have been tried three ways and cost twelve runs. Do not simply write a fourth one. But do not treat the direction as closed either: those runs are disqualified on three separate counts (Haiku-only, scenario leakage, no `references/`), so they closed nothing.

One untested lead is already in the skill. Abstention, letting a model say plainly that it does not know, is the most basic move in the hallucination literature, and this skill's delivery rule (`never withhold a deliverable pending an answer`) plausibly forbade it: a model that may not say "I don't know" has invention as its only way out. Commit `23f2ea0` opened that exit. It has never been measured, on any arm.

Do not carry forward the old advice to pick `gpt-5.5` for fact discipline. That rested on the same table. Choosing an arm on this basis needs a fresh cross-model run under the pinned judge, and none has been done.

Before any new attempt: re-measure the noise floor on the arm you plan to use. Every floor recorded before 2026-07-26 was taken on Haiku and does not transfer. Opus and gpt-5.6-sol both showed spreads of 3 on some checks, wide enough to swallow most edits whole.
