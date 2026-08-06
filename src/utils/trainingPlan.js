const PLAN_START = '2026-05-29'
const RACE_DATE  = '2027-05-17'

function fmtLocalDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

// Race Build strength days (Tue/Thu) reuse the same FSHD-safe exercise groups
// as Phase 1/3/4's Mon/Wed strength days — see workoutGenerator.js EXERCISES.
const STRENGTH_A = { type: 'strength', label: 'Strength A — Lower Body',        duration: 35, strengthGroup: 'A' }
const STRENGTH_B = { type: 'strength', label: 'Strength B — Upper Body + Core', duration: 35, strengthGroup: 'B' }
const RACE_BUILD_REST = { type: 'rest', label: 'Full Rest', duration: 0 }

const RACE_BUILD_WEEKS = [
  { // Week 1
    startDate: '2026-08-10', endDate: '2026-08-16',
    weeklyTargets: {
      Mon: { type: 'run', label: 'Run', durationMin: 20, runWalkRatio: '2:1' },
      Tue: STRENGTH_A,
      Wed: { type: 'run', label: 'Run', durationMin: 20, runWalkRatio: '2:1' },
      Thu: STRENGTH_B,
      Fri: { type: 'run', label: 'Run', durationMin: 25, runWalkRatio: '3:1' },
      Sat: { type: 'run', label: 'Long Run', distance: 3, runWalkRatio: null },
      Sun: RACE_BUILD_REST,
    },
  },
  { // Week 2
    startDate: '2026-08-17', endDate: '2026-08-23',
    weeklyTargets: {
      Mon: { type: 'run', label: 'Run', durationMin: 25, runWalkRatio: '3:1' },
      Tue: STRENGTH_A,
      Wed: { type: 'run', label: 'Run', durationMin: 25, runWalkRatio: '3:1' },
      Thu: STRENGTH_B,
      Fri: { type: 'run', label: 'Run', durationMin: 30, runWalkRatio: '4:1' },
      Sat: { type: 'run', label: 'Long Run', distance: 4, runWalkRatio: null },
      Sun: RACE_BUILD_REST,
    },
  },
  { // Week 3 — continuous running begins
    startDate: '2026-08-24', endDate: '2026-08-30',
    weeklyTargets: {
      Mon: { type: 'run', label: 'Run', durationMin: 30, runWalkRatio: null },
      Tue: STRENGTH_A,
      Wed: { type: 'run', label: 'Run', durationMin: 30, runWalkRatio: null },
      Thu: STRENGTH_B,
      Fri: { type: 'run', label: 'Run', durationMin: 35, runWalkRatio: null },
      Sat: { type: 'run', label: 'Long Run', distance: 5, runWalkRatio: null },
      Sun: RACE_BUILD_REST,
    },
  },
  { // Week 4 — cutback
    startDate: '2026-08-31', endDate: '2026-09-06',
    weeklyTargets: {
      Mon: { type: 'run', label: 'Run', durationMin: 25, runWalkRatio: null },
      Tue: STRENGTH_A,
      Wed: { type: 'run', label: 'Run', durationMin: 25, runWalkRatio: null },
      Thu: STRENGTH_B,
      Fri: { type: 'run', label: 'Run', durationMin: 30, runWalkRatio: null },
      Sat: { type: 'run', label: 'Long Run', distance: 4, runWalkRatio: null },
      Sun: RACE_BUILD_REST,
    },
  },
  { // Week 5
    startDate: '2026-09-07', endDate: '2026-09-13',
    weeklyTargets: {
      Mon: { type: 'run', label: 'Run', durationMin: 30, runWalkRatio: null },
      Tue: STRENGTH_A,
      Wed: { type: 'run', label: 'Run', durationMin: 35, runWalkRatio: null },
      Thu: STRENGTH_B,
      Fri: { type: 'run', label: 'Run', durationMin: 30, runWalkRatio: null },
      Sat: { type: 'run', label: 'Long Run', distance: 6, runWalkRatio: null },
      Sun: RACE_BUILD_REST,
    },
  },
  { // Week 6
    startDate: '2026-09-14', endDate: '2026-09-20',
    weeklyTargets: {
      Mon: { type: 'run', label: 'Run', durationMin: 35, runWalkRatio: null },
      Tue: STRENGTH_A,
      Wed: { type: 'run', label: 'Run', durationMin: 35, runWalkRatio: null },
      Thu: STRENGTH_B,
      Fri: { type: 'run', label: 'Run', durationMin: 30, runWalkRatio: null },
      Sat: { type: 'run', label: 'Long Run', distance: 7, runWalkRatio: null },
      Sun: RACE_BUILD_REST,
    },
  },
  { // Week 7 — peak
    startDate: '2026-09-21', endDate: '2026-09-27',
    weeklyTargets: {
      Mon: { type: 'run', label: 'Run', durationMin: 40, runWalkRatio: null },
      Tue: STRENGTH_A,
      Wed: { type: 'run', label: 'Run', durationMin: 40, runWalkRatio: null },
      Thu: STRENGTH_B,
      Fri: { type: 'run', label: 'Run', durationMin: 25, runWalkRatio: null },
      Sat: { type: 'run', label: 'Long Run', distance: 8, runWalkRatio: null },
      Sun: RACE_BUILD_REST,
    },
  },
  { // Week 8 — taper
    startDate: '2026-09-28', endDate: '2026-10-04',
    weeklyTargets: {
      Mon: { type: 'run', label: 'Run', durationMin: 30, runWalkRatio: null },
      Tue: STRENGTH_A,
      Wed: { type: 'run', label: 'Run', durationMin: 30, runWalkRatio: null },
      Thu: STRENGTH_B,
      Fri: { type: 'run', label: 'Run', durationMin: 20, runWalkRatio: null },
      Sat: { type: 'run', label: 'Long Run', distance: 5, runWalkRatio: null },
      Sun: RACE_BUILD_REST,
    },
  },
  { // Week 9 — race week (race falls on Sunday, not the usual Saturday long-run slot)
    startDate: '2026-10-05', endDate: '2026-10-11',
    weeklyTargets: {
      Mon: { type: 'run', label: 'Run',           durationMin: 20, runWalkRatio: null },
      Tue: STRENGTH_A,
      Wed: { type: 'run', label: 'Shakeout Run',  durationMin: 15, runWalkRatio: null },
      Thu: STRENGTH_B,
      Fri: { type: 'run', label: 'Easy Run + Strides', durationMin: 15, runWalkRatio: null, strides: true },
      Sat: { type: 'rest', label: 'Rest — day before race', duration: 0 },
      Sun: { type: 'run', label: 'Race Day', distance: 10, runWalkRatio: null, raceDay: true },
    },
  },
]

