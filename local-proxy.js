// Lightweight Node.js Reverse Proxy (No NGINX installation required)
// Proxies incoming traffic on port 80 (or 8080) to Vite dev server on port 5001

import http from "http";

const TARGET_PORT = 5001;
const TARGET_HOST = "127.0.0.1";
const PROXY_PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  const options = {
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `127.0.0.1:${TARGET_PORT}`,
      "x-forwarded-for": req.socket.remoteAddress,
      "x-forwarded-proto": "http",
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on("error", (err) => {
    res.writeHead(502, { "Content-Type": "text/plain" });
    res.end(`Proxy Error: Could not connect to local Vite app on port ${TARGET_PORT}. Is 'npm run dev' running?`);
  });

  req.pipe(proxyReq, { end: true });
});

// Support WebSocket Upgrade for Vite HMR
server.on("upgrade", (req, socket, head) => {
  const proxySocket = http.request({
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers,
  });

  proxySocket.on("upgrade", (proxyRes, upstreamSocket, upstreamHead) => {
    socket.write(
      `HTTP/1.1 101 Switching Protocols\r\n` +
      Object.entries(proxyRes.headers)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\r\n") +
      `\r\n\r\n`
    );
    upstreamSocket.pipe(socket);
    socket.pipe(upstreamSocket);
  });

  proxySocket.on("error", () => {
    socket.destroy();
  });

  proxySocket.end();
});

server.listen(PROXY_PORT, "0.0.0.0", () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Node.js Reverse Proxy is running!`);
  console.log(`👉 Local Machine:   http://localhost:${PROXY_PORT}/`);
  console.log(`👉 WiFi/LAN Share:  http://192.168.68.100:${PROXY_PORT}/`);
  console.log(`======================================================\n`);
});
