// Self-contained dynamic API proxy
// Eliminates external dependency on convex/server

function createProxy(path: string[] = []): any {
  return new Proxy(() => {}, {
    get(_target, prop: string) {
      if (typeof prop === "symbol") return undefined;
      return createProxy([...path, prop]);
    },
    apply(_target, _thisArg, args) {
      return { path: path.join(":"), args: args[0] || {} };
    },
  });
}

export const api: any = createProxy();
export const internal: any = createProxy();
