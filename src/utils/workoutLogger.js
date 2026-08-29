const STORAGE_KEY = 'ardenfit_workout_log'

const localDateStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

// One-time migration: correct the UTC-date bug on the known bad entry
;(function migrateWorkoutLog() {
  try {
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
    const entry = logs.find(l => l.id === 1780064198582)
    if (entry && entry.date === '2026-05-29') {
      entry.date = '2026-05-30'
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
    }
  } catch {}
})()

export function saveWorkoutLog(log) {
  const existing = getWorkoutLogs()
  existing.unshift({ ...log, date: localDateStr() })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
}

export function getWorkoutLogs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch { return [] }
}

export function getTodayLog() {
  const today = localDateStr()
  const logs  = getWorkoutLogs()
  const match = logs.find(l => l.date === today) || null
  return match
}

// Log object shape:
// {
//   id: Date.now(),
//   date: '2026-05-30',           // always set to local date by saveWorkoutLog
//   type: 'Full Body Circuit',
//   plannedDuration: 35,
//   actualDuration: number,        // minutes from start to complete
//   completed: true | false,       // false = bailed early
//   feeling: 1-5,
//   exercisesCompleted: number,
//   exercisesTotal: number,
//   modifications: [{ exerciseName, type: 'easier' | 'harder' }],
//   intensity: number,
//   flags: [],
//   runWalkRatio: '2:1' | '3:1' | '4:1' | null,  // null on a 'Run' entry means continuous —
//                                                 // undefined/absent means this log predates
//                                                 // the field and carries no signal either way
// }
