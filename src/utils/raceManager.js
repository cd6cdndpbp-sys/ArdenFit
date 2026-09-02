// Races were dropped as a training goal Sept 2026 — see trainingPlan.js's RECOMP_PHASE
// (Recomp & Flexibility) which replaced the race-anchored phases. This module is kept as a
// no-op shim only because a few components still import it (BottomRow's RaceCard,
// coachingSummary.js) — none of them sit in the render tree or call path anymore, but
// gutting rather than deleting avoids a cascade of broken imports.
//
// The stale MCM Historic Half / Army Ten Miler localStorage entries are cleared explicitly
// below (once) so they can't silently resurface if a race component is ever re-added.

export const RACE_DISTANCES = []

const RACES_STORAGE_KEY   = 'ardenfit_races'
const RACES_CLEARED_KEY   = 'ardenfit_races_cleared_2026_09'

function clearStaleRaceData() {
  try {
    if (localStorage.getItem(RACES_CLEARED_KEY)) return
    localStorage.removeItem(RACES_STORAGE_KEY)
    localStorage.setItem(RACES_CLEARED_KEY, 'true')
  } catch {}
}
clearStaleRaceData()

export function getRaces() { return [] }
export function saveRaces() {}
export function addRace() {}
export function updateRace() {}
export function deleteRace() {}
export function setPrimaryRace() {}
export function getNextRace() { return null }
export function getProgressPercent() { return 0 }
export function getDaysUntil() { return null }
