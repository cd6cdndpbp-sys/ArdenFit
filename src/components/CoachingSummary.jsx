import { useState, useEffect } from 'react'
import { generateCoachingSummary } from '../utils/coachingSummary'
import { hexToRgba } from '../utils/color'

const CARD_TRANSITION = 'background-color 1.5s ease, border-color 1.5s ease'

// Arden's mood dot — reuses existing theme tokens only, no new colors per state.
const moodColor = (theme, ardenState) => {
  switch (ardenState) {
    case 'pr':
    case 'full_intensity':
    case 'streak_milestone':
      return theme.badgeGood.color
    case 'low_sleep':
    case 'overtraining':
    case 'off_baseline':
      return theme.badgeWarn.color
    case 'rest':
      return theme.textMuted
    default:
      return theme.accent
  }
}

export default function CoachingSummary({ theme, healthData, ardenState }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!healthData) return
    generateCoachingSummary(healthData)
      .then(setSummary)
      .catch(err => { console.error('[CoachingSummary]', err); setError(err.message) })
      .finally(() => setLoading(false))
  }, [!!healthData])

  const dotColor = moodColor(theme, ardenState)

  return (
    <div className="coaching-summary-card" style={{
      background:   hexToRgba(theme.accent, 0.06),
      border:       `0.5px solid ${theme.cardBorder}`,
      borderRadius: '12px',
      padding:      '18px',
      transition:   'background-color 1.5s ease, border-color 1.5s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: dotColor, transition: 'background-color 1.5s ease',
          }} />
          <span style={{ fontSize: '11px', color: theme.accent, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, transition: 'color 1.5s ease' }}>
            Arden
          </span>
        </span>
        <span style={{ fontSize: '11px', color: theme.textMuted }}>
          Refreshes daily
        </span>
      </div>
      {loading ? (
        <div style={{ fontSize: '13px', color: theme.textMuted, fontStyle: 'italic' }}>
          Arden is thinking...
        </div>
      ) : error ? (
        <div style={{ fontSize: '12px', color: theme.textMuted, fontStyle: 'italic' }}>
          {error}
        </div>
      ) : !summary ? (
        <div style={{ fontSize: '13px', color: theme.textMuted, fontStyle: 'italic' }}>
          Check back after 5pm.
        </div>
      ) : (
        <div style={{ fontSize: '14px', color: theme.textSecondary, lineHeight: 1.6 }}>
          {summary}
        </div>
      )}
    </div>
  )
}
