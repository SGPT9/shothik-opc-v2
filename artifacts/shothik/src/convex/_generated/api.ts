// Self-contained dynamic API proxy
// Eliminates external dependency on convex/server

const proxyCache = new Map<string, any>();

function createProxy(path: string[] = []): any {
  const key = path.join(":");
  if (proxyCache.has(key)) {
    return proxyCache.get(key);
  }
  const fn = () => {};
  const proxy = new Proxy(fn, {
    get(_target, prop: string | symbol) {
      if (prop === Symbol.toPrimitive) {
        return () => key;
      }
      if (typeof prop === "symbol") return undefined;
      if (prop === "toString" || prop === "valueOf" || prop === "toJSON") {
        return () => key;
      }
      return createProxy([...path, prop]);
    },
    apply(_target, _thisArg, args) {
      return { path: key, args: args[0] || {} };
    },
  });
  proxyCache.set(key, proxy);
  return proxy;
}

export const api: any = createProxy();
export const internal: any = createProxy();
