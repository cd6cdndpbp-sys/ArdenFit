import { getNextRace, RACE_DISTANCES } from './raceManager'
import { getTomorrowsPlan } from './trainingPlan'

const CACHE_KEY = 'ardenfit_coaching_summary_evening'

function localDateStr(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}

function avgFromArray(arr) {
  const valid = arr.filter(v => v != null && !isNaN(v))
  if (!valid.length) return null
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length)
}

function consecutivePoorSleepNights(sleepLast7) {
  const nights = [...(sleepLast7 ?? [])].reverse()
  let count = 0
  for (const { hours } of nights) {
    if (hours != null && hours < 6) count++
    else break
  }
  return count
}

function buildPayload(healthData) {
  const tomorrow = getTomorrowsPlan()
  const tomorrowDesc = tomorrow
    ? tomorrow.type === 'rest'
      ? 'Rest day'
      : tomorrow.distance
        ? `${tomorrow.label} — ${tomorrow.distance} mi at ${tomorrow.speed}`
        : `${tomorrow.label} — ${tomorrow.duration} min`
    : 'No plan data'

  const hrvBaseline = avgFromArray(healthData.hrvTrend)
  const hrBaseline  = avgFromArray(healthData.hrTrend)
  const poorNights  = consecutivePoorSleepNights(healthData.weekSummary?.sleepLast7)

  return {
    sleepLastNight:          healthData.sleep?.total ?? null,
    sleepWeekAvg:            healthData.weekSummary?.avgSleep ?? null,
    sleepTrend:              healthData.weekSummary?.sleepTrend ?? 'flat',
    nightsUnder7:            healthData.weekSummary?.nightsUnder7 ?? null,
    consecutivePoorNights:   poorNights,
    hrvToday:                healthData.hrv ?? null,
    hrvBaseline,
    restingHR:               healthData.restingHR ?? null,
    hrBaseline,
    workoutComplete:         healthData.todayWorkoutComplete,
    exerciseMinutes:         healthData.exerciseToday ?? null,
    workoutsThisWeek:        healthData.weekSummary?.workoutsCompleted ?? null,
    currentWeight:           healthData.currentWeight ?? null,
    weightTarget:            159,
    weightTargetDate:        'Jul 15',
    tomorrowPlan:            tomorrowDesc,
  }
}

export async function generateCoachingSummary(healthData) {
  const now  = new Date()
  const hour = now.getHours()

  const getCached = () => {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY)) } catch { return null }
  }

  if (hour < 17) {
    const cached = getCached()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    if (cached?.date === localDateStr(yesterday) || cached?.date === localDateStr()) {
      return cached.summary
    }
    return null
  }

  const todayStr = localDateStr()
  const cached = getCached()
  if (cached?.date === todayStr) return cached.summary

  const payload = buildPayload(healthData)

  const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3001/api/coaching'
    : 'http://192.168.1.221:3001/api/coaching'

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: `You are Arden — a training partner and coach inside a personal fitness dashboard. Write an evening summary for one specific person. You know them well. Be direct, clear-eyed, and supportive without being a cheerleader.

HARD CONSTRAINTS — never violate:
- Condition: FSHD (facioscapulohumeral muscular dystrophy)
- No running, jogging, sprinting, or "easy run" language — ever
- Treadmill walking ONLY, max 3.6 mph
- No overhead movements
- No jumping or explosive movements
- Equipment: 5 lb dumbbells, resistance bands, yoga mat, treadmill
- Fatigue appears post-activity — sessions end before perceived limit
- Schedule: up at 0400, bed at 2100

CURRENT PHASE: Phase 1 — weight loss + movement habit
- Target: 159 lbs by Jul 15
- Priority order: sleep > nutrition > movement habit > pace
- Pace and finish time are irrelevant in Phase 1 — do not mention them

DECISION LOGIC — apply before writing:
- Sleep < 5h OR consecutive poor nights >= 3: recovery only tomorrow, say so plainly
- Sleep 5-6h: reduced session tomorrow, name what that means
- Sleep 6-7h: normal session
- Sleep 7h+: full session, can push slightly
- HRV today 10%+ below baseline: back off tomorrow regardless of sleep
- Resting HR 10%+ above baseline: flag it, back off tomorrow

STRUCTURE — 3 sentences maximum:
1. Week arc: what the sleep and HRV data says about how this week has gone for recovery (use actual numbers)
2. Tomorrow: one specific prescription based on the plan and the data — name the session, any adjustment to it
3. One priority for tonight or tomorrow morning if relevant

VOICE:
- Training partner who's seen the data and has something real to say
- Uses actual numbers
- Does not say "Great job", "Well done", "Amazing", or similar
- Does not use em-dash for dramatic effect mid-sentence
- Sign off: —Arden`,
      messages: [{
        role: 'user',
        content: `Evening data:\n${JSON.stringify(payload, null, 2)}`,
      }],
    }),
  })

  const data = await res.json()
  if (data.type === 'error') throw new Error(data.error?.message ?? JSON.stringify(data.error))
  const summary = data.content[0].text
  localStorage.setItem(CACHE_KEY, JSON.stringify({ date: todayStr, summary }))
  return summary
}
