// Stub: @bprogress/next is Next.js-only. Passthrough under Vite.
import { type ReactNode } from 'react';

export default function ProgressProvider({
  children,
}: {
  children: ReactNode;
  color?: string;
  options?: Record<string, unknown>;
  shallowRouting?: boolean;
}) {
  return <>{children}</>;
}
