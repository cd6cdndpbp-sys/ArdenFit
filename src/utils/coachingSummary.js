import { getTomorrowsPlan, getWeightTarget, getCurrentPhase } from './trainingPlan'

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
    if (hours != null && hours < 5.5) count++
    else break
  }
  return count
}

function buildPayload(healthData) {
  const phase = getCurrentPhase()
  const tomorrow = getTomorrowsPlan()
  const tomorrowDesc = tomorrow
    ? tomorrow.type === 'rest'
      ? 'Rest day'
      : tomorrow.type === 'incline_walk'
        ? `${tomorrow.label} — ${tomorrow.duration} min at ${tomorrow.inclineMin}-${tomorrow.inclineMax}% incline`
        : tomorrow.type === 'flexibility'
          ? `${tomorrow.label} — ${tomorrow.duration} min`
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
    nightsUnder6:            healthData.weekSummary?.nightsUnder6 ?? null,
    consecutivePoorNights:   poorNights,
    hrvToday:                healthData.hrv ?? null,
    hrvBaseline,
    restingHR:               healthData.restingHR ?? null,
    hrBaseline,
    workoutComplete:         healthData.todayWorkoutComplete,
    exerciseMinutes:         healthData.exerciseToday ?? null,
    workoutsThisWeek:        healthData.weekSummary?.workoutsCompleted ?? null,
    currentWeight:           healthData.currentWeight ?? null,
    weightTarget:            getWeightTarget(healthData.currentWeight)?.targetWeight ?? null,
    weightTargetDate:        getWeightTarget(healthData.currentWeight)?.targetDate ?? null,
    dailyCalorieTarget:      phase.calorieMin != null && phase.calorieMax != null
      ? `${phase.calorieMin.toLocaleString()}-${phase.calorieMax.toLocaleString()}`
      : null,
    dailyProteinTarget:      phase.proteinMin ?? null,
    dailyStepFloor:          5000,
    stepsToday:              healthData.steps ?? null,
    stepFloorMet:            (healthData.steps ?? 0) >= 5000,
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
  const phase = getCurrentPhase()
  const weightTarget = getWeightTarget(healthData.currentWeight)
  const weightTargetDateFmt = weightTarget?.targetDate
    ? new Date(weightTarget.targetDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : weightTarget?.targetDate

  const res = await fetch('http://192.168.1.221:3001/api/coaching', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: `You are Arden — a training partner and coach inside a personal fitness dashboard. Write an evening summary for one specific person. You know them well. Be direct, clear-eyed, and supportive.

HARD CONSTRAINTS — never violate:
- Condition: FSHD (facioscapulohumeral muscular dystrophy)
- Running is permitted — do not restrict pace, incline, or surface
- No overhead movements
- No jumping, explosive, or ballistic movements
- Balance exercises require wall/chair support nearby
- Equipment: 5 lb dumbbells, resistance bands, yoga mat, treadmill
- Fatigue appears post-activity — sessions end before perceived limit
- Schedule: up at 0400, bed at 2100

CURRENT PHASE: Phase 1 — weight loss + movement habit
- Weight target: ${weightTarget?.targetWeight} lbs by ${weightTargetDateFmt} (${weightTarget?.weeklyTarget} lbs/week from ${phase.weightBaseline} lbs baseline)
- Calorie target: ${payload.dailyCalorieTarget} cal/day
- Protein target: ${payload.dailyProteinTarget}g/day minimum — most important nutrition variable
- Step floor: 5,000 steps/day minimum before any stretch goal
- Priority order: sleep > protein > step floor > movement habit > pace
- Pace and finish time are irrelevant in Phase 1 — do not mention them

KEY HABITS BEING BUILT:
- Morning protein shake with 2 scoops whey by 0700
- After-work walk immediately on arriving home (clothes staged night before)
- Daily protein logging in MyFitnessPal

DECISION LOGIC — apply before writing:
- Sleep < 5h OR consecutive poor nights >= 3: recovery only tomorrow, say so plainly
- Sleep 5–5.5h: reduced session tomorrow, name what that means
- Sleep 5.5–6.5h: normal session
- Sleep 6.5h+: full session, can push slightly
- HRV today 10%+ below baseline: back off tomorrow regardless of sleep
- Resting HR 10%+ above baseline: flag it, back off tomorrow
- stepFloorMet = false: mention it once, without guilt
- stepFloorMet = true: acknowledge it if steps were notably high

STRUCTURE — hard limit 3 sentences, no exceptions:
1. Week arc in one sentence: sleep average, HRV vs baseline, what it means. No more than this.
2. Tomorrow in one sentence: name the session, one adjustment if warranted. Nothing else.
3. One line for tonight if relevant — protein, sleep, step floor. Optional.
Total response must be under 100 words. Cut ruthlessly.

VOICE:
- Training partner who has seen the data and has something real to say
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

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? err.error ?? `HTTP ${res.status}`)
  }
  const data = await res.json()
  if (data.type === 'error') throw new Error(data.error?.message ?? JSON.stringify(data.error))
  if (!data.content?.[0]?.text) throw new Error(`Unexpected response: ${JSON.stringify(data)}`)
  const summary = data.content[0].text
  localStorage.setItem(CACHE_KEY, JSON.stringify({ date: todayStr, summary }))
  return summary
}
