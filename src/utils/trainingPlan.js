import { getWorkoutLogs } from './workoutLogger'

const PLAN_START = '2026-05-29'
const RACE_DATE  = '2027-05-17'

export const CALORIE_MIN  = 1600
export const CALORIE_MAX  = 1700
export const PROTEIN_MIN  = 120

function fmtLocalDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return fmtLocalDate(d)
}

// Reused across phases for FSHD-safe strength days — see workoutGenerator.js EXERCISES,
// which reads `strengthGroup` directly off the day's plan entry.
const STRENGTH_A = { type: 'strength', label: 'Strength A — Lower Body',        duration: 35, strengthGroup: 'A' }
const STRENGTH_B = { type: 'strength', label: 'Strength B — Upper Body + Core', duration: 35, strengthGroup: 'B' }
const FULL_REST  = { type: 'rest', label: 'Full Rest', duration: 0 }

// --- Base Rebuild: open-ended, no race anchor -------------------------------------------
// Runs a rolling 4-week block. Each block's starting run duration/ratio is fixed internally
// (up to 10% increase per week). Interval sessions (2:1/3:1/4:1) are capped at
// BASE_REBUILD_MAX_DURATION, matching the original "run/walk intervals, <=30 min" spec.
// Once a week is genuinely continuous (no walk breaks), duration keeps progressing at the
// same 10%/week rate past that cap, up to PHASE3_READY_MIN_CONTINUOUS_MIN — this is a
// deliberate coupling: the plan is designed to build exactly toward Phase 3's own readiness
// bar (see isPhase3Ready() below), not an arbitrary higher number. The STARTING point of the
// next block depends on the completion rate of the block before it — strong adherence
// continues the progression from where the last block left off, weak adherence resets to
// that block's own starting duration rather than advancing further.
const BASE_REBUILD_START           = '2026-08-29'
const BASE_REBUILD_BLOCK_WEEKS     = 4
const BASE_REBUILD_START_DURATION  = 20
const BASE_REBUILD_MAX_DURATION    = 30
const BASE_REBUILD_WEEKLY_INCREASE = 0.10
const BASE_REBUILD_ADHERENCE_CUTOFF = 0.75

function baseRebuildRunWalkRatio(durationMin) {
  if (durationMin <= 22) return '2:1'
  if (durationMin <= 26) return '3:1'
  if (durationMin < BASE_REBUILD_MAX_DURATION) return '4:1'
  return null // continuous — reached once interval progression tops out at the interval cap
}

function baseRebuildRunDay(durationMin) {
  return { type: 'run', label: 'Run', durationMin, runWalkRatio: baseRebuildRunWalkRatio(durationMin) }
}

function buildBaseRebuildBlock(blockStartDate, startDuration) {
  const weeks = []
  let duration = startDuration
  for (let w = 0; w < BASE_REBUILD_BLOCK_WEEKS; w++) {
    if (w > 0) {
      // Once continuous (already at/above the interval cap), keep climbing toward the higher
      // continuous ceiling instead of holding flat at the interval cap forever.
      const weeklyCap = duration >= BASE_REBUILD_MAX_DURATION ? PHASE3_READY_MIN_CONTINUOUS_MIN : BASE_REBUILD_MAX_DURATION
      duration = Math.min(weeklyCap, Math.floor(duration * (1 + BASE_REBUILD_WEEKLY_INCREASE)))
    }
    const runDay = baseRebuildRunDay(duration)
    weeks.push({
      startDate: addDays(blockStartDate, w * 7),
      endDate:   addDays(blockStartDate, w * 7 + 6),
      weeklyTargets: {
        Mon: runDay,
        Tue: STRENGTH_A,
        Wed: runDay,
        Thu: STRENGTH_B,
        Fri: runDay,
        Sat: FULL_REST,
        Sun: FULL_REST,
      },
    })
  }
  return weeks
}

// Adherence proxy: completed workouts logged within the block's date range, out of the
// 20 planned sessions (4 weeks x 5 run/strength days — Sat/Sun are rest, not planned).
function completionRateForRange(startDate, endDate) {
  const plannedSessions = BASE_REBUILD_BLOCK_WEEKS * 5
  const completed = getWorkoutLogs().filter(l => l.date >= startDate && l.date <= endDate && l.completed).length
  return Math.min(1, completed / plannedSessions)
}

