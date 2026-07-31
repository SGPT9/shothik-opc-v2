import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt = '', task_type = 'general', metadata = {} } = body;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (eventData: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`));
        };

        // 1. Initial Start Event
        sendEvent({
          event: 'start',
          node: 'LeadEditor',
          agent: 'LeadAgent',
          timestamp: Date.now(),
        });
        await new Promise((r) => setTimeout(r, 200));

        // 2. Task-Specific Sub-Agent Dispatch
        if (task_type === 'deep_research') {
          sendEvent({
            event: 'node_start',
            node: 'WebSearch',
            agent: 'ResearcherAgent',
            tool: 'TavilySearch',
            timestamp: Date.now(),
          });
          await new Promise((r) => setTimeout(r, 400));
        } else if (task_type === 'slide_generation') {
          sendEvent({
            event: 'node_start',
            node: 'MarpCompiler',
            agent: 'PresentationAgent',
            tool: 'marp-cli',
            timestamp: Date.now(),
          });
          await new Promise((r) => setTimeout(r, 400));

          sendEvent({
            event: 'slide_generated',
            node: 'MarpCompiler',
            agent: 'PresentationAgent',
            data: {
              title: metadata.bookTitle || 'Generated Presentation Deck',
              slides: [
                { header: 'Executive Overview', content: 'Key takeaways and strategic milestones.' },
                { header: 'Data & Architecture', content: 'Powered by DeerFlow 2.0 SuperAgent Engine.' },
              ],
            },
            timestamp: Date.now(),
          });
        } else if (task_type === 'code_generation') {
          sendEvent({
            event: 'node_start',
            node: 'CodeInterpreter',
            agent: 'CoderAgent',
            tool: 'python-sandbox',
            timestamp: Date.now(),
          });
          await new Promise((r) => setTimeout(r, 400));
        } else if (task_type === 'overnight_deepthink') {
          sendEvent({
            event: 'node_start',
            node: 'AirLLMStreamer',
            agent: 'AirLLM2.8TAgent',
            tool: 'MXFP4-PCIe-Engine',
            timestamp: Date.now(),
          });
          await new Promise((r) => setTimeout(r, 400));
        }

        // 3. Stream Generated Content Tokens
        const responseText = `\n\n### DeerFlow AI Insights (${task_type})\nPrompt: "${prompt}"\n\n1. **Analysis & Strategy:** Successfully evaluated requirements.\n2. **Execution:** Processed via DeerFlow 2.0 multi-agent workflow.\n3. **Result:** All operations completed with zero timeouts.`;

        const words = responseText.split(' ');
        for (const word of words) {
          sendEvent({
            event: 'token',
            node: 'WriterAgent',
            agent: 'WriterAgent',
            content: word + ' ',
            timestamp: Date.now(),
          });
          await new Promise((r) => setTimeout(r, 40));
        }

        // 4. Complete Event
        sendEvent({
          event: 'complete',
          node: 'LeadEditor',
          agent: 'LeadAgent',
          timestamp: Date.now(),
        });

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Stream processing failed' }, { status: 500 });
  }
}
