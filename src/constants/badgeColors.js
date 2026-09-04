// Category-identity colors — deliberately NOT theme tokens. These distinguish one category
// from another (which training phase, which workout type), so they need to stay recognizable
// against each other regardless of dark/light/time-of-day; a "strength" badge shouldn't turn
// a different color at night while a "flexibility" badge stays the same. Fixed per-category
// colors are the correct choice here, just centralized instead of duplicated inline.

export const PHASE_PILL = {
  amber:  { bg: '#451a03', color: '#f59e0b', border: '#92400e' },
  teal:   { bg: '#042f2e', color: '#2dd4bf', border: '#0f766e' },
  blue:   { bg: '#172554', color: '#60a5fa', border: '#1d4ed8' },
  purple: { bg: '#2e1065', color: '#a78bfa', border: '#7c3aed' },
  red:    { bg: '#450a0a', color: '#f87171', border: '#b91c1c' },
}

export const TYPE_PILL = {
  walk:         { bg: '#172554', color: '#60a5fa' },
  incline_walk: { bg: '#172554', color: '#60a5fa' },
  strength:     { bg: '#451a03', color: '#f59e0b' },
  flexibility:  { bg: '#042f2e', color: '#2dd4bf' },
  rest:         { bg: 'transparent', color: '#666', border: '0.5px solid #444' },
  recovery:     { bg: 'transparent', color: '#e05555', border: '0.5px solid #e05555' },
}
