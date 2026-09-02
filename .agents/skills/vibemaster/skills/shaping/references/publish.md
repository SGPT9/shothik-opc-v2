# Publish a final implementation spec

Rewrite the publish artifact from confirmed understanding against the template. Use the draft only for fact-checking. Never copy it as source text.

## Exit Detection

Probe in order and take the first available exit:

```bash
git rev-parse --is-inside-work-tree 2>/dev/null   # whether git is present
command -v gh >/dev/null && gh repo view --json url,visibility 2>/dev/null    # GitHub
command -v glab >/dev/null && glab repo view 2>/dev/null                      # GitLab
```

**Whether an exit is available is decided by the `repo view` command succeeding, not by whether the CLI is installed.** `command -v` only decides whether to try. Having `gh` installed but the repo carrying no remote (so `repo view` fails) means that exit is unavailable. Keep probing further down the list.

1. GitHub available → an Issue or PR description
2. GitLab available → an Issue or MR description
3. Git present but no forge exit available → the commit message body
4. No git → do not publish, see "No-Git Scenario"

## Ask Where It's Going

Ask once and let the user choose. Give a default recommendation based on timing: finalizing before work starts → recommend an Issue (it can be claimed and assigned). Wrapping up and backfilling the record afterward → recommend a PR/MR description.

## Allowlist Template

The published text may consist of only the following five sections. Nothing outside them may appear:

```markdown
## Problem
<Problem statement, from the user's point of view>

## Solution
<Solution description, from the user's point of view>

## Acceptance Criteria
<Drawn from the inversion-based failure test, verifiable point by point>

## Key Decisions
<Why A was chosen over B, one sentence per rejected option>

## Out of Scope
<What is explicitly not being done>
```

## Privacy Discipline (Non-Negotiable)

- The published text must not contain: `.issues/` paths, verbatim quotes from the draft, internal codenames, judgments about specific individuals, or file paths and code snippets (except a schema or state machine that encodes a decision, which must be labeled as coming from the prototype).
- Within the template's five sections, any content you filled in by inference rather than the user's confirmation (most common in Out of Scope) must be labeled item by item as "inferred, unconfirmed" in the preview.
- **Run the mechanical gate before showing the user.** Write the candidate text to a temp file and run `python3 scripts/check-publish.py <draft-spec.md> <candidate.md>` (paths relative to this skill's directory). It catches leaked private paths, verbatim draft lines, and missing template sections, and warns when the target repo is public. Fix every finding and rerun until green, only then show the text to the user.
- Before publishing, show the user the complete final text. When the repository can be detected as public, add a prominent notice: "This will be published to a public repository." Only run the publish command after the user explicitly confirms. The gate runs before the human, never instead of the human.

## Publish Commands

```bash
gh issue create --title "<title>" --body-file <distilled-file>
glab issue create --title "<title>" --description "<distilled-text>"
```

PR/MR description scenario: this skill does not create the PR itself, hand the distilled text to the normal PR workflow.

## Fallback Exit

When the publish command fails (not logged in, no permission, network error): explain the failure to the user and hand over the distilled text as-is for manual use. Retry at most once. Do not improvise a substitute publish channel on your own.

## No-Git Scenario

The draft is the final state: the `spec.md` inside the task directory is the deliverable. If the user needs to sync with or persuade someone else (a co-founder, family member, or client), distill the spec into a passage ready to send (following the same allowlist discipline) and hand it to the user.