function getBaseRebuildWeekBlocks() {
  const lookahead = addDays(fmtLocalDate(new Date()), 1) // cover tomorrow's plan too

  let blockStart = BASE_REBUILD_START
  let duration    = BASE_REBUILD_START_DURATION
  const allWeeks  = []

  while (true) {
    const block = buildBaseRebuildBlock(blockStart, duration)
    allWeeks.push(...block)
    const blockEnd = block[block.length - 1].endDate
    if (blockEnd >= lookahead) break

    const completionRate = completionRateForRange(blockStart, blockEnd)
    const blockStartDuration = block[0].weeklyTargets.Mon.durationMin
    const blockEndDuration   = block[block.length - 1].weeklyTargets.Mon.durationMin
    duration    = completionRate >= BASE_REBUILD_ADHERENCE_CUTOFF ? blockEndDuration : blockStartDuration
    blockStart  = addDays(blockEnd, 1)
  }

  return allWeeks
}

// --- Phase 3 readiness: data-driven replacement for a hardcoded transition date ----------
const PHASE3_READY_MIN_BLOCKS         = 3
const PHASE3_READY_MIN_CONTINUOUS_MIN = 40 // independent of BASE_REBUILD_MAX_DURATION — different
                                            // threshold, different purpose, kept separately named
                                            // and changeable rather than reusing the plan's own cap
export const PHASE3_ACTIVATION_KEY = 'ardenfit_phase3_activated_date' // exported for useHealthData's hydration check

// Derives completed (endDate already in the past) Base Rebuild block date ranges from the
// same flattened week array getBaseRebuildWeekBlocks() already generates, rather than
// re-deriving block boundaries separately.
function getCompletedBaseRebuildBlockRanges() {
  const weeks = getBaseRebuildWeekBlocks()
  const today = fmtLocalDate(new Date())
  const ranges = []
  for (let i = 0; i + BASE_REBUILD_BLOCK_WEEKS <= weeks.length; i += BASE_REBUILD_BLOCK_WEEKS) {
    const blockWeeks = weeks.slice(i, i + BASE_REBUILD_BLOCK_WEEKS)
    const endDate = blockWeeks[blockWeeks.length - 1].endDate
    if (endDate < today) ranges.push({ startDate: blockWeeks[0].startDate, endDate })
  }
  return ranges
}

// Longest continuous (runWalkRatio === null, strictly — undefined means the log predates
// this field and carries no signal) completed run logged within the range, in minutes.
function longestContinuousRunMinutes(startDate, endDate) {
  const runs = getWorkoutLogs().filter(l =>
    l.date >= startDate && l.date <= endDate &&
    l.completed && l.type === 'Run' && l.runWalkRatio === null
  )
  return runs.reduce((max, l) => Math.max(max, l.actualDuration ?? 0), 0)
}

// Phase 3 readiness: the 3 most recently completed Base Rebuild blocks each hit the
// adherence cutoff, AND the most recent completed block has a continuous run reaching
// PHASE3_READY_MIN_CONTINUOUS_MIN — reachable via buildBaseRebuildBlock()'s continuous-tier
// progression (see the comment above BASE_REBUILD_START), which climbs past the interval cap
// toward this exact value once a block goes continuous — not an arbitrary higher number.
export function isPhase3Ready() {
  const completedBlocks = getCompletedBaseRebuildBlockRanges()
  if (completedBlocks.length < PHASE3_READY_MIN_BLOCKS) return false

  const recentBlocks = completedBlocks.slice(-PHASE3_READY_MIN_BLOCKS)
  const adherenceOk  = recentBlocks.every(b => completionRateForRange(b.startDate, b.endDate) >= BASE_REBUILD_ADHERENCE_CUTOFF)
  if (!adherenceOk) return false

  const mostRecent = recentBlocks[recentBlocks.length - 1]
  return longestContinuousRunMinutes(mostRecent.startDate, mostRecent.endDate) >= PHASE3_READY_MIN_CONTINUOUS_MIN
}

