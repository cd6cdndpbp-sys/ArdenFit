const STORAGE_KEY = 'ardenfit_workout_log'

export function saveWorkoutLog(log) {
  const existing = getWorkoutLogs()
  existing.unshift(log)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
}

export function getWorkoutLogs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch { return [] }
}

export function getTodayLog() {
  const today = new Date().toISOString().split('T')[0]
  return getWorkoutLogs().find(l => l.date === today) || null
}

// Log object shape:
// {
//   id: Date.now(),
//   date: '2026-05-29',
//   type: 'Full Body Circuit',
//   plannedDuration: 35,
//   actualDuration: number,        // minutes from start to complete
//   completed: true | false,       // false = bailed early
//   feeling: 1-5,
//   exercisesCompleted: number,
//   exercisesTotal: number,
//   modifications: [{ exerciseName, type: 'easier' | 'harder' }],
//   intensity: number,
//   flags: []
// }
