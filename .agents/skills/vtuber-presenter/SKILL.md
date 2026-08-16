---
name: vtuber-presenter
description: Open-LLM-VTuber interactive voice avatar presenter, MCP tool calling, visual perception, and Papermark deck pitch automation for Shothik.
---

# 🎭 Open-LLM-VTuber Presenter Skill

This skill integrates the **Open-LLM-VTuber framework** into the **Shothik Hermes Platform**, empowering founders and businesses with a **24/7 Interactive AI Avatar Presenter**.

---

## 🏗️ Modular 5-Engine Pipeline

1. **Voice Activity Detection (Silero VAD)**: Real-time speech detection allowing natural human voice interruption during presentation or customer support.
2. **Automatic Speech Recognition (Faster Whisper / Sherpa-ONNX)**: GPU/CPU offline speech-to-text conversion for sub-50ms latency.
3. **Hermes & TonightEngine LLM Agent**: Core brain handling reasoning, task graph execution, and multi-agent swarm orchestration.
4. **Text-to-Speech & Voice Cloning (Edge-TTS / GPT-SoVITS)**: Natural multilingual voice synthesis (English, Bangla, Hindi, Spanish).
5. **Live2D / VRM Renderer**: Real-time lip-sync, expression triggers, and desktop companion mode.

---

## ⚡ Shothik Platform Integration Matrix

### 🎙️ 1. Papermark Pitch Deck & Book Presenter
- When investors or readers open trackable document links (`https://docs.shothik.app/<doc-id>`) or `/writing-studio?mode=3fold`, the Live2D/VRM Avatar appears on screen.
- The avatar narrates slides/manuscript chapters, takes voice questions via Silero VAD, and uses **Papermark analytics** & **Twin telemetry** to gauge reader interest.

### 📚 2. Twin Workspace Co-Founder Mode (/twin)
- Acts as a 24/7 interactive avatar co-founder in the Polsia-inspired `/twin` workspace.
- Narrates overnight task queue status, highlights completed research passes, and conducts interactive voice debriefs.

### 🛠️ 3. MCP Tool Calling & Pipedream Connect
- Uses Model Context Protocol (MCP) to trigger tools during live conversations:
  - `"Schedule a follow-up call on Google Calendar"` $\rightarrow$ Triggers Pipedream Connect OAuth proxy.
  - `"Send the price quote via WhatsApp"` $\rightarrow$ Triggers ChatbotX 8-channel gateway.

### 👁️ 4. Visual Perception & Screen Code Review
- Accepts camera and screen-sharing inputs to comment on UI designs, review code in real-time, or explain complex technical diagrams.

### 🧠 5. Mem0 Long-Term Memory
- Remembers investor preferences, founder goals, and customer interaction histories across multiple sessions.
