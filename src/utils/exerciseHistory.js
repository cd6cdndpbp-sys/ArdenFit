// Shared "was this a day with meaningful activity" logic — STREAK's own definition
// (useHealthData.js), reused as-is by the workout consistency heatmap so both read the
// same threshold against the same apple_exercise_time data instead of drifting apart.
export const ACTIVE_DAY_MIN_MINUTES = 15

const localDateStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function exerciseMinutesForDate(exerciseMinutesMetric, dateStr) {
  return exerciseMinutesMetric?.data
    ?.filter(e => e.date?.startsWith(dateStr))
    ?.reduce((sum, e) => sum + (e.qty || 0), 0) || 0
}

// Rolling window of `days` calendar days ending today (oldest first), each day's total
// apple_exercise_time minutes and whether it clears the active-day threshold.
export function buildExerciseHistory(exerciseMinutesMetric, days) {
  const history = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = localDateStr(d)
    const mins = Math.round(exerciseMinutesForDate(exerciseMinutesMetric, dateStr))
    history.push({ date: dateStr, mins, active: mins >= ACTIVE_DAY_MIN_MINUTES })
  }
  return history
}
