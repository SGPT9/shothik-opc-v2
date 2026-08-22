import { createClient } from '@insforge/sdk';

export const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://ers8j28a.ap-southeast.insforge.app',
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || 'anon_09a9f554a6d1ef3abb1eb3691c0224e22c30b4bfe25809c6222a8301bfa80f7b'
});
