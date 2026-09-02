# How to Use the VC Diligence Skill

Follow these steps to perform high-conviction venture capital due diligence using this framework.

## 1. Activation

To start using the skill, you must first activate it within your Gemini CLI session:

```bash
activate_skill vc-diligence
```

This will load the V26 Master Synthesis framework and its associated mandates.

## 2. Initialization

Once activated, tell the agent which startup you want to audit. Use a prompt like:

> "I want to perform a deep-dive diligence on [Startup Name]. Follow the VC Diligence Skill framework to create a 30-page master audit."

The agent will then:
1. Initialize the workspace (Phase 0).
2. Start the Wave-based discovery process (Phase 1).

## 3. Prerequisite Setup

Ensure your environment is ready for the technical and visual components:

*   **Python Dependencies**: `pip install playwright`
*   **Browser Binaries**: `npx playwright install chromium`
*   **API Keys**: Set `SERPER_API_KEY` in your environment for high-fidelity image discovery.

## 4. Collaborative Skills

This skill automatically orchestrates other specialized agents when needed:
- **`architecture-auditor`**: Used for deep technical plumbing forensics.
- **`excalidraw-diagram`**: Used for generating high-quality visual arguments.

## 5. Deliverables

Upon completion, you will find the following in your `deliverables/` folder:
- `partner_overview_memo.md`: A high-level synthesis for investment partners.
- `technical_commercial_deep_dive.md`: Detailed teardown of moats and architecture.
- `full_diligence_report.md`: The 30+ page master audit.
- `diagrams/`: A collection of PNGs and Excalidraw files representing the visual arguments.

## 6. Tips for Best Results

- **Be Patient**: This is a multi-wave process. The agent will perform dozens of searches and full-text fetches.
- **Specific Hypotheses**: If you have specific concerns (e.g., "I'm worried about their dependence on OpenAI's latest model"), mention them at the start to guide the research.
- **Iterative Feedback**: You can review the `raw_findings/` at any time and provide course corrections to the agent.
