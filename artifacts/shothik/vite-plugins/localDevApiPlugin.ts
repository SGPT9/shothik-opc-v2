import type { Plugin } from 'vite';

export function localDevApiPlugin(): Plugin {
  return {
    name: 'local-dev-api-middleware',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const url = req.url?.split('?')[0];

        // 1. GET /api/user-limit
        if (req.method === 'GET' && url === '/api/user-limit') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            totalWordLimit: null,
            remainingWord: null,
            unlimited: true,
            wordsLimit: 1000000,
            wordsUsed: 0,
            status: 'success'
          }));
          return;
        }

        // 2. POST /api/auth/convex-token
        if (req.method === 'POST' && url === '/api/auth/convex-token') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            token: 'dev_convex_token_local',
            user: {
              id: 'dev_user_local',
              name: 'Developer',
              email: 'dev@shothik.local',
              role: 'admin'
            }
          }));
          return;
        }

        // 3. GET /api/auth/session is proxied to the real Express backend for token verification

        // 4. POST /api/auth/refresh
        if (req.method === 'POST' && url === '/api/auth/refresh') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            user: { id: 'dev-user', email: 'developer@shothikgpt.com' },
            token: 'mock-session-token'
          }));
          return;
        }

        // 4.1. GET /api/v1/subscriptions/me
        if (req.method === 'GET' && url === '/api/v1/subscriptions/me') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            data: {
              subscription: {
                tier: 'pro',
                status: 'active',
                credits: 15000,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              }
            }
          }));
          return;
        }

        // 4.2. POST /api/bkash/credits/checkout
        if (req.method === 'POST' && url === '/api/bkash/credits/checkout') {
          let bodyStr = '';
          req.on('data', (chunk: any) => { bodyStr += chunk; });
          req.on('end', () => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              paymentId: `BK_${Date.now()}`,
              bkashURL: null, // Triggers manual TrxID dialog seamlessly
              message: 'bKash payment initialized. Please enter your Merchant Transaction ID.'
            }));
          });
          return;
        }

        // 4.3. POST /api/v1/mfs/verify-trx
        if (req.method === 'POST' && url === '/api/v1/mfs/verify-trx') {
          let bodyStr = '';
          req.on('data', (chunk: any) => { bodyStr += chunk; });
          req.on('end', () => {
            const body = JSON.parse(bodyStr || '{}');
            const trxId = body.trxId || 'TRX_DEV_SUCCESS';
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              message: `bKash TrxID ${trxId} verified successfully! Your account has been credited.`,
              data: {
                trxId,
                tier: body.tier || 'pro',
                amountBdt: body.amountBdt || 1499,
                creditsAdded: 15000,
                status: 'COMPLETED'
              }
            }));
          });
          return;
        }

        // 4.4. POST /api/v1/subscriptions/passes:purchase
        if (req.method === 'POST' && url === '/api/v1/subscriptions/passes:purchase') {
          let bodyStr = '';
          req.on('data', (chunk: any) => { bodyStr += chunk; });
          req.on('end', () => {
            const body = JSON.parse(bodyStr || '{}');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              name: body.passId || 'Outcome Pass',
              outcomeUnlocked: 'Instant Turnitin-equivalent audit & export unlocked',
              trxId: body.trxId || 'TRX_PASS_OK',
              status: 'ACTIVE'
            }));
          });
          return;
        }

        // 3. POST /api/book-agent
        if (req.method === 'POST' && url === '/api/book-agent') {
          let bodyStr = '';
          req.on('data', (chunk: any) => { bodyStr += chunk; });
          req.on('end', async () => {
            try {
              const body = JSON.parse(bodyStr || '{}');
              const type = body.type || 'book';
              const description = body.description || 'A compelling new project';

              res.setHeader('Content-Type', 'text/event-stream');
              res.setHeader('Cache-Control', 'no-cache, no-store');
              res.setHeader('Connection', 'keep-alive');

              const send = (data: any) => {
                res.write(`data: ${JSON.stringify(data)}\n\n`);
              };

              send({ type: 'status', step: 1 });
              await new Promise(r => setTimeout(r, 200));
              send({ type: 'status', step: 2 });
              await new Promise(r => setTimeout(r, 200));
              send({ type: 'status', step: 3 });
              await new Promise(r => setTimeout(r, 200));
              send({ type: 'status', step: 4 });
              await new Promise(r => setTimeout(r, 200));
              send({ type: 'status', step: 5 });
              await new Promise(r => setTimeout(r, 200));
              send({ type: 'status', step: 6 });

              const plan = {
                title: description.length > 50 ? description.slice(0, 50) + '...' : description,
                genre: type === 'book' ? 'Literary Fiction / Thriller' : type === 'research' ? 'Academic Study' : 'Applied Analysis',
                logline: `A comprehensive ${type} exploring: ${description}`,
                chapters: [
                  { id: 'ch-1', title: 'Chapter 1: The Inciting Incident', synopsis: 'Introduction to the core narrative world, thesis, and central tension.' },
                  { id: 'ch-2', title: 'Chapter 2: Escalation & Depth', synopsis: 'Exploration of character motivations, evidence foundations, and thematic stakes.' },
                  { id: 'ch-3', title: 'Chapter 3: The Climax & Pivot Point', synopsis: 'High stakes confrontation, paradigm shift, and dramatic turning point.' },
                  { id: 'ch-4', title: 'Chapter 4: Resolution & Synthesis', synopsis: 'Final resolution, structural synthesis, and concluding thematic harmony.' }
                ],
                researchNotes: {
                  comparables: ['Mastering Narrative Craft', 'The Architecture of Thought'],
                  themes: ['Discovery', 'Transformation', 'Systemic Clarity'],
                  settingNotes: 'Rich atmospheric environment with grounded pacing and authentic dialogue.',
                  characterArchetypes: ['Determined Protagonist', 'Enigmatic Catalyst'],
                  keyConflicts: ['Internal belief vs External systemic pressure']
                }
              };

              send({ type: 'done', plan });
              res.end();
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // 3.5 POST /api/ai-cowriter
        if (req.method === 'POST' && url === '/api/ai-cowriter') {
          let bodyStr = '';
          req.on('data', (chunk: any) => { bodyStr += chunk; });
          req.on('end', async () => {
            try {
              const body = JSON.parse(bodyStr || '{}');
              const { currentText = '', mode = 'autocomplete', instruction = '' } = body;

              res.setHeader('Content-Type', 'text/event-stream');
              res.setHeader('Cache-Control', 'no-cache, no-store');
              res.setHeader('Connection', 'keep-alive');

              let generatedChunks: string[] = [];

              if (mode === 'instruction' && instruction) {
                generatedChunks = [
                  `Based on your direction ("${instruction}"), `,
                  `here is an enhanced perspective: `,
                  `The scene deepens with subtle sensory cues and atmospheric tension. `,
                  `Shadows lengthen across the damp pavement, carrying the distant hum of the city.`
                ];
              } else if (mode === 'expand') {
                generatedChunks = [
                  `Furthermore, examining the underlying structural dynamics reveals `,
                  `a compelling contrast between internal motivation and external necessity. `,
                  `This builds a layered progression that carries the reader forward with natural momentum.`
                ];
              } else {
                generatedChunks = [
                  `The silence settled into the room, `,
                  `heavy with unspoken revelations `,
                  `and the lingering question of what lay ahead.`
                ];
              }

              for (const chunk of generatedChunks) {
                res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
                await new Promise(r => setTimeout(r, 60));
              }

              res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
              res.end();
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // 4. POST /api/ai/needle-dispatch
        if (req.method === 'POST' && url === '/api/ai/needle-dispatch') {
          let bodyStr = '';
          req.on('data', (chunk: any) => { bodyStr += chunk; });
          req.on('end', () => {
            try {
              const body = JSON.parse(bodyStr || '{}');
              const mode = body.mode || 'chat';
              const query = body.query || '';
              const threshold = body.confidenceThreshold || 0.85;

              const isHighConfidence = query.startsWith('@') || /bkash|sum|revenue|rewrite|fix|arxiv|slide/i.test(query);
              const confidence = isHighConfidence ? 0.92 : 0.65;
              const escalated = confidence < threshold;

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                mode,
                query,
                confidence,
                escalatedToFrontier: escalated,
                selectedTier: escalated ? 'tier3_cloud_frontier' : 'tier0_micro_edge',
                engine: escalated ? 'switchyard_stage_router' : 'needle_2',
                reason: escalated ? 'Escalated to cloud reasoner via Switchyard' : 'Fast-path edge execution via Needle 2 (28MB RAM)',
              }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // 5. POST /api/ai/switchyard-proxy
        if (req.method === 'POST' && url === '/api/ai/switchyard-proxy') {
          let bodyStr = '';
          req.on('data', (chunk: any) => { bodyStr += chunk; });
          req.on('end', () => {
            try {
              const body = JSON.parse(bodyStr || '{}');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                status: 'success',
                translatedProtocol: 'universal_anthropic_openai',
                primaryProvider: 'gemini-2.5-flash',
                failoverStandby: ['deepseek-v3', 'claude-3-5-sonnet'],
                response: `[Switchyard Proxy] Processed request: ${body.prompt || 'ok'}`,
              }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // 6. POST /api/ai/refine-lesson
        if (req.method === 'POST' && url === '/api/ai/refine-lesson') {
          let bodyStr = '';
          req.on('data', (chunk: any) => { bodyStr += chunk; });
          req.on('end', () => {
            try {
              const body = JSON.parse(bodyStr || '{}');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                status: 'refined',
                lessonId: `lesson_${Date.now()}`,
                snapshotId: `snap_${Date.now()}`,
                rule: body.rule || 'Generic memory refinement',
                timestamp: Date.now(),
              }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // 7. POST /api/chat and /api/chat/stream — Hermes Gateway & Local Stream Proxy
        if (req.method === 'POST' && (url === '/api/chat' || url === '/api/chat/stream')) {
          let bodyStr = '';
          req.on('data', (chunk: any) => { bodyStr += chunk; });
          req.on('end', async () => {
            try {
              const body = JSON.parse(bodyStr || '{}');
              const { message = '', prompt = '', messages = [], context = {} } = body;
              const promptText = (message || prompt || (messages[messages.length - 1]?.content) || '').trim();

              res.setHeader('Content-Type', 'text/event-stream');
              res.setHeader('Cache-Control', 'no-cache, no-store, no-transform');
              res.setHeader('Connection', 'keep-alive');
              res.setHeader('X-Accel-Buffering', 'no');

              // Probe Hermes Agent Local Gateway on http://127.0.0.1:8642
              const hermesGatewayUrl = process.env.HERMES_GATEWAY_URL || 'http://127.0.0.1:8642';
              let connectedToHermes = false;

              try {
                const probe = await fetch(`${hermesGatewayUrl}/health`, { signal: AbortSignal.timeout(600) });
                if (probe.ok) {
                  connectedToHermes = true;
                }
              } catch {}

              if (connectedToHermes) {
                // Pipe to Hermes OpenAI-compatible chat completions endpoint
                try {
                  const hermesRes = await fetch(`${hermesGatewayUrl}/v1/chat/completions`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${process.env.HERMES_API_KEY || 'hermes_local_dev_key'}`,
                      'X-Hermes-Session-Id': body.conversationId || 'default-session',
                    },
                    body: JSON.stringify({
                      model: body.model || 'hermes-agent',
                      messages: messages.length > 0 ? messages : [{ role: 'user', content: promptText }],
                      stream: true,
                    }),
                  });

                  if (hermesRes.ok && hermesRes.body) {
                    res.write(`data: ${JSON.stringify({ thinking: "Connected to Hermes ☤ Living Agent Gateway" })}\n\n`);
                    const reader = hermesRes.body.getReader();
                    const decoder = new TextDecoder();
                    while (true) {
                      const { done, value } = await reader.read();
                      if (done) break;
                      const textChunk = decoder.decode(value, { stream: true });
                      res.write(textChunk);
                    }
                    res.end();
                    return;
                  }
                } catch (hermesErr: any) {
                  // Fallback to local intelligent response
                }
              }

              // Built-in intelligent canvas response
              const activeTab = context?.activeTab || 'doc';
              const agentId = context?.selectedAgentId || 'cofounder';

              res.write(`data: ${JSON.stringify({ 
                thinking: `Analyzing user intent "${promptText.slice(0, 40)}" across ${activeTab} studio and ECC ${agentId} agent domain...` 
              })}\n\n`);

              await new Promise((r) => setTimeout(r, 120));

              res.write(`data: ${JSON.stringify({
                event: "assistant_step",
                step: {
                  id: `step_${Date.now()}`,
                  type: "code",
                  label: `Hermes Engine: Synthesized context for ${activeTab.toUpperCase()} canvas`,
                  status: "completed",
                  detail: `Resolved ${messages.length + 1} turns with memory grounding`,
                }
              })}\n\n`);

              const responseText = `I have received your request regarding **"${promptText.slice(0, 50)}"**.\n\n` +
                `### 🚀 Execution Plan & Canvas Context\n` +
                `- **Active Studio**: \`${activeTab.toUpperCase()}\`\n` +
                `- **Autonomous Agent**: \`${agentId}\`\n` +
                `- **Hermes Skill Engine**: 286 ECC skills active via \`agentskills.io\` standard.\n\n` +
                `Your canvas has been synchronized and is ready for live interactive editing and diff inspection.`;

              const words = responseText.split(' ');
              for (const word of words) {
                res.write(`data: ${JSON.stringify({ token: word + ' ', content: word + ' ' })}\n\n`);
                await new Promise((r) => setTimeout(r, 20));
              }

              res.write('data: [DONE]\n\n');
              res.end();
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}
