import { NextResponse } from "next/server";

export interface CanvasArtifact {
  id: string;
  title: string;
  type: "slide" | "document" | "sheet" | "code";
  version: number;
  updatedAt: string;
  content: {
    slides?: Array<{ title: string; bullets: string[]; notes?: string }>;
    docMarkdown?: string;
    spreadsheetRows?: Array<Record<string, string | number>>;
    codeSnippet?: string;
  };
}

const mockArtifacts: CanvasArtifact[] = [
  {
    id: "art-slide-01",
    title: "Autonomous Agent Workspace Architecture",
    type: "slide",
    version: 2,
    updatedAt: new Date().toISOString(),
    content: {
      slides: [
        {
          title: "Shothik Autonomous Agent Workspace",
          bullets: [
            "Visual Agent Cockpit & MCP Control",
            "24/7 Tonight Engine Overnight Scheduler",
            "Dynamic Side-by-Side Artifact Canvas",
          ],
          notes: "Introduce the three core pillars.",
        },
        {
          title: "Hermes Slide Engine Integration",
          bullets: [
            "Backend-owned orchestration via /api/hermes/slides",
            "Real-time SSE progress streaming",
            "Exportable to PDF, PPTX, HTML, and JSON",
          ],
        },
      ],
    },
  },
  {
    id: "art-doc-02",
    title: "Security & Permission Governance Specification",
    type: "document",
    version: 1,
    updatedAt: new Date().toISOString(),
    content: {
      docMarkdown: `# Security Policy & Permission Gates\n\n- **Auto-Approve**: Web search and read-only tools.\n- **Prompt User**: Workspace code modifications and browser workers.\n- **Block**: Direct financial transactions and payment mutations.`,
    },
  },
];

let artifactsState = [...mockArtifacts];

export async function GET() {
  return NextResponse.json({
    success: true,
    artifacts: artifactsState,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, type, content } = body;

    if (!title || !type) {
      return NextResponse.json({ success: false, error: "Title and type are required" }, { status: 400 });
    }

    const newArtifact: CanvasArtifact = {
      id: `art-${Date.now()}`,
      title,
      type,
      version: 1,
      updatedAt: new Date().toISOString(),
      content: content || {},
    };

    artifactsState.unshift(newArtifact);

    return NextResponse.json({
      success: true,
      artifact: newArtifact,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
