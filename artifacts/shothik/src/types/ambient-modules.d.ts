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

declare module "@/convex/twin_lifecycle_transitions" {
  export const LIFECYCLE_TRANSITIONS: Record<string, { from: string[]; to: string }>;
  export const BLOCKED_STATES: string[];
  export function validateTransition(from: string, to: string): boolean;
  export function canTransition(from: string, to: string): boolean;
  export function isActiveState(state: string): boolean;
  export type LifecycleState = string;
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

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "@/lib/*";
declare module "@/services/*";
declare module "@/types/*";
declare module "@/config/*";


