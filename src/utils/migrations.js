// One-time localStorage cleanup for keys whose owning code was removed this session, so
// stale data from an older build can't silently resurface if either feature is ever
// re-added. Same guard-flag pattern raceManager.js used for ardenfit_races before that file
// (and the race feature) was deleted — moved here since that file no longer exists.

function clearOnce(storageKey, clearedFlagKey) {
  try {
    if (localStorage.getItem(clearedFlagKey)) return
    localStorage.removeItem(storageKey)
    localStorage.setItem(clearedFlagKey, 'true')
  } catch {}
}

// workoutLogger.js (the Start Workout/WorkoutView flow) was removed Sept 2026.
clearOnce('ardenfit_workout_log', 'ardenfit_workout_log_cleared_2026_09')

// isPhase3Ready()'s activation flag — Base Rebuild/Distance Build/Race Prep were removed
// Sept 2026, along with the phase-3-readiness gate that wrote this key.
clearOnce('ardenfit_phase3_activated_date', 'ardenfit_phase3_activated_date_cleared_2026_09')
