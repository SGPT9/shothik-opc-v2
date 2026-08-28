import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Health check endpoint for Traefik / Dokploy
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'shothik-ai-gateway',
    vps: 'srv1808169.hstgr.cloud'
  })
})

const API_SERVER_URL = process.env.API_SERVER_URL || 'http://api-server:4000'

// Proxy all /api requests to the API Server Gateway
app.use('/api', async (req, res) => {
  try {
    const targetUrl = `${API_SERVER_URL}/api${req.url}`
    const headers = { ...req.headers }
    delete headers.host

    const fetchOptions = {
      method: req.method,
      headers,
    }

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
      fetchOptions.body = JSON.stringify(req.body)
      fetchOptions.headers['content-type'] = 'application/json'
    }

    const response = await fetch(targetUrl, fetchOptions)

    res.status(response.status)
    response.headers.forEach((val, key) => {
      res.setHeader(key, val)
    })

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
    console.error(`[API Proxy Error] Failed to proxy to ${targetUrl || API_SERVER_URL}:`, error?.message)
    res.status(502).json({
      success: false,
      error: 'Bad Gateway: API Server unreachable',
      details: error?.message,
    })
  }
})

import fs from 'fs'

// Serve static Vite frontend in production
const possibleDistPaths = [
  path.join(__dirname, '..', 'dist', 'public'),
  path.join(__dirname, '..', 'dist'),
  path.join(__dirname, 'dist', 'public'),
  path.join(__dirname, 'dist'),
]
const distPath = possibleDistPaths.find((p) => fs.existsSync(path.join(p, 'index.html'))) || path.join(__dirname, '..', 'dist')

console.log(`📁 Serving static frontend assets from: ${distPath}`)
app.use(express.static(distPath))

app.use((req, res) => {
  const indexPath = path.join(distPath, 'index.html')
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.status(404).send('Frontend bundle index.html not found. Please verify build output.')
  }
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Shothik AI production server running on port ${PORT}`)
  console.log(`🌐 DeepSeek Gateway: Active`)
})
