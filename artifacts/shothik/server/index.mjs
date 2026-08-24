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

// DeepSeek V4 / V4 Pro Streaming Chat Proxy
app.post('/api/chat', async (req, res) => {
  const { messages, model = 'deepseek-chat', stream = true, temperature = 0.7 } = req.body
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'DEEPSEEK_API_KEY or OPENROUTER_API_KEY is not configured on server.' })
  }

  const endpoint = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions'

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model.includes('deepseek') ? model : 'deepseek-chat',
        messages,
        temperature,
        stream
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      return res.status(response.status).json({ error: errText })
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        res.write(decoder.decode(value, { stream: true }))
      }
      res.end()
    } else {
      const data = await response.json()
      res.json(data)
    }
  } catch (error) {
    console.error('Error proxying to DeepSeek API:', error)
    res.status(500).json({ error: error.message })
  }
})

// Serve static Vite frontend in production
const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))

app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Shothik AI production server running on port ${PORT}`)
  console.log(`🌐 DeepSeek Gateway: Active`)
})