function phaseStateApiUrl() {
  return window.location.hostname === 'localhost'
    ? 'http://localhost:3001/api/phase-state'
    : 'http://192.168.1.221:3001/api/phase-state'
}

// One-way door: once isPhase3Ready() first returns true, persist today's date so a later
// dip in adherence can't flip the transition back off. Returns null (Phase 3 stays inactive)
// until then. Stays synchronous — localStorage first, then isPhase3Ready() — the durable
// server copy is read separately via a one-time hydration check in useHealthData that writes
// into localStorage before this ever runs; this function only ever needs to WRITE through.
function getPhase3StartDate() {
  try {
    const stored = localStorage.getItem(PHASE3_ACTIVATION_KEY)
    if (stored) return stored
  } catch {}

  if (!isPhase3Ready()) return null

  const today = fmtLocalDate(new Date())
  try { localStorage.setItem(PHASE3_ACTIVATION_KEY, today) } catch {}
  try {
    fetch(phaseStateApiUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phase3ActivatedDate: today }),
    }).catch(() => {}) // best-effort — localStorage write above is what actually gates the app
  } catch {}
  return today
}

const PHASES = [
  {
    id: 1,
    name: 'Weight Loss Priority',
    shortName: 'Phase 1',
    startDate: '2026-05-29',
    endDate: '2026-08-09',
    goal: 'Lose to 159 lbs (1.5 lbs/week from 168.4 lbs baseline). Begin aerobic base overlap.',
    colorKey: 'amber',
    calorieMin: CALORIE_MIN,
    calorieMax: CALORIE_MAX,
    proteinMin: PROTEIN_MIN,
    weightTarget: 159,
    weightBaseline: 168.4,
    weeklyStructure: {
      Mon: { type: 'strength', label: 'Lower Body Strength',   duration: 35 },
      Tue: { type: 'walk',     label: 'Short Walk',            distance: 2.5, speed: '3.0-3.2 mph' },
      Wed: { type: 'strength', label: 'Upper Body + Core',     duration: 35 },
      Thu: { type: 'walk',     label: 'Short Walk',            distance: 3.0, speed: '3.0-3.2 mph' },
      Fri: { type: 'rest',     label: 'Rest or Light Stretch', duration: 15 },
      Sat: { type: 'walk',     label: 'Medium Walk',           distance: 3.5, speed: '3.0-3.3 mph' },
      Sun: { type: 'rest',     label: 'Full Rest',             duration: 0 },
    },
    nutritionNote:   `Target ${CALORIE_MIN.toLocaleString()}-${CALORIE_MAX.toLocaleString()} cal/day. Minimum ${PROTEIN_MIN}g protein.`,
    progressionNote: 'Add 0.25mi to Saturday walk every 2 weeks. Deficit continues through Aug 9 while aerobic base builds concurrently.',
  },
  {
    id: 2,
    name: 'Base Rebuild',
    shortName: 'Base Rebuild',
    startDate: BASE_REBUILD_START,
    endDate: null, // open-ended — no race anchor, superseded whenever the next phase's startDate arrives
    goal: 'Open-ended running rebuild + fat loss, no race anchor. Run/walk intervals 3x/week from 20 min, FSHD-safe strength 2x/week.',
    colorKey: 'teal',
    calorieMin: CALORIE_MIN,
    calorieMax: CALORIE_MAX,
    proteinMin: PROTEIN_MIN,
    weekBlocksFn: getBaseRebuildWeekBlocks,
    nutritionNote:   `Target ${CALORIE_MIN.toLocaleString()}-${CALORIE_MAX.toLocaleString()} cal/day. Minimum ${PROTEIN_MIN}g protein.`,
    progressionNote: 'Rolling 4-week blocks, up to 10% run-volume increase per week, capped at 30 min. Next block\'s starting point depends on the prior block\'s completion rate — strong adherence continues progressing, weak adherence resets to that block\'s starting volume.',
  },
  {
    id: 3,
    name: 'Distance Build',
    shortName: 'Phase 3',
    // startDate is null — activation is data-driven via startDateFn/isPhase3Ready(), not a
    // hardcoded calendar date. getCurrentPhase() only falls back to startDateFn() when
    // startDate itself is null, so setting a real date here still works as a manual override.
    startDate: null,
    startDateFn: getPhase3StartDate,
    endDate: '2026-12-31',
    goal: 'Long walk 6mi → 8mi. Comfortable at 3.5-3.8 mph.',
    colorKey: 'blue',
    calorieMin: null,
    calorieMax: null,
    proteinMin: null,
    weeklyStructure: {
      Mon: { type: 'walk',     label: 'Easy Walk',             distance: 3.0, speed: '3.2-3.4 mph' },
      Tue: { type: 'strength', label: 'Full Body Strength',    duration: 40 },
      Wed: { type: 'walk',     label: 'Pace Walk',             distance: 3.5, speed: '3.4-3.6 mph' },
      Thu: { type: 'rest',     label: 'Rest or Light Stretch', duration: 15 },
      Fri: { type: 'walk',     label: 'Easy Walk',             distance: 2.5, speed: '3.2-3.4 mph' },
      Sat: { type: 'walk',     label: 'Long Walk',             distance: 6.0, speed: '3.0-3.3 mph' },
      Sun: { type: 'rest',     label: 'Full Rest',             duration: 0 },
    },
    nutritionNote:   'Eat enough to support training. Protein stays at 120g+ minimum.',
    progressionNote: 'Increase Saturday long walk by 0.5mi every 2 weeks until 8mi.',
  },
  {
    id: 4,
    name: 'Race Prep',
    shortName: 'Phase 4',
    startDate: '2027-01-01',
    endDate: '2027-04-27',
    goal: 'Long walk 10-11mi. Consistent 3.6-4.0 mph. Race-ready.',
    colorKey: 'purple',
    calorieMin: null,
    calorieMax: null,
    proteinMin: null,
    weeklyStructure: {
      Mon: { type: 'walk',     label: 'Easy Walk',          distance: 3.0, speed: '3.3-3.5 mph' },
      Tue: { type: 'strength', label: 'Lower Body Strength', duration: 40 },
      Wed: { type: 'walk',     label: 'Pace Walk',          distance: 4.0, speed: '3.6-3.8 mph' },
      Thu: { type: 'rest',     label: 'Rest',               duration: 0 },
      Fri: { type: 'walk',     label: 'Easy Walk',          distance: 3.0, speed: '3.3-3.5 mph' },
      Sat: { type: 'walk',     label: 'Long Walk',          distance: 8.0, speed: '3.3-3.5 mph' },
      Sun: { type: 'rest',     label: 'Full Rest',          duration: 0 },
    },
    nutritionNote:   'Race weight target: 155 lbs. Fuel long walks properly.',
    progressionNote: 'Build Saturday long walk to 11mi by April. One cutback week per month.',
  },
  {
    id: 5,
    name: 'Taper',
    shortName: 'Taper',
    startDate: '2027-04-28',
    endDate: '2027-05-16',
    goal: 'Fresh legs on race day. Trust the training.',
    colorKey: 'green',
    calorieMin: null,
    calorieMax: null,
    proteinMin: null,
    weeklyStructure: {
      Mon: { type: 'walk', label: 'Easy Walk',       distance: 2.0, speed: '3.0-3.2 mph' },
      Tue: { type: 'rest', label: 'Rest',            duration: 0 },
      Wed: { type: 'walk', label: 'Short Walk',      distance: 2.0, speed: '3.0-3.2 mph' },
      Thu: { type: 'rest', label: 'Rest',            duration: 0 },
      Fri: { type: 'walk', label: 'Very Short Walk', distance: 1.5, speed: '3.0 mph' },
      Sat: { type: 'rest', label: 'Rest',            duration: 0 },
      Sun: { type: 'rest', label: 'Full Rest',       duration: 0 },
    },
    nutritionNote:   'Sleep is the priority. Eat well. No new foods race week.',
    progressionNote: 'Cut volume 30% week 1, 50% week 2, rest race week.',
  },
]

