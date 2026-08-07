# 📚 Shothik AI Services & Offerings Architecture

Comprehensive documentation of all domain service adapters, logic flows, and client offerings available under `services/`.

---

## 🛠️ Service Catalog Overview

| Service Name | File Location | Offerings & Capabilities | API Endpoint / Fallback |
|---|---|---|---|
| **AI Content Detector** | [`services/ai-detector.service.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/services/ai-detector.service.ts) | Scans text for AI-generated patterns and returns human vs. AI confidence scores. | `/api/tools/ai-detector` |
| **Plagiarism Checker** | [`services/plagiarismService.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/services/plagiarismService.ts) | Web-wide deep plagiarism analysis with similarity breakdown and source matching. | `/api/tools/plagiarism/analyze` |
| **Grammar & Spell Checker** | [`services/grammar-checker.service.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/services/grammar-checker.service.ts) | Contextual grammar correction, punctuation fixes, and style enhancements. | `/api/tools/grammar` |
| **Paraphraser & Rewriter** | [`services/paraphrase.service.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/services/paraphrase.service.ts) | Multi-tone sentence rewriting (Standard, Academic, Creative, Shorten). | `/api/tools/paraphrase` |
| **Text Summarizer** | [`services/summarize.service.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/services/summarize.service.ts) | Bulleted and executive summary generation for long-form papers and reports. | `/api/tools/summarize` |
| **Polyglot Translator** | [`services/translator.service.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/services/translator.service.ts) | High-precision translation across 50+ languages including Bengali (bn-BD). | `/api/tools/translate` |
| **Citation Detector** | [`services/citationDetector.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/services/citationDetector.ts) | Automatic extraction and formatting of APA, MLA, Chicago, and IEEE citations. | `/api/tools/citation` |
| **Chat-To-Slides Generator** | [`services/createPresentationServer.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/services/createPresentationServer.ts) | Converts chat prompts and documents into presentation slide decks. | `/slide/create-presentation` |
| **DeerFlow AI Engine** | [`services/deerflow.service.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/services/deerflow.service.ts) | Multi-agent DAG task reasoning workflow engine. | `/api/hermes/deerflow` |
| **Twin Research Dispatcher** | [`services/twin-research-dispatcher.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/services/twin-research-dispatcher.ts) | Dispatches deep research tasks to user Second-Me twin agents. | `/api/twin/research` |
| **Writing Studio Assistant** | [`services/writing-studio.service.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/services/writing-studio.service.ts) | Manuscript chapter outline generation, word count tracking, and auto-save. | `/api/writing-studio` |

---

## ⚡ Service Execution Standard Logic

All services follow the **Resilient Service Invocation Pattern**:

1. **Parameter & Type Validation**: Request parameters validated with Zod schemas.
2. **Authorization & Rate Limits**: Bearer header / InsForge token resolution with tier checks.
3. **Primary Microservice Execution**: Attempts high-performance microservice call.
4. **Resilient Fallback**: Falls back to LLM gateway or local mock provider on upstream timeout.
5. **Observability Auditing**: Logs execution duration and status to InsForge `public.hermes_tool_calls`.
