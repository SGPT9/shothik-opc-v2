import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = Number(process.env.PORT) || 5000
const API_SERVER_URL = process.env.API_SERVER_URL || 'http://127.0.0.1:8080'

const possibleDistPaths = [
  path.join(__dirname, '..', 'dist', 'public'),
  path.join(__dirname, '..', 'dist'),
  path.join(__dirname, 'dist', 'public'),
  path.join(__dirname, 'dist'),
]
const distPath =
  possibleDistPaths.find((p) => fs.existsSync(path.join(p, 'index.html'))) ||
  path.join(__dirname, '..', 'dist', 'public')

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm',
}

function sendJson(res, statusCode, payload) {
  const raw = JSON.stringify(payload)
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Content-Length': Buffer.byteLength(raw),
  })
  res.end(raw)
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

const server = http.createServer(async (req, res) => {
  const reqUrl = req.url || '/'

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id',
    })
    res.end()
    return
  }

  // Health check endpoint for Traefik / Dokploy / Docker Compose
  if (reqUrl === '/health' || reqUrl === '/healthz') {
    sendJson(res, 200, {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'shothik-ai-gateway',
    })
    return
  }

  // Proxy /api and /v1 requests to the API Server Gateway
  if (reqUrl.startsWith('/api/') || reqUrl === '/api' || reqUrl.startsWith('/v1/')) {
    const normalizedPath = reqUrl.startsWith('/v1/') ? `/api${reqUrl}` : reqUrl
    const targetUrl = `${API_SERVER_URL}${normalizedPath}`
    try {
      const headers = { ...req.headers }
      delete headers.host
      delete headers['content-length']

      const fetchOptions = {
        method: req.method || 'GET',
        headers,
      }

      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method || '')) {
        const rawBody = await readRequestBody(req)
        if (rawBody.length > 0) {
          fetchOptions.body = rawBody
        }
      }

      const response = await fetch(targetUrl, fetchOptions)
      const outHeaders = { 'Access-Control-Allow-Origin': '*' }
      response.headers.forEach((val, key) => {
        if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'transfer-encoding') {
          outHeaders[key] = val
        }
      })

      res.writeHead(response.status, outHeaders)
      if (response.body) {
        const reader = response.body.getReader()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          res.write(value)
        }
        res.end()
      } else {
        res.end()
      }
    } catch (error) {
      console.error(`[API Proxy Error] Failed to proxy to ${targetUrl}:`, error?.message)
      sendJson(res, 502, {
        success: false,
        error: 'Bad Gateway: API Server unreachable',
        details: error?.message,
      })
    }
    return
  }

  // Serve static Vite frontend assets with path-traversal protection
  const cleanPathname = decodeURIComponent(reqUrl.split('?')[0])
  const candidatePath = path.resolve(distPath, '.' + cleanPathname)
  if (
    candidatePath.startsWith(path.resolve(distPath)) &&
    fs.existsSync(candidatePath) &&
    fs.statSync(candidatePath).isFile()
  ) {
    const ext = path.extname(candidatePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'
    res.writeHead(200, { 'Content-Type': contentType })
    fs.createReadStream(candidatePath).pipe(res)
    return
  }

  // SPA Fallback to index.html
  const indexPath = path.join(distPath, 'index.html')
  if (fs.existsSync(indexPath)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    fs.createReadStream(indexPath).pipe(res)
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Frontend bundle index.html not found. Please verify build output.')
  }
})

console.log(`Serving static frontend assets from: ${distPath}`)
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Shothik AI production frontend server running on port ${PORT}`)
})
