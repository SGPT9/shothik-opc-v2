// Universal Reverse Proxy Gateway for ShothikGPT
// Runs anywhere (Windows, macOS, Linux, VPS, Cloud) with Zero External Dependencies
// Automatically attempts Port 80 (standard HTTP) with fallback to Port 8088

import http from "http";

const TARGET_FRONTEND_PORT = Number(process.env.FRONTEND_PORT || 5000);
const TARGET_BACKEND_PORT = Number(process.env.API_PORT || 8080);
const PRIMARY_PORT = process.env.GATEWAY_PORT ? parseInt(process.env.GATEWAY_PORT, 10) : 80;
const FALLBACK_PORT = 8088;

function createGatewayServer(port) {
  const server = http.createServer((req, res) => {
    const allowedOrigin = process.env.CORS_ORIGIN || req.headers.origin || "*";
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Auth-Token, X-User-Id, Idempotency-Key");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      return res.end();
    }

    // Route traffic between Frontend (5000) and API Server (8080)
    const isApi = (req.url || "").startsWith("/api/");
    const targetPort = isApi ? TARGET_BACKEND_PORT : TARGET_FRONTEND_PORT;

    const proxyReq = http.request(
      {
        hostname: "127.0.0.1",
        port: targetPort,
        path: req.url,
        method: req.method,
        headers: {
          ...req.headers,
          host: `127.0.0.1:${targetPort}`,
          "x-forwarded-for": req.socket.remoteAddress,
          "x-forwarded-proto": "http",
        },
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      }
    );

    proxyReq.on("error", () => {
      res.writeHead(502, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`
        <div style="font-family: sans-serif; padding: 40px; text-align: center; background: #09090b; color: #f4f4f5; min-height: 100vh;">
          <h2 style="color: #34d399;">Shothik Universal Gateway</h2>
          <p>Connecting to local services...</p>
          <p style="color: #a1a1aa; font-size: 13px;">Ensure your local Vite app is active on port ${TARGET_FRONTEND_PORT} and API server on port ${TARGET_BACKEND_PORT}.</p>
        </div>
      `);
    });

    req.pipe(proxyReq, { end: true });
  });

  // Full WebSocket HMR Proxy
  server.on("upgrade", (req, socket, head) => {
    const isApi = (req.url || "").startsWith("/api/");
    const targetPort = isApi ? TARGET_BACKEND_PORT : TARGET_FRONTEND_PORT;

    const proxySocket = http.request({
      hostname: "127.0.0.1",
      port: targetPort,
      path: req.url,
      method: req.method,
      headers: req.headers,
    });

    proxySocket.on("upgrade", (proxyRes, upstreamSocket, upgradeHead) => {
      socket.write(
        `HTTP/1.1 101 Switching Protocols\r\n` +
        Object.entries(proxyRes.headers)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\r\n") +
        `\r\n\r\n`
      );
      if (head && head.length) {
        upstreamSocket.write(head);
      }
      if (upgradeHead && upgradeHead.length) {
        socket.write(upgradeHead);
      }
      upstreamSocket.pipe(socket);
      socket.pipe(upstreamSocket);
    });

    proxySocket.on("error", () => socket.destroy());
    proxySocket.end();
  });

  server.on("error", (err) => {
    if (err.code === "EACCES" || err.code === "EADDRINUSE") {
      console.log(`⚠️ Port ${port} requires administrator rights or is busy. Starting on fallback port ${FALLBACK_PORT}...`);
      createGatewayServer(FALLBACK_PORT);
    } else {
      console.error("Gateway error:", err);
    }
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`\n======================================================`);
    console.log(`🌐 Universal Gateway is LIVE on Port ${port}!`);
    console.log(`👉 Direct Local:    http://localhost:${port}/`);
    console.log(`======================================================\n`);
  });
}

createGatewayServer(PRIMARY_PORT);
