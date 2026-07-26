import { useNavigate } from 'react-router-dom'
import { getNextRace, getDaysUntil, RACE_DISTANCES } from '../utils/raceManager'
import { getCurrentPhase } from '../utils/trainingPlan'

const CARD_TRANSITION = 'background-color 1.5s ease, border-color 1.5s ease'

const cardStyle = (theme) => ({
  background:   theme.cardBg,
  border:       `0.5px solid ${theme.cardBorder}`,
  borderRadius: '10px',
  padding:      '14px',
  transition:   CARD_TRANSITION,
})

const fmtFinish = (mins) => {
  const h = Math.floor(mins / 60)
  const m = Math.round(mins % 60)
  return `${h}:${String(m).padStart(2, '0')}`
}

const fmtPace = (mpm) => {
  const m = Math.floor(mpm)
  const s = Math.round((mpm - m) * 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function RaceCard({ theme, healthData }) {
  const navigate  = useNavigate()
  const nextRace   = getNextRace()
  const daysUntil  = nextRace ? getDaysUntil(nextRace.date) : null
  const phase      = getCurrentPhase()

  const raceMiles      = RACE_DISTANCES.find(d => d.label === nextRace?.distance)?.miles ?? 13.1
  const goalMin        = nextRace?.goalSeconds > 0 ? nextRace.goalSeconds / 60 : null

  const paceMinPerMile = healthData?.avgPaceMinPerMile ?? 20.0
  const hasPace        = healthData?.avgPaceMinPerMile != null
  const estFinishMin   = paceMinPerMile * raceMiles
  const diffMin        = goalMin != null ? Math.round(estFinishMin - goalMin) : null
  const isOverGoal     = diffMin != null && diffMin > 0
  const finishColor    = (diffMin == null || isOverGoal) ? '#f59e0b' : '#3ecf8e'
  const barPct         = goalMin != null ? Math.min(Math.round((estFinishMin / goalMin) * 100), 100) : null

  if (!nextRace) return null

  return (
    <div style={cardStyle(theme)}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

        {/* Left — race info */}
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
          <div style={{ fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            NEXT RACE
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '18px', fontWeight: 600, color: theme.textPrimary }}>
              {nextRace.name}
            </span>
            <button onClick={() => navigate('/races')} style={{
              background: 'none', border: 'none',
              color: theme.textMuted, fontSize: '11px',
              cursor: 'pointer', textDecoration: 'underline', padding: 0, flexShrink: 0,
            }}>
              Manage →
            </button>
          </div>
          <div style={{ fontSize: '13px', color: theme.textSecondary, marginTop: '2px' }}>
            {[nextRace.distance, nextRace.location].filter(Boolean).join(' · ')}
          </div>
          {(nextRace.goalSeconds > 0 || nextRace.goal) && (
            <div style={{ fontSize: '13px', color: theme.accentText, fontStyle: 'italic', marginTop: '3px', transition: 'color 1.5s ease' }}>
              {nextRace.goalSeconds > 0 ? `Goal: ${fmtFinish(nextRace.goalSeconds / 60)}` : nextRace.goal}
            </div>
          )}
          <div className="race-pills" style={{ marginTop: '10px' }}>
            <span style={{
              background: theme.bgSecondary, border: `0.5px solid ${theme.cardBorder}`,
              borderRadius: '20px', padding: '4px 12px',
              fontSize: '12px', fontWeight: 600, color: theme.textSecondary,
              transition: CARD_TRANSITION,
            }}>
              {phase.shortName}
            </span>
            <span style={{
              background: theme.bgSecondary, border: `0.5px solid ${theme.cardBorder}`,
              borderRadius: '20px', padding: '4px 12px',
              fontSize: '12px', fontWeight: 600, color: '#c084fc',
              transition: CARD_TRANSITION,
            }}>
              {daysUntil} days out
            </span>
          </div>
        </div>

        {/* Right — estimated finish + goal bar */}
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
          <div style={{ fontSize: '10px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            Estimated Finish
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: finishColor, lineHeight: 1.1 }}>
            {fmtFinish(estFinishMin)}
          </div>
          <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '2px', marginBottom: '10px' }}>
            {fmtPace(paceMinPerMile)}/mi {hasPace ? '7-day avg' : '(default)'}
          </div>
          {goalMin != null && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: theme.textMuted, marginBottom: '5px' }}>
                <span>Goal {fmtFinish(goalMin)}</span>
                <span style={{ color: isOverGoal ? '#f59e0b' : '#3ecf8e' }}>
                  {isOverGoal ? `${diffMin} min over` : `${Math.abs(diffMin)} min under`}
                </span>
              </div>
              <div style={{ height: '4px', background: theme.cardBorder, borderRadius: '2px', overflow: 'hidden', transition: CARD_TRANSITION }}>
                <div style={{
                  width:      `${barPct}%`,
                  height:     '100%',
                  background: finishColor,
                  borderRadius: '2px',
                  transition: 'background-color 1.5s ease',
                }} />
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
