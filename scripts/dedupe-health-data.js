import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, '..', 'health-data.json')

const raw = fs.readFileSync(DATA_FILE, 'utf8')
const data = JSON.parse(raw)

const metrics = data.data?.metrics || []

metrics.forEach(metric => {
  const before = metric.data.length
  const seen = new Set()
  metric.data = metric.data.filter(entry => {
    const instant = metric.name === 'sleep_analysis'
      ? (entry.sleepStart ?? entry.inBedStart ?? entry.date)
      : entry.date
    const key = `${instant}|${entry.source}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  const after = metric.data.length
  console.log(`${metric.name}: ${before} -> ${after}${before !== after ? '  (removed ' + (before - after) + ')' : ''}`)
})

fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
console.log('\nDone. health-data.json overwritten with deduped data.')
