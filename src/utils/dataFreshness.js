// health-data.json has no internal sync timestamp — server.js exposes the file's own mtime
// instead (checked in Step 5 of the design pass as the more reliable of the two options).
export const DATA_FRESH_MIN_MINUTES = 30  // green at or under this age
export const DATA_STALE_HOURS       = 4   // amber up to this age, red beyond it

export function freshnessLevel(lastUpdatedIso) {
  if (!lastUpdatedIso) return 'critical'
  const ageMinutes = (Date.now() - new Date(lastUpdatedIso).getTime()) / 60000
  if (ageMinutes <= DATA_FRESH_MIN_MINUTES) return 'good'
  if (ageMinutes <= DATA_STALE_HOURS * 60) return 'warn'
  return 'critical'
}

export function formatSyncAge(lastUpdatedIso) {
  if (!lastUpdatedIso) return 'never synced'
  const ageMinutes = Math.round((Date.now() - new Date(lastUpdatedIso).getTime()) / 60000)
  if (ageMinutes < 1) return 'synced just now'
  if (ageMinutes < 60) return `synced ${ageMinutes}m ago`
  const hours = Math.round(ageMinutes / 60)
  if (hours < 24) return `synced ${hours}h ago`
  return `synced ${Math.round(hours / 24)}d ago`
}
