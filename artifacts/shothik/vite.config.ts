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

import { localDevApiPlugin } from './vite-plugins/localDevApiPlugin';

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
    cssCodeSplit: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('scheduler') || id.includes('wouter')) {
              return 'vendor-react-core';
            }
            if (id.includes('@radix-ui') || id.includes('lucide-react') || id.includes('class-variance-authority') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'vendor-ui-primitives';
            }
            if (id.includes('@tiptap') || id.includes('prosemirror')) {
              return 'vendor-editor-suite';
            }
            if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('xlsx') || id.includes('jszip')) {
              return 'vendor-heavy-export';
            }
            if (id.includes('three') || id.includes('@react-three')) {
              return 'vendor-3d-visuals';
            }
            if (id.includes('framer-motion') || id.includes('motion')) {
              return 'vendor-motion';
            }
            if (id.includes('@tanstack/react-query') || id.includes('axios')) {
              return 'vendor-networking';
            }
            if (id.includes('@monaco-editor') || id.includes('monaco-editor')) {
              return 'vendor-monaco';
            }
            if (id.includes('@fortune-sheet')) {
              return 'vendor-spreadsheet';
            }
            if (id.includes('shiki') || id.includes('@shikijs')) {
              return 'async-shiki';
            }
            if (id.includes('prismjs') || id.includes('highlight.js') || id.includes('refractor')) {
              return 'vendor-syntax-highlighter';
            }
          }
        },
      },
    },
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
      '/api': {
        target: process.env.API_SERVER_ORIGIN ?? 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/v1': {
        target: process.env.API_SERVER_ORIGIN ?? 'http://localhost:8080',
        rewrite: (p) => `/api${p}`,
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
    'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_URL || 'https://xgnzsikvguswhtozvokx.supabase.co'),
    'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_pa1rLrMH8sLguAUhbTHfmw_wAcIY9hY'),
    'process.env.NEXT_PUBLIC_INSFORGE_URL': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_INSFORGE_URL || env.inforge_project_url || 'https://xgnzsikvguswhtozvokx.supabase.co'),
    'process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_INSFORGE_ANON_KEY || 'sb_publishable_pa1rLrMH8sLguAUhbTHfmw_wAcIY9hY'),
    'process.env.NEXT_PUBLIC_APP_URL': JSON.stringify('https://shothikgpt.com'),
  },
  };
});
