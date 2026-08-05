/**
 * Shims for next/* modules so legacy Next.js imports resolve under Vite.
 * Aliased in vite.config.ts.
 */
import React, { lazy, Suspense, type ReactNode, type ComponentType } from 'react';
import { Link as WouterLink } from 'wouter';

/* ---- next/link ---- */
export function Link({
  href,
  children,
  prefetch: _prefetch,
  scroll: _scroll,
  replace,
  ...rest
}: {
  href: string | { pathname?: string; query?: Record<string, string> };
  children?: ReactNode;
  prefetch?: boolean;
  scroll?: boolean;
  replace?: boolean;
  [key: string]: unknown;
}) {
  const to =
    typeof href === 'string'
      ? href
      : `${href?.pathname ?? ''}${
          href?.query ? `?${new URLSearchParams(href.query).toString()}` : ''
        }`;
  return (
    <WouterLink href={to} replace={replace} {...(rest as object)}>
      {children}
    </WouterLink>
  );
}

/* ---- next/image ---- */
export function Image({
  src,
  alt = '',
  width,
  height,
  fill,
  priority: _priority,
  quality: _quality,
  placeholder: _placeholder,
  blurDataURL: _blur,
  loader: _loader,
  unoptimized: _unopt,
  style,
  ...rest
}: {
  src: string | { src: string };
  alt?: string;
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  [key: string]: unknown;
}) {
  const resolvedSrc = typeof src === 'object' && src !== null ? src.src : src;
  const fillStyle = fill
    ? ({ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } as const)
    : undefined;
  return (
    <img
      src={resolvedSrc as string}
      alt={alt}
      width={fill ? undefined : (width as number)}
      height={fill ? undefined : (height as number)}
      style={{ ...fillStyle, ...(style as object) }}
      {...(rest as object)}
    />
  );
}

/* ---- next/dynamic ---- */
export function dynamic<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> } | ComponentType<P>>,
  options?: { ssr?: boolean; loading?: ComponentType },
): ComponentType<P> {
  const LazyComp = lazy(() =>
    loader().then((m) => ('default' in (m as object) ? (m as { default: ComponentType<P> }) : { default: m as ComponentType<P> })),
  );
  const Loading = options?.loading;
  return function DynamicShim(props: P) {
    return (
      <Suspense fallback={Loading ? <Loading /> : null}>
        <LazyComp {...props} />
      </Suspense>
    );
  };
}

/* ---- next/head ---- */
export function Head({ children: _children }: { children?: ReactNode }) {
  return null;
}

/* ---- next/script ---- */
export function Script(_props: Record<string, unknown>) {
  return null;
}

/* ---- next/headers (server-only; return empty stubs) ---- */
export function headers() {
  return new Map<string, string>();
}
export function cookies() {
  return {
    get: () => undefined,
    getAll: () => [],
    set: () => undefined,
    delete: () => undefined,
    has: () => false,
  };
}

/* ---- next/server ---- */
export class NextResponse extends Response {
  static json(body: unknown, init?: ResponseInit) {
    return new Response(JSON.stringify(body), {
      ...init,
      headers: { 'content-type': 'application/json', ...(init?.headers as object) },
    });
  }
  static redirect(url: string | URL, status = 307) {
    return new Response(null, { status, headers: { location: String(url) } });
  }
  static next() {
    return new Response(null);
  }
}
export class NextRequest extends Request {}
export type { NextRequest as NextRequestType };

/* ---- default exports for module aliases ---- */
export default Link;
