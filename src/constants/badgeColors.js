import { hexToRgba } from '../utils/color'

// Category-identity colors — deliberately NOT theme tokens. These distinguish one category
// from another (which training phase, which workout type), so they need to stay recognizable
// against each other regardless of dark/light/time-of-day; a "strength" badge shouldn't turn
// a different color at night while a "flexibility" badge stays the same. Fixed per-category
// colors are the correct choice here, just centralized instead of duplicated inline.
//
// Each category defines one base color; background and border are derived from it (tinted
// fill + full-opacity text, not a separately hand-picked dark bg per entry), so they always
// stay in harmony and a new category only ever needs one value.

function pillStyle(colorHex) {
  return {
    color:  colorHex,
    bg:     hexToRgba(colorHex, 0.14),
    border: hexToRgba(colorHex, 0.4),
  }
}

const PHASE_COLORS = {
  amber:  '#f59e0b',
  teal:   '#2dd4bf',
  blue:   '#60a5fa',
  purple: '#a78bfa',
  red:    '#f87171',
}

const TYPE_COLORS = {
  walk:         '#60a5fa',
  incline_walk: '#60a5fa',
  strength:     '#f59e0b',
  flexibility:  '#2dd4bf',
  rest:         '#888',
  recovery:     '#e05555',
}

export const PHASE_PILL = Object.fromEntries(
  Object.entries(PHASE_COLORS).map(([key, c]) => [key, pillStyle(c)])
)

export const TYPE_PILL = Object.fromEntries(
  Object.entries(TYPE_COLORS).map(([key, c]) => [key, pillStyle(c)])
)
