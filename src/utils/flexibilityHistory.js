// Real per-session activity TYPE data — confirmed to exist before building this (Step 3 of
// the design pass): health-data.json's `workouts` array (distinct from apple_exercise_time's
// aggregate minutes, which has no type detail at all) carries genuine HealthKit workout
// sessions with a `name` field, including real "Yoga"/"Flexibility" entries.
const FLEXIBILITY_WORKOUT_NAMES = ['Yoga', 'Flexibility']

const localDateStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// Rolling window of `days` calendar days ending today (oldest first) — whether a real Yoga/
// Flexibility workout session was logged that day. Unlike apple_exercise_time (a continuous
// minutes total needing a threshold), a workout session is a discrete event: either one
// happened that day or it didn't, so there's no threshold to pick — just presence.
export function buildFlexibilityHistory(workouts, days) {
  const sessionDates = new Set(
    (workouts || [])
      .filter(w => FLEXIBILITY_WORKOUT_NAMES.includes(w.name))
      .map(w => w.start?.split(' ')[0])
      .filter(Boolean)
  )
  const history = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = localDateStr(d)
    history.push({ date: dateStr, active: sessionDates.has(dateStr) })
  }
  return history
}