// Phases are date-partitioned in array order — walk them in sequence and stop advancing at
// the first phase whose effective startDate is null (not yet active — either a hardcoded
// null awaiting a manual date, or a null resolved dynamically via startDateFn, e.g. Phase 3's
// data-driven isPhase3Ready() check) or still in the future. This means a later phase's
// startDate is only ever honored once every earlier phase in the array has itself gone
// active — a phase can never be silently reached by its own date alone while an earlier
// phase is still pending. Structural, not special-cased to any one phase, so this also
// protects Taper (or anything added after it) from the same class of bug.
export function getCurrentPhase() {
  const todayStr = fmtLocalDate(new Date())
  let current = PHASES[0]
  for (const phase of PHASES) {
    const startDate = phase.startDate ?? (phase.startDateFn ? phase.startDateFn() : null)
    if (startDate == null || todayStr < startDate) break
    current = phase
  }
  return current
}

// Phases with `weekBlocks` (static) or `weekBlocksFn` (dynamically generated, e.g. Base
// Rebuild's rolling blocks) vary their weekly targets week to week; everything else uses
// one flat `weeklyStructure` for the whole phase.
function getStructureForDate(phase, date) {
  const blocks = phase.weekBlocksFn ? phase.weekBlocksFn() : phase.weekBlocks
  if (blocks) {
    const dateStr = fmtLocalDate(date)
    const block   = blocks.find(b => dateStr >= b.startDate && dateStr <= b.endDate)
    return block ? block.weeklyTargets : null
  }
  return phase.weeklyStructure
}

