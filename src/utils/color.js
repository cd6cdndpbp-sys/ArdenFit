// Converts a theme hex color to rgba() at a given opacity — for deriving a subtle tint
// from theme.accent (e.g. a hero card background) without hardcoding a second color per
// theme. Assumes a well-formed 6-digit hex (every theme.accent value is).
export function hexToRgba(hex, alpha) {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
