import { getNextRace, RACE_DISTANCES } from './raceManager'

const fmtFinish = (mins) => {
  const h = Math.floor(mins / 60)
  const m = Math.round(mins % 60)
  return `${h}:${String(m).padStart(2, '0')}`
}

export async function generateCoachingSummary(healthData) {
  const now = new Date()
  const localDate = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`

  const cached = (() => {
    try { return JSON.parse(localStorage.getItem('ardenfit_coaching_summary')) } catch { return null }
  })()
  if (cached?.date === localDate) return cached.summary

  const nextRace      = getNextRace()
  const raceMiles     = RACE_DISTANCES.find(d => d.label === nextRace?.distance)?.miles ?? 13.1
  const pace          = healthData.avgPaceMinPerMile ?? 20.0
  const estimatedFinish = fmtFinish(pace * raceMiles)
  const lastNightSleep  = healthData.sleep?.total ?? 'unknown'

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-calls': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: `You are Arden, a direct and data-driven personal fitness coach. Write a 2-3 sentence morning coaching note based on the user's health data. Be specific, use the actual numbers, be direct. No fluff, no cheerleading. Focus on what the data says about today's readiness and one actionable priority. Never say 'Great job' or similar. Sign off as Arden.`,
      messages: [{
        role: 'user',
        content: `Today's data:
Sleep last night: ${lastNightSleep}h
HRV: ${healthData.hrv} ms (7-day avg)
Resting HR: ${healthData.restingHR} bpm
Steps so far: ${healthData.steps}
Workout complete: ${healthData.todayWorkoutComplete}
Current weight: ${healthData.currentWeight} lbs
Weight goal: 159 lbs by Jul 15
Days until race: 344
Current est. finish: ${estimatedFinish}
Phase: 1 — weight loss and movement habit`,
      }],
    }),
  })

  const data = await res.json()
  const summary = data.content[0].text
  localStorage.setItem('ardenfit_coaching_summary', JSON.stringify({ date: localDate, summary }))
  return summary
}
