import { defineConfig, loadEnv, type Plugin, type PluginOption } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

// PORT is only required when running the dev/preview server; builds don't need it.
const isServe = process.env.npm_lifecycle_event === 'dev' || process.argv.includes('serve');
const rawPort = process.env.PORT;

// No strict PORT check needed, defaults to 5000 below

const port = Number(rawPort ?? 5000);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? '/';

function localDevApiPlugin(): Plugin {
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

        // 2. POST /api/auth/refresh
        if (req.method === 'POST' && url === '/api/auth/refresh') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            user: { id: 'dev-user', email: 'developer@shothik.ai' },
            token: 'mock-session-token'
          }));
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

        next();
      });
    }
  };
}

export default defineConfig(async ({ mode }) => {
  // Load environment variables from the monorepo root (two directories up from artifacts/shothik)
  const env = loadEnv(mode, path.resolve(import.meta.dirname, '../..'), '');
  const externalApiOrigin = env.CHAT_API_ORIGIN ?? 'https://shothikgpt.com';

  return {
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    base: basePath,
    plugins: [
      localDevApiPlugin(),
      react(),
      tailwindcss(),
      runtimeErrorOverlay(),
      ...(process.env.NODE_ENV !== 'production' &&
      process.env.REPL_ID !== undefined
        ? [
            await import('@replit/vite-plugin-cartographer').then((m) =>
              m.cartographer({
                root: path.resolve(import.meta.dirname, '..'),
              }),
            ),
            await import('@replit/vite-plugin-dev-banner').then((m) =>
              m.devBanner(),
            ),
          ]
        : []),
    ] as PluginOption[],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
      // Convex is connected: VITE_CONVEX_URL points at the live deployment,
      // so the real convex/react client is used (stubs in src/lib/stubs remain
      // only as a fallback if the URL is ever removed).
      // @tiptap/pm/markdown is not exported in @tiptap/pm v3 — use a stub
      '@tiptap/pm/markdown': path.resolve(import.meta.dirname, 'src/lib/stubs/tiptap-pm-markdown.ts'),
      // next/* shims so legacy Next.js imports resolve under Vite
      'next/navigation': path.resolve(import.meta.dirname, 'src/lib/navigation.ts'),
      'next/link': path.resolve(import.meta.dirname, 'src/lib/stubs/next-link.tsx'),
      'next/image': path.resolve(import.meta.dirname, 'src/lib/stubs/next-image.tsx'),
      'next/dynamic': path.resolve(import.meta.dirname, 'src/lib/stubs/next-dynamic.tsx'),
      'next/head': path.resolve(import.meta.dirname, 'src/lib/stubs/next-head.tsx'),
      'next/script': path.resolve(import.meta.dirname, 'src/lib/stubs/next-script.tsx'),
      'next/headers': path.resolve(import.meta.dirname, 'src/lib/stubs/next-headers.ts'),
      'next/server': path.resolve(import.meta.dirname, 'src/lib/stubs/next-server.ts'),
      'next': path.resolve(import.meta.dirname, 'src/lib/stubs/next-root.ts'),
      // "motion" package is not installed; framer-motion provides the same API
      'motion/react-client': path.resolve(import.meta.dirname, 'src/lib/stubs/motion-react-client.ts'),
      'motion/react': 'framer-motion',
      '@letta-ai/letta-client': path.resolve(import.meta.dirname, 'src/lib/stubs/letta-client.ts'),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: false,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: false,
    },
    proxy: {
      // Implemented by the local api-server artifact (Express), not the external
      // upstream. Must precede the general '/api' rule — Vite matches proxy keys
      // in declaration order.
      '/api/twin/seed': {
        target: process.env.API_SERVER_ORIGIN ?? 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api': {
        target: externalApiOrigin,
        changeOrigin: true,
        secure: false,
      },
      // API endpoint is /paraphrase-with-variantV2; must not swallow the /paraphrase page route
      '/paraphrase-with-variant': {
        target: externalApiOrigin,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-redux',
      'wouter',
      '@tanstack/react-query',
      'framer-motion',
      'lucide-react',
      '@tiptap/react',
      '@tiptap/starter-kit',
      '@tiptap/extension-placeholder',
      '@tiptap/extension-typography',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-avatar',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-switch',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-slider',
      'embla-carousel-react',
      'isomorphic-dompurify',
      'react-markdown',
      'remark-gfm',
    ],
    esbuildOptions: {
      // Treat .js files with JSX as jsx so esbuild doesn't choke on JSX syntax
      loader: { '.js': 'jsx' },
    },
  },
  define: {
    // Expose env vars as VITE_ equivalents
    'process.env.NEXT_PUBLIC_API_URL': JSON.stringify(''),
    'process.env.NEXT_PUBLIC_INSFORGE_URL': JSON.stringify(env.NEXT_PUBLIC_INSFORGE_URL || env.inforge_project_url || ''),
    'process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY': JSON.stringify(env.NEXT_PUBLIC_INSFORGE_ANON_KEY || ''),
    'process.env.NEXT_PUBLIC_APP_URL': JSON.stringify('https://shothikgpt.com'),
  },
  };
});
