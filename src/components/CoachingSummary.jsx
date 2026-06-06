import { useState, useEffect } from 'react'
import { generateCoachingSummary } from '../utils/coachingSummary'

const CARD_TRANSITION = 'background-color 1.5s ease, border-color 1.5s ease'

export default function CoachingSummary({ theme, healthData }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!healthData) return
    generateCoachingSummary(healthData)
      .then(setSummary)
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
      ) : (
        <div style={{ fontSize: '14px', color: theme.textSecondary, lineHeight: 1.6 }}>
          {summary}
        </div>
      )}
    </div>
  )
}
