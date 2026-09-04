const CALORIE_MIN  = 1600
const CALORIE_MAX  = 1700
const PROTEIN_MIN  = 120

function fmtLocalDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return fmtLocalDate(d)
}

// Reused across phases for FSHD-safe strength days.
const STRENGTH_A = { type: 'strength', label: 'Strength A — Lower Body',        duration: 35, strengthGroup: 'A' }
const STRENGTH_B = { type: 'strength', label: 'Strength B — Upper Body + Core', duration: 35, strengthGroup: 'B' }
const FULL_REST  = { type: 'rest', label: 'Full Rest', duration: 0 }

// Race Build/Base Rebuild (run intervals), Phase 3 (Distance Build), Phase 4 (Race Prep),
// and their isPhase3Ready() activation gate were removed Sept 2026 — races dropped as a
// training goal. See RECOMP_PHASE below, the single open-ended phase that replaces them.

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
    name: 'Recomp & Flexibility',
    shortName: 'Recomp & Flex',
    startDate: '2026-09-02',
    endDate: null, // open-ended — no race anchor
    goal: 'Body recomposition + flexibility, no race goal. Incline treadmill walks 3x/week + an extended Saturday walk, FSHD-safe strength 2x/week, dedicated flexibility work.',
    colorKey: 'teal',
    calorieMin: CALORIE_MIN,
    calorieMax: CALORIE_MAX,
    proteinMin: PROTEIN_MIN,
    weeklyStructure: {
      Mon: { type: 'incline_walk', label: 'Incline Walk',          duration: 30, inclineMin: 3, inclineMax: 6 },
      Tue: STRENGTH_A,
      Wed: { type: 'incline_walk', label: 'Incline Walk',          duration: 30, inclineMin: 3, inclineMax: 6, flexibilityAppend: 10 },
      Thu: STRENGTH_B,
      Fri: { type: 'incline_walk', label: 'Incline Walk',          duration: 30, inclineMin: 3, inclineMax: 6 },
      Sat: { type: 'incline_walk', label: 'Extended Incline Walk', duration: 45, inclineMin: 3, inclineMax: 6, extended: true },
      Sun: { type: 'flexibility',  label: 'Flexibility',           duration: 20 },
    },
    nutritionNote:   `Target ${CALORIE_MIN.toLocaleString()}-${CALORIE_MAX.toLocaleString()} cal/day. Minimum ${PROTEIN_MIN}g protein.`,
    progressionNote: 'Increase walk duration by 5 min/week OR incline by 1%/1-2 weeks — never both the same week. Deload every 4th week: cut walk duration ~30% and drop Sunday flexibility.',
  },
]

// Phases are date-partitioned in array order — walk them in sequence and stop advancing at
// the first phase whose effective startDate is null (not yet active — either a hardcoded
// null awaiting a manual date, or a null resolved dynamically via startDateFn, for a phase
// with data-driven activation) or still in the future. This means a later phase's
// startDate is only ever honored once every earlier phase in the array has itself gone
// active — a phase can never be silently reached by its own date alone while an earlier
// phase is still pending. Structural, not special-cased to any one phase.
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

// Phases with `weekBlocks` (static) or `weekBlocksFn` (dynamically generated) vary their
// weekly targets week to week; everything else uses one flat `weeklyStructure` for the
// whole phase. No current phase uses the dynamic form — kept generic for a future phase that
// might need it.
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

// Flat target — RECOMP_PHASE is the only phase left with an active weight goal, so there's
// no phase-transition step-down and no date to project toward, just one number.
export function getWeightTarget(currentWeight) {
  const targetWeight = 155
  const weeklyTarget = 1.5
  const lbsRemaining = currentWeight != null
    ? Math.max(0, Math.round((currentWeight - targetWeight) * 10) / 10)
    : null

  return {
    targetWeight,
    targetDate:   null,
    daysToTarget: null,
    weeklyTarget,
    lbsRemaining,
    note: currentWeight == null
      ? `~${weeklyTarget} lbs/week toward ${targetWeight} lbs (no current weight data)`
      : lbsRemaining === 0
        ? 'Goal reached!'
        : `~${weeklyTarget} lbs/week toward ${targetWeight} lbs`,
  }
}

export { PHASES }
