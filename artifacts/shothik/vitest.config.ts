import { defineConfig } from "vitest/config";
import path from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@workspace/shothik": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "src/shared"),
      "@/app": path.resolve(__dirname, "src/app-next"),
      "next/navigation": path.resolve(__dirname, "src/lib/navigation.ts"),
      "next/link": path.resolve(__dirname, "src/lib/stubs/next-link.tsx"),
      "next/image": path.resolve(__dirname, "src/lib/stubs/next-image.tsx"),
      "next/dynamic": path.resolve(__dirname, "src/lib/stubs/next-dynamic.tsx"),
      "next/head": path.resolve(__dirname, "src/lib/stubs/next-head.tsx"),
      "next/script": path.resolve(__dirname, "src/lib/stubs/next-script.tsx"),
      "next/headers": path.resolve(__dirname, "src/lib/stubs/next-headers.ts"),
      "next/server": path.resolve(__dirname, "src/lib/stubs/next-server.ts"),
      "motion/react-client": path.resolve(__dirname, "src/lib/stubs/motion-react-client.ts"),
      "motion/react": "framer-motion",
      "@letta-ai/letta-client": path.resolve(__dirname, "src/lib/stubs/letta-client.ts"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [path.resolve(__dirname, "src/test/setup.ts")],
    include: ["src/**/*.{test,spec}.{ts,tsx,js,jsx}"],
    exclude: ["node_modules", "dist", ".idea", ".git", ".cache", "src/app-next/**"],
    testTimeout: 10000,
  },
});
