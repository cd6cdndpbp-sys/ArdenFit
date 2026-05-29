import { getCurrentPhase, getTodaysPlan, getPhaseProgress, getWeightTarget, getWeekPlan } from '../utils/trainingPlan'

const CARD_TRANSITION = 'background-color 1.5s ease, border-color 1.5s ease'

const PHASE_PILL = {
  amber:  { bg: '#451a03', color: '#f59e0b', border: '#92400e' },
  teal:   { bg: '#042f2e', color: '#2dd4bf', border: '#0f766e' },
  blue:   { bg: '#172554', color: '#60a5fa', border: '#1d4ed8' },
  purple: { bg: '#2e1065', color: '#a78bfa', border: '#7c3aed' },
}

const TYPE_PILL = {
  walk:     { bg: '#172554', color: '#60a5fa' },
  strength: { bg: '#451a03', color: '#f59e0b' },
  rest:     { bg: 'transparent', color: '#666', border: '0.5px solid #444' },
}

const DAY_INITIAL = { Mon: 'M', Tue: 'T', Wed: 'W', Thu: 'T', Fri: 'F', Sat: 'S', Sun: 'S' }

const fmtDate = (dateStr) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export default function TrainingPlanCard({ theme }) {
  const phase        = getCurrentPhase()
  const todayPlan    = getTodaysPlan()
  const progress     = getPhaseProgress()
  const weightTarget = getWeightTarget()
  const weekPlan     = getWeekPlan()
  const phasePill    = PHASE_PILL[phase.colorKey] || PHASE_PILL.amber
  const todayKey     = new Date().toLocaleDateString('en-US', { weekday: 'long' }).slice(0, 3)
  const typePill     = todayPlan ? (TYPE_PILL[todayPlan.type] || TYPE_PILL.rest) : TYPE_PILL.rest

  return (
    <div style={{
      background:   theme.cardBg,
      border:       `0.5px solid ${theme.cardBorder}`,
      borderRadius: '10px',
      padding:      '14px',
      transition:   CARD_TRANSITION,
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ fontSize: '10px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Training Plan
        </div>
        <div style={{
          background:   phasePill.bg,
          color:        phasePill.color,
          border:       `0.5px solid ${phasePill.border}`,
          borderRadius: '20px',
          fontSize:     '11px',
          padding:      '2px 8px',
        }}>
          {phase.shortName}
        </div>
      </div>

      {/* Phase goal */}
      <div style={{ fontSize: '13px', color: theme.textMuted, fontStyle: 'italic', marginBottom: '10px' }}>
        {phase.goal}
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: theme.textMuted, marginBottom: '5px' }}>
          <span>{phase.shortName}</span>
          <span>{fmtDate(phase.endDate)}</span>
        </div>
        <div style={{ height: '4px', background: theme.cardBorder, borderRadius: '2px', overflow: 'hidden', transition: CARD_TRANSITION }}>
          <div style={{
            width:      `${progress}%`,
            height:     '100%',
            background: phasePill.color,
            borderRadius: '2px',
            transition: 'background-color 1.5s ease',
          }} />
        </div>
      </div>

      {/* Weight target — Phase 1 only */}
      {weightTarget && (
        <div style={{
          background:   theme.bgSecondary,
          border:       `0.5px solid ${theme.cardBorder}`,
          borderRadius: '8px',
          padding:      '8px 10px',
          marginBottom: '12px',
          transition:   CARD_TRANSITION,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Weight goal
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: theme.accent }}>
              {weightTarget.targetWeight} lbs by {fmtDate('2026-07-15')}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: theme.textMuted, fontStyle: 'italic', marginTop: '2px' }}>
            ~{weightTarget.weeklyTarget ?? 1.5} lbs/week needed · {weightTarget.daysToTarget}d left
          </div>
        </div>
      )}

      {/* Today's plan */}
      {todayPlan && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '10px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            Today's Plan
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{
              background:   typePill.bg,
              color:        typePill.color,
              border:       typePill.border || 'none',
              borderRadius: '20px',
              fontSize:     '11px',
              fontWeight:   600,
              padding:      '3px 10px',
              whiteSpace:   'nowrap',
            }}>
              {todayPlan.type === 'walk' ? 'Walk'
                : todayPlan.type === 'strength' ? 'Strength'
                : 'Rest'}
            </div>
            <div style={{ fontSize: '13px', color: theme.textPrimary }}>
              {todayPlan.type === 'walk'
                ? `${todayPlan.distance}mi · ${todayPlan.speed}`
                : todayPlan.type === 'strength'
                ? `${todayPlan.duration} min`
                : 'Recovery day'}
            </div>
          </div>
          <div style={{ fontSize: '11px', color: theme.textMuted, fontStyle: 'italic' }}>
            {todayPlan.nutritionNote}
          </div>
        </div>
      )}

      {/* Week at a glance */}
      <div>
        <div style={{ fontSize: '10px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
          This Week
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {weekPlan.map(d => {
            const isToday = d.day === todayKey
            const pill    = TYPE_PILL[d.type] || TYPE_PILL.rest
            return (
              <div key={d.day} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width:          '100%',
                  height:         '32px',
                  borderRadius:   '6px',
                  background:     isToday ? theme.accent : pill.bg,
                  border:         d.type === 'rest' && !isToday ? '0.5px solid #444' : 'none',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  fontSize:       '12px',
                  fontWeight:     isToday ? 700 : 400,
                  color:          isToday ? '#000' : pill.color,
                  transition:     'background-color 1.5s ease',
                }}>
                  {DAY_INITIAL[d.day]}
                </div>
                <div style={{ height: '4px', width: '4px', borderRadius: '50%', background: isToday ? theme.accent : 'transparent' }} />
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
