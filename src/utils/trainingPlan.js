const PLAN_START = '2026-05-29'
const RACE_DATE  = '2027-05-17'

const PHASES = [
  {
    id: 1,
    name: 'Weight Loss Priority',
    shortName: 'Phase 1',
    startDate: '2026-05-29',
    endDate: '2026-08-25',
    goal: 'Lose to 159 lbs (1.5 lbs/week from 168.4 lbs baseline). Begin aerobic base overlap.',
    colorKey: 'amber',
    weeklyStructure: {
      Mon: { type: 'strength', label: 'Lower Body Strength',   duration: 35 },
      Tue: { type: 'walk',     label: 'Short Walk',            distance: 2.5, speed: '3.0-3.2 mph' },
      Wed: { type: 'strength', label: 'Upper Body + Core',     duration: 35 },
      Thu: { type: 'walk',     label: 'Short Walk',            distance: 3.0, speed: '3.0-3.2 mph' },
      Fri: { type: 'rest',     label: 'Rest or Light Stretch', duration: 15 },
      Sat: { type: 'walk',     label: 'Medium Walk',           distance: 3.5, speed: '3.0-3.3 mph' },
      Sun: { type: 'rest',     label: 'Full Rest',             duration: 0 },
    },
    nutritionNote:   'Target 1,800-2,000 cal/day. Minimum 120g protein.',
    progressionNote: 'Add 0.25mi to Saturday walk every 2 weeks. Deficit continues through Aug 25 while aerobic base builds concurrently.',
  },
  {
    id: 2,
    name: 'Base Build',
    shortName: 'Phase 2',
    startDate: '2026-08-26',
    endDate: '2026-09-30',
    goal: 'Build aerobic base. Long walk 4mi → 6mi. Comfortable at 3.4-3.6 mph.',
    colorKey: 'teal',
    weeklyStructure: {
      Mon: { type: 'strength', label: 'Lower Body Strength',   duration: 40 },
      Tue: { type: 'walk',     label: 'Easy Walk',             distance: 2.5, speed: '3.0-3.3 mph' },
      Wed: { type: 'walk',     label: 'Pace Walk',             distance: 3.0, speed: '3.3-3.5 mph' },
      Thu: { type: 'strength', label: 'Upper Body + Core',     duration: 35 },
      Fri: { type: 'rest',     label: 'Rest or Light Stretch', duration: 15 },
      Sat: { type: 'walk',     label: 'Long Walk',             distance: 4.0, speed: '3.0-3.3 mph' },
      Sun: { type: 'rest',     label: 'Full Rest',             duration: 0 },
    },
    nutritionNote:   'Maintain weight. Light carbs before walks over 3 miles.',
    progressionNote: 'Increase Saturday long walk by 0.5mi every 2 weeks.',
  },
  {
    id: 3,
    name: 'Distance Build',
    shortName: 'Phase 3',
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    goal: 'Long walk 6mi → 8mi. Comfortable at 3.5-3.8 mph.',
    colorKey: 'blue',
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
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return (
    PHASES.find(p => {
      const start = new Date(p.startDate)
      const end   = new Date(p.endDate)
      end.setHours(23, 59, 59, 999)
      return today >= start && today <= end
    }) || PHASES[0]
  )
}

export function getTodaysPlan() {
  const phase  = getCurrentPhase()
  const dayKey = new Date().toLocaleDateString('en-US', { weekday: 'long' }).slice(0, 3)
  const day    = phase.weeklyStructure[dayKey]
  if (!day) return null
  return {
    ...day,
    phase:         phase.shortName,
    phaseName:     phase.name,
    phaseGoal:     phase.goal,
    nutritionNote: phase.nutritionNote,
  }
}

export function getTomorrowsPlan() {
  const phase = getCurrentPhase()
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dayKey = tomorrow.toLocaleDateString('en-US', { weekday: 'long' }).slice(0, 3)
  const day = phase.weeklyStructure[dayKey]
  if (!day) return null
  return {
    ...day,
    phase:         phase.shortName,
    phaseName:     phase.name,
    phaseGoal:     phase.goal,
    nutritionNote: phase.nutritionNote,
  }
}

export function getWeekPlan() {
  const phase = getCurrentPhase()
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
    day,
    ...phase.weeklyStructure[day],
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

export function getWeightTarget() {
  const today        = new Date()
  today.setHours(0, 0, 0, 0)
  const phase1End    = new Date('2026-08-25')
  const raceDayTarget = 155
  const currentPhase = getCurrentPhase()

  if (today <= phase1End) {
    const daysLeft = Math.ceil((phase1End - today) / (1000 * 60 * 60 * 24))
    return {
      targetWeight: 159,
      targetDate:   'Aug 25',
      daysToTarget: daysLeft,
      weeklyTarget: 1.5,
      note:         '~1.5 lbs/week to hit 159 by Aug 25',
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