const PHASES = [
  {
    id: 1,
    name: 'Weight Loss Priority',
    shortName: 'Phase 1',
    startDate: '2026-05-29',
    endDate: '2026-08-09',
    goal: 'Lose to 159 lbs (1.5 lbs/week from 168.4 lbs baseline). Begin aerobic base overlap.',
    colorKey: 'amber',
    calorieMin: 1600,
    calorieMax: 1700,
    proteinMin: 120,
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
    nutritionNote:   'Target 1,600-1,700 cal/day. Minimum 120g protein.',
    progressionNote: 'Add 0.25mi to Saturday walk every 2 weeks. Deficit continues through Aug 9 while aerobic base builds concurrently.',
  },
  {
    id: 2,
    name: 'Race Build — 10-Mile Tune-Up',
    shortName: 'Race Build',
    startDate: '2026-08-10',
    endDate: '2026-10-11',
    goal: '9-week build for the 10-Mile Tune-Up Race on 10/11. Mon/Wed/Fri run, Tue/Thu strength, Sat long run.',
    colorKey: 'red',
    calorieMin: null,
    calorieMax: null,
    proteinMin: null,
    weekBlocks: RACE_BUILD_WEEKS,
    nutritionNote:   'Fuel long runs — light carbs beforehand, protein + carbs within an hour after.',
    progressionNote: 'Run/walk intervals through week 2, continuous running from week 3 on. Peak week 7, taper weeks 8-9, race 10/11.',
  },
  // Original Phase 2 ("Base Build," 8/26–9/30, walk-based) was deleted, not shifted: Race Build
  // (8/10–10/11) fully supersedes and exceeds its date range, leaving no remaining window for it to own.
  {
    id: 3,
    name: 'Distance Build',
    shortName: 'Phase 3',
    startDate: '2026-10-12',
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

export function getCurrentPhase() {
  const todayStr = fmtLocalDate(new Date())
  return PHASES.find(p => todayStr >= p.startDate && todayStr <= p.endDate) || PHASES[0]
}

// Phases with `weekBlocks` (currently just Race Build) vary their weekly targets
// week to week; everything else uses one flat `weeklyStructure` for the whole phase.
function getStructureForDate(phase, date) {
  if (phase.weekBlocks) {
    const dateStr = fmtLocalDate(date)
    const block   = phase.weekBlocks.find(b => dateStr >= b.startDate && dateStr <= b.endDate)
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
  const phase   = getCurrentPhase()
  const today   = new Date()
  today.setHours(0, 0, 0, 0)
  const start   = new Date(phase.startDate)
  const end     = new Date(phase.endDate)
  const total   = (end - start) / (1000 * 60 * 60 * 24)
  const elapsed = (today - start) / (1000 * 60 * 60 * 24)
  return Math.max(2, Math.min(98, Math.round((elapsed / total) * 100)))
}

export function getWeightTarget(currentWeight) {
  const today          = new Date()
  today.setHours(0, 0, 0, 0)
  const phase1EndStr   = PHASES[0].endDate
  const phase1End      = new Date(phase1EndStr + 'T00:00:00')
  const raceDayTarget  = 155
  const currentPhase   = getCurrentPhase()
  const targetWeight   = 159
  const weeklyTarget   = 1.5

  if (currentPhase.id === 1 || fmtLocalDate(today) <= phase1EndStr) {
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
        targetDate:     fmtLocalDate(projectedDate),
        daysToTarget:   daysNeeded,
        weeklyTarget,
        lbsRemaining,
        onOriginalPace: fmtLocalDate(projectedDate) <= phase1EndStr,
        note:           `~${weeklyTarget} lbs/week needed · projected from current pace`,
      }
    }
    const daysLeft = Math.ceil((phase1End - today) / (1000 * 60 * 60 * 24))
    return {
      targetWeight,
      targetDate:   fmtLocalDate(phase1End),
      daysToTarget: daysLeft,
      weeklyTarget,
      note:         '~1.5 lbs/week to hit 159 by Aug 9 (no current weight data)',
    }
  }

  if (currentPhase.id >= 4) {
    return {
      targetWeight: raceDayTarget,
      targetDate:   'Race day',
      note:         'Race weight target: 155 lbs',
    }
  }

  return null
}

export { PHASES, PLAN_START, RACE_DATE }
