/**
 * Generates a Next.js configuration snippet that enables the standalone output mode.
 */
export function generateStandaloneNextConfig(): string {
  return `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
};

module.exports = nextConfig;`;
}