function getPlanForDate(date) {
  const phase     = getCurrentPhase()
  const structure = getStructureForDate(phase, date)
  const dayKey    = date.toLocaleDateString('en-US', { weekday: 'long' }).slice(0, 3)
  const day       = structure?.[dayKey]
  if (!day) return null
  return {
    ...day,
    phase:         phase.shortName,
    phaseName:     phase.name,
    phaseGoal:     phase.goal,
    nutritionNote: phase.nutritionNote,
  }
}

export function getTodaysPlan() {
  return getPlanForDate(new Date())
}

export function getTomorrowsPlan() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return getPlanForDate(tomorrow)
}

export function getWeekPlan() {
  const phase     = getCurrentPhase()
  const structure = getStructureForDate(phase, new Date())
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
    day,
    ...structure?.[day],
  }))
}

export function getPhaseProgress() {
  const phase = getCurrentPhase()
  if (!phase.endDate) return null // open-ended phase — no fixed span to measure progress against
  const today   = new Date()
  today.setHours(0, 0, 0, 0)
  const start   = new Date(phase.startDate)
  const end     = new Date(phase.endDate)
  const total   = (end - start) / (1000 * 60 * 60 * 24)
  const elapsed = (today - start) / (1000 * 60 * 60 * 24)
  return Math.max(2, Math.min(98, Math.round((elapsed / total) * 100)))
}

export function getWeightTarget(currentWeight) {
  const today         = new Date()
  today.setHours(0, 0, 0, 0)
  const raceDayTarget = 155
  const currentPhase  = getCurrentPhase()
  const targetWeight  = 159
  const weeklyTarget  = 1.5

  if (currentPhase.id >= 4) {
    return {
      targetWeight: raceDayTarget,
      targetDate:   'Race day',
      note:         'Race weight target: 155 lbs',
    }
  }

  if (currentWeight != null) {
    const lbsRemaining = Math.max(0, Math.round((currentWeight - targetWeight) * 10) / 10)
    if (lbsRemaining === 0) {
      return {
        targetWeight,
        targetDate:   fmtLocalDate(today),
        daysToTarget: 0,
        weeklyTarget,
        lbsRemaining: 0,
        note: 'Goal reached!',
      }
    }
    const weeksNeeded   = lbsRemaining / weeklyTarget
    const daysNeeded    = Math.ceil(weeksNeeded * 7)
    const projectedDate = new Date(today)
    projectedDate.setDate(projectedDate.getDate() + daysNeeded)
    return {
      targetWeight,
      targetDate:   fmtLocalDate(projectedDate),
      daysToTarget: daysNeeded,
      weeklyTarget,
      lbsRemaining,
      note:         `~${weeklyTarget} lbs/week needed · projected from current pace`,
    }
  }

  return {
    targetWeight,
    targetDate:   null,
    daysToTarget: null,
    weeklyTarget,
    note:         `~${weeklyTarget} lbs/week toward ${targetWeight} lbs (no current weight data)`,
  }
}

export { PHASES, PLAN_START, RACE_DATE }
