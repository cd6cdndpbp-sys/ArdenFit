// Two distinct apple_exercise_time thresholds, used for two different purposes — kept
// separately named and changeable rather than sharing one number:
//
// ACTIVE_DAY_MIN_MINUTES (15) — "did something today." Drives STREAK and the consistency
// heatmap (useHealthData.js's streak loop, buildExerciseHistory() below).
//
// WORKOUT_COMPLETE_MIN_MINUTES (20) — "counts as a completed workout." Drives
// todayWorkoutComplete, which feeds decisionEngine.js's WORKOUT_COMPLETE flag (Arden's
// post-workout celebratory state), and the weekly WORKOUTS count.
export const ACTIVE_DAY_MIN_MINUTES = 15
export const WORKOUT_COMPLETE_MIN_MINUTES = 20

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
