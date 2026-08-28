declare module "next/server" {
  export class NextRequest {
    url: string;
    headers: Headers;
    method: string;
    nextUrl: {
      pathname: string;
      includes(path: string): boolean;
    };
    cookies: {
      get(name: string): { value: string } | undefined;
    };
    clone(): NextRequest;
    json(): Promise<any>;
  }
  export class NextResponse {
    headers: {
      set(key: string, value: string): void;
      get(key: string): string | null;
    };
    static json(data: any, init?: any): NextResponse;
    static next(): NextResponse;
    static redirect(url: string | URL, status?: number): NextResponse;
  }
}

declare module "next/headers" {
  export function cookies(): any;
  export function headers(): any;
}

declare module "mongoose" {
  const mongoose: any;
  export default mongoose;
}

declare module "stripe" {
  type Stripe = any;
  const Stripe: any;
  export type { Stripe };
  export default Stripe;
}

declare module "@upstash/redis" {
  export class Redis {
    constructor(options?: any);
    static fromEnv(): Redis;
    get<T = any>(key: string): Promise<T | null>;
    set(key: string, value: any, options?: any): Promise<any>;
    setex(key: string, ttl: number, value: any): Promise<any>;
    incr(key: string): Promise<number>;
    decr(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<number>;
    lrange(key: string, start: number, stop: number): Promise<string[]>;
    rpush(key: string, ...values: any[]): Promise<number>;
    lpush(key: string, ...values: any[]): Promise<number>;
    ltrim(key: string, start: number, stop: number): Promise<string>;
    hset(key: string, obj: any): Promise<any>;
    hgetall<T = any>(key: string): Promise<T | null>;
    sadd(key: string, ...members: any[]): Promise<number>;
    smembers(key: string): Promise<string[]>;
    del(...keys: string[]): Promise<number>;
  }
}

declare module "@letta-ai/letta-client" {
  type Letta = any;
  const Letta: any;
  export type { Letta };
  export default Letta;
}

declare module "@modelcontextprotocol/sdk/client/index.js" {
  export class Client {
    constructor(serverInfo?: any, options?: any);
    connect(transport: any): Promise<void>;
    request(req: any, schema?: any): Promise<any>;
    callTool(args: any): Promise<any>;
  }
}

declare module "@modelcontextprotocol/sdk/client/sse.js" {
  export class SSEClientTransport {
    constructor(url: URL, opts?: any);
  }
}


declare module "@llamaindex/liteparse" {
  export const LiteParse: any;
}

declare module "pdf-parse" {
  const pdfParse: any;
  export default pdfParse;
}

declare module "@/lib/hermes/modules/deerflow-engine" {
  export type DeerFlowNode = any;
  export type DeerFlowExecutionPlan = any;
}

declare module "@/lib/hermes/modules/semantic-ods" {
  export type OdsQueryResult = any;
}

declare module "@/lib/hermes/modules/swarm-orchestrator" {
  export type SwarmAgentMember = any;
  export type SwarmAgentRole = any;
}

declare module "@/lib/hermes/agents/definition" {
  export const HERMES_AGENTS: any;
}

declare module "@/lib/hermes/agents/builder" {
  export const AgentBuilder: any;
}

declare module "@/lib/hermes/tools/definition" {
  export const HERMES_TOOLS: any;
}

declare module "@/lib/hermes/tools/bridge" {
  export const ToolBridge: any;
}

declare namespace jest {
  interface Matchers<R> {
    toBeInTheDocument(): R;
    toHaveDisplayValue(value: any): R;
    toHaveTextContent(text: any): R;
    toHaveAttribute(attr: string, value?: any): R;
  }
}

type ChatPersona = "cofounder" | "writer" | "researcher" | "analyst" | "coresearcher" | "developer" | "general";

declare module "@/app-next/(primary-layout)/twin/types" {
  export type TaskItem = any;
}

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_SLIDE_API_URL?: string;
  readonly VITE_DEERFLOW_BACKEND_URL?: string;
  readonly VITE_EXTRACT_PDF_V2_ENABLED?: string;
  readonly [key: string]: any;
}

declare module "next" {
  export type Metadata = any;
  const next: any;
  export default next;
}

declare module "next/image" {
  import React from "react";
  export interface StaticImageData {
    src: string;
    height: number;
    width: number;
    blurDataURL?: string;
  }
  const Image: React.FC<any>;
  export default Image;
}

declare module "next/link" {
  import React from "react";
  const Link: React.FC<any>;
  export default Link;
}

declare module "next/navigation" {
  export function usePathname(): string;
  export function useRouter(): any;
  export function useSearchParams(): URLSearchParams;
  export function useParams(): any;
  export function redirect(path: string): void;
  export function notFound(): void;
}

declare module "next/dynamic" {
  const dynamic: any;
  export default dynamic;
}

declare module "next/head" {
  import React from "react";
  const Head: React.FC<any>;
  export default Head;
}

declare module "next/script" {
  import React from "react";
  const Script: React.FC<any>;
  export default Script;
}

declare namespace React {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  import React from "react";
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

