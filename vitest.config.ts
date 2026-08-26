import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [path.resolve(__dirname, './test/setup.ts')],
    pool: 'forks', // Prevents React 19 hook issues across files in JSDOM
    include: [
      '**/__tests__/**/*.{test,spec}.{ts,tsx,js,jsx}',
      '**/*.{test,spec}.{ts,tsx,js,jsx}',
    ],
    exclude: [
      '**/node_modules/**',
      'node_modules/**',
      '**/.next/**',
      '.next/**',
      '**/dist/**',
      'dist/**',
      'e2e/**',
      'deer-flow-backend/**',
      'reference-repos/**',
      'scratch/**',
      'tmp/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 98,
        statements: 100,
      },
      watermarks: {
        lines: [40, 80],
        functions: [40, 75],
        branches: [30, 70],
        statements: [40, 80],
      },
      exclude: [
        'node_modules/',
        '.next/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mock/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './artifacts/shothik/src'),
      '@assets': path.resolve(__dirname, './attached_assets'),
      '@tiptap/pm/markdown': path.resolve(__dirname, './artifacts/shothik/src/lib/stubs/tiptap-pm-markdown.ts'),
      'next/navigation': path.resolve(__dirname, './artifacts/shothik/src/lib/navigation.ts'),
      'next/link': path.resolve(__dirname, './artifacts/shothik/src/lib/stubs/next-link.tsx'),
      'next/image': path.resolve(__dirname, './artifacts/shothik/src/lib/stubs/next-image.tsx'),
      'next/dynamic': path.resolve(__dirname, './artifacts/shothik/src/lib/stubs/next-dynamic.tsx'),
      'next/head': path.resolve(__dirname, './artifacts/shothik/src/lib/stubs/next-head.tsx'),
      'next/script': path.resolve(__dirname, './artifacts/shothik/src/lib/stubs/next-script.tsx'),
      'next/headers': path.resolve(__dirname, './artifacts/shothik/src/lib/stubs/next-headers.ts'),
      'next/server': path.resolve(__dirname, './artifacts/shothik/src/lib/stubs/next-server.ts'),
      'next': path.resolve(__dirname, './artifacts/shothik/src/lib/stubs/next-root.ts'),
      'motion/react-client': path.resolve(__dirname, './artifacts/shothik/src/lib/stubs/motion-react-client.ts'),
      'motion/react': 'framer-motion',
      '@letta-ai/letta-client': path.resolve(__dirname, './artifacts/shothik/src/lib/stubs/letta-client.ts'),
    },
  },
});
