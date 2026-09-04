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

// Consecutive `active` days walking backward from `endIndex` (inclusive).
function consecutiveActiveDaysEndingAt(exerciseHistory, endIndex) {
  let streak = 0
  for (let i = endIndex; i >= 0; i--) {
    if (exerciseHistory[i].active) streak++
    else break
  }
  return streak
}

// Current streak as of the last entry in exerciseHistory ("today") — today's own entry is
// skipped if it hasn't cleared the active-day threshold YET (the day isn't over), so a
// still-in-progress day doesn't prematurely break an otherwise-intact streak.
export function currentStreak(exerciseHistory) {
  if (!exerciseHistory?.length) return 0
  const lastIndex = exerciseHistory.length - 1
  const todayCountsYet = exerciseHistory[lastIndex].active
  return consecutiveActiveDaysEndingAt(exerciseHistory, todayCountsYet ? lastIndex : lastIndex - 1)
}

export const STREAK_MILESTONES = [7, 14, 30]

// Returns the milestone (7/14/30) today's streak just crossed that yesterday's streak
// hadn't reached — not "is at or above" (which would re-fire every day after crossing) —
// or null if none was crossed today. Stateless: recomputes yesterday's streak from the same
// exerciseHistory array instead of persisting a "last seen streak" value, so it can't drift
// or miss a crossing due to a stale read. The same result drives both the streak_milestone
// Arden state (decisionEngine.js) and the confetti trigger — one check, not two.
export function crossedStreakMilestoneToday(exerciseHistory) {
  if (!exerciseHistory || exerciseHistory.length < 2) return null
  const todayStreak     = currentStreak(exerciseHistory)
  const yesterdayStreak = consecutiveActiveDaysEndingAt(exerciseHistory, exerciseHistory.length - 2)
  return STREAK_MILESTONES.find(m => todayStreak >= m && yesterdayStreak < m) ?? null
}
