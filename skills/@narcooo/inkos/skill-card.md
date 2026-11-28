## Description:

Story Creation and Translation AI Agent with Studio Chat, CLI, and TUI - use for long-form novels, short fiction, scripts, storyboards, interactive-film projects, open-world / branching play, fan fiction, spinoffs, style imitation, continuations, covers, and multilingual EPUB/PDF/TXT/Markdown translation.

This skill is ready for commercial/non-commercial use.

## Publisher:

[narcooo](https://clawhub.ai/user/narcooo)

### License/Terms of Use:

MIT-0

## Use Case:

External users, authors, translators, and developers use InkOS to plan, write, revise, audit, translate, and export fiction or interactive narrative projects through agent-guided Studio, CLI, and TUI workflows.

### Deployment Geography for Use:

Global

## Known Risks and Mitigations:

Risk: The npm CLI package may change between installs and runs with access to manuscript project files.

Mitigation: Install a pinned, audited @actalk/inkos version and review the package before using it on valuable or sensitive writing projects.

Risk: Configured provider keys may be exposed if stored literally or sent to an untrusted custom base URL.

Mitigation: Use environment-backed keys or Studio secret storage, and configure only trusted provider or proxy endpoints.

Risk: Local persistence, daemon mode, and the localhost Studio can retain or expose sensitive project content if configured carelessly.

Mitigation: Review project storage, daemon, and Studio listener settings before processing confidential manuscripts or source material.

## Reference(s):

- [InkOS ClawHub Skill Page](https://clawhub.ai/narcooo/skills/inkos)
- [InkOS Homepage](https://github.com/Narcooo/inkos)
- [kkaiapi API Documentation](https://en.kkaiapi.com/docs)

## Skill Output:

**Output Type(s):** [Text, Markdown, Files, Shell commands, Configuration instructions, Guidance]

**Output Format:** [Markdown guidance with inline shell commands and references to generated project files]

**Output Parameters:** [1D]

**Other Properties Related to Output:** [May produce manuscript text, translation outputs, structured JSON state, review reports, exports, and CLI/TUI workflow guidance depending on the user request.]

## Skill Version(s):

2.9.0 (source: frontmatter and server release metadata)

## Ethical Considerations:

Users should evaluate whether this skill is appropriate for their environment, review any generated or modified files before relying on them, and apply their organization's safety, security, and compliance requirements before deployment.
