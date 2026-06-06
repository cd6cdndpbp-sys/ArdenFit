import { useState, useEffect } from 'react'
import { generateCoachingSummary } from '../utils/coachingSummary'

const CARD_TRANSITION = 'background-color 1.5s ease, border-color 1.5s ease'

export default function CoachingSummary({ theme, healthData }) {
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

  return (
    <div className="coaching-summary-card" style={{
      background:   theme.cardBg,
      border:       `0.5px solid ${theme.cardBorder}`,
      borderRadius: '10px',
      padding:      '14px',
      transition:   CARD_TRANSITION,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', color: theme.accent, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, transition: 'color 1.5s ease' }}>
          Arden
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
