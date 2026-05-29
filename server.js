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

app.post('/api/health', (req, res) => {
  const payload = req.body
  fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2))
  console.log('Health data received:', new Date().toISOString())
  res.json({ success: true })
})

app.get('/api/health', (req, res) => {
  if (fs.existsSync(DATA_FILE)) {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
    res.json(data)
  } else {
    res.json({ data: { metrics: [] } })
  }
})

app.listen(3001, '0.0.0.0', () => {
  console.log('ArdenFit health server running on port 3001')
})
