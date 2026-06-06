export const RACE_DISTANCES = [
  { label: '5K',            miles: 3.107 },
  { label: '10K',           miles: 6.214 },
  { label: '10 Miles',      miles: 10.0  },
  { label: 'Half Marathon', miles: 13.1  },
  { label: 'Marathon',      miles: 26.2  },
]

function getDefaultRaces() {
  return [
    {
      id: 1,
      name: 'MCM Historic Half',
      date: '2027-05-17',
      location: 'Fredericksburg, VA',
      distance: 'Half Marathon',
      goalSeconds: 12600,
      primary: false,
    },
    {
      id: 2,
      name: 'Army Ten Miler',
      date: '2026-10-11',
      location: 'Washington, DC',
      distance: '10 Miles',
      goalSeconds: 9000,
      primary: true,
    },
  ]
}

export function getRaces() {
  try {
    const races = JSON.parse(localStorage.getItem('ardenfit_races')) || getDefaultRaces()
    // migrate races saved before goalSeconds field existed
    return races.map(r => {
      if (r.goalSeconds != null) return r
      const parts = r.goal?.match(/(\d+):(\d+)/)
      return { ...r, goalSeconds: parts ? parseInt(parts[1]) * 3600 + parseInt(parts[2]) * 60 : 0 }
    })
  } catch { return getDefaultRaces() }
}

export function saveRaces(races) {
  localStorage.setItem('ardenfit_races', JSON.stringify(races))
}

export function addRace(race) {
  const races = getRaces()
  race.id = Date.now()
  races.push(race)
  saveRaces(races)
}

export function updateRace(id, data) {
  saveRaces(getRaces().map(r => r.id === id ? { ...r, ...data, id } : r))
}

export function deleteRace(id) {
  saveRaces(getRaces().filter(r => r.id !== id))
}

export function setPrimaryRace(id) {
  saveRaces(getRaces().map(r => ({ ...r, primary: r.id === id })))
}

export function getNextRace() {
  const today  = new Date()
  const future = getRaces()
    .filter(r => new Date(r.date) > today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
  return future.find(r => r.primary) || future[0] || null
}

export function getProgressPercent(dateStr) {
  const daysUntil = getDaysUntil(dateStr)
  const maxDays   = 364
  const elapsed   = Math.max(0, maxDays - daysUntil)
  return Math.max(2, Math.min(98, Math.round((elapsed / maxDays) * 100)))
}

export function getDaysUntil(dateStr) {
  const today   = new Date()
  today.setHours(0, 0, 0, 0)
  const target  = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24))
}
