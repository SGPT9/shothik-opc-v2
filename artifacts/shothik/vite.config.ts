import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

// PORT is only required when running the dev/preview server; builds don't need it.
const isServe = process.env.npm_lifecycle_event === 'dev' || process.argv.includes('serve');
const rawPort = process.env.PORT;

if (isServe && !rawPort) {
  throw new Error(
    'PORT environment variable is required but was not provided.',
  );
}

const port = Number(rawPort ?? 5000);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? '/';

// External API origin - all /api calls proxy here.
// Override with CHAT_API_ORIGIN (e.g. a local mock) for development/testing.
const externalApiOrigin =
  process.env.CHAT_API_ORIGIN ?? 'https://shothik.work';

export default defineConfig({
  base: basePath,
  plugins: [
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
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
      // Stub convex/react when no real Convex URL is configured.
      // All useQuery/useMutation calls return undefined — pages show loading states gracefully.
      // Remove this alias and set VITE_CONVEX_URL once the backend is connected.
      'convex/react': path.resolve(import.meta.dirname, 'src/lib/stubs/convex-react.ts'),
      'convex/browser': path.resolve(import.meta.dirname, 'src/lib/stubs/convex-browser.ts'),
      'convex/server': path.resolve(import.meta.dirname, 'src/lib/stubs/convex-server.ts'),
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
    strictPort: true,
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
    esbuildOptions: {
      // Treat .js files with JSX as jsx so esbuild doesn't choke on JSX syntax
      loader: { '.js': 'jsx' },
    },
  },
  define: {
    // Expose env vars as VITE_ equivalents
    'process.env.NEXT_PUBLIC_API_URL': JSON.stringify(''),
    'process.env.NEXT_PUBLIC_APP_URL': JSON.stringify('https://shothik.work'),
  },
});
