import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(cors())
app.use(express.json({ limit: '50mb' }))

const DATA_FILE = path.join(__dirname, 'health-data.json')
const PHASE_STATE_FILE = path.join(__dirname, 'phase-state.json')

app.post('/api/health', (req, res) => {
  const incoming = req.body
  let existing = {}
  if (fs.existsSync(DATA_FILE)) {
    existing = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  }
  if (existing.data && !existing.data.workouts) existing.data.workouts = []

  const merged = { ...existing }

  if (incoming.data?.metrics) {
    merged.data = merged.data || {}
    merged.data.metrics = merged.data.metrics || []

    incoming.data.metrics.forEach(incomingMetric => {
      const existingMetric = merged.data.metrics.find(
        m => m.name === incomingMetric.name
      )
      if (existingMetric) {
        const combined = [...existingMetric.data, ...incomingMetric.data]
        const seen = new Set()
        existingMetric.data = combined.filter(d => {
          if (seen.has(d.date)) return false
          seen.add(d.date)
          return true
        })
      } else {
        merged.data.metrics.push(incomingMetric)
      }
    })
  }

  if (incoming.data?.workouts) {
    merged.data = merged.data || {}
    merged.data.workouts = merged.data.workouts || []

    const existingIds = new Set(merged.data.workouts.map(w => w.id))
    incoming.data.workouts.forEach(w => {
      if (!existingIds.has(w.id)) {
        merged.data.workouts.push(w)
        existingIds.add(w.id)
      }
    })
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(merged, null, 2))
  console.log('Health data merged:', new Date().toISOString())
  res.json({ success: true })
})

app.post('/api/coaching', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' })

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(req.body),
  })
  const data = await upstream.json()
  res.json(data)
})

app.get('/api/health', (req, res) => {
  if (fs.existsSync(DATA_FILE)) {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
    res.json(data)
  } else {
    res.json({ data: { metrics: [] } })
  }
})

// Durable store for small app-state flags (e.g. Phase 3 activation date) that need to
// survive a localStorage clear — deliberately separate from health-data.json, which holds
// Apple Health device data, not app state. Extensible object, not tied to one key.
app.get('/api/phase-state', (req, res) => {
  if (fs.existsSync(PHASE_STATE_FILE)) {
    res.json(JSON.parse(fs.readFileSync(PHASE_STATE_FILE, 'utf8')))
  } else {
    res.json({})
  }
})

app.post('/api/phase-state', (req, res) => {
  let existing = {}
  if (fs.existsSync(PHASE_STATE_FILE)) {
    existing = JSON.parse(fs.readFileSync(PHASE_STATE_FILE, 'utf8'))
  }
  const merged = { ...existing, ...req.body }
  fs.writeFileSync(PHASE_STATE_FILE, JSON.stringify(merged, null, 2))
  res.json({ success: true })
})

app.listen(3001, '0.0.0.0', () => {
  console.log('ArdenFit health server running on port 3001')
})
