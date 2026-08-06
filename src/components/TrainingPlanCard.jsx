import { useNavigate } from 'react-router-dom'
import { getCurrentPhase, getTodaysPlan, getTomorrowsPlan, getPhaseProgress, getWeightTarget } from '../utils/trainingPlan'

const CARD_TRANSITION = 'background-color 1.5s ease, border-color 1.5s ease'

const PHASE_PILL = {
  amber:  { bg: '#451a03', color: '#f59e0b', border: '#92400e' },
  teal:   { bg: '#042f2e', color: '#2dd4bf', border: '#0f766e' },
  blue:   { bg: '#172554', color: '#60a5fa', border: '#1d4ed8' },
  purple: { bg: '#2e1065', color: '#a78bfa', border: '#7c3aed' },
  red:    { bg: '#450a0a', color: '#f87171', border: '#b91c1c' },
}

const TYPE_PILL = {
  walk:     { bg: '#172554', color: '#60a5fa' },
  run:      { bg: '#052e16', color: '#4ade80' },
  strength: { bg: '#451a03', color: '#f59e0b' },
  rest:     { bg: 'transparent', color: '#666', border: '0.5px solid #444' },
  recovery: { bg: 'transparent', color: '#e05555', border: '0.5px solid #e05555' },
}

const fmtDate = (dateStr) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

const WEIGHT_GOAL  = 159

export default function TrainingPlanCard({ theme, healthData, decision }) {
  const navigate     = useNavigate()
  const phase        = getCurrentPhase()
  const todayPlan    = getTodaysPlan()
  const progress     = getPhaseProgress()
  const phasePill    = PHASE_PILL[phase.colorKey] || PHASE_PILL.amber

  const todayComplete = healthData?.todayWorkoutComplete === true
  const tomorrowDay   = getTomorrowsPlan()
  const recoveryFlags = ['POOR_SLEEP', 'POOR_SLEEP_STREAK']
  const isRecovery    = !todayComplete &&
    decision?.flags?.some(f => recoveryFlags.includes(f))

  const recoveryReason = decision?.reasons?.[0] ?? 'Recovery recommended based on health data.'

  const displayPlan   = isRecovery
    ? { type: 'recovery', label: 'Active Recovery', duration: 15, nutritionNote: phase.nutritionNote }
    : todayComplete && tomorrowDay
      ? { ...tomorrowDay, nutritionNote: phase.nutritionNote }
      : todayPlan
  const planLabel     = isRecovery
    ? "Today's Plan — Modified"
    : todayComplete && tomorrowDay
      ? "Tomorrow's Plan"
      : "Today's Plan"

  const currentWeight = healthData?.currentWeight ?? null
  const weightTarget  = getWeightTarget(currentWeight)
  const weightBaseline = phase.weightBaseline ?? WEIGHT_GOAL
  const lbsRemaining  = currentWeight != null ? Math.max(Math.round((currentWeight - WEIGHT_GOAL) * 10) / 10, 0) : 0
  const weightPct     = currentWeight != null
    ? Math.max(0, Math.min(Math.round((weightBaseline - currentWeight) / (weightBaseline - WEIGHT_GOAL) * 100), 100))
    : 0

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
          <span>Phase ends {fmtDate(phase.endDate)}</span>
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

      {/* Today's / Tomorrow's plan */}
      {displayPlan && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '10px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            {planLabel}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{
              background:   TYPE_PILL[displayPlan.type]?.bg ?? TYPE_PILL.rest.bg,
              color:        TYPE_PILL[displayPlan.type]?.color ?? TYPE_PILL.rest.color,
              border:       TYPE_PILL[displayPlan.type]?.border ?? (displayPlan.type === 'rest' ? `0.5px solid ${theme.cardBorder}` : 'none'),
              borderRadius: '20px',
              fontSize:     '11px',
              fontWeight:   600,
              padding:      '3px 10px',
              whiteSpace:   'nowrap',
            }}>
              {displayPlan.type === 'walk' ? 'Walk'
                : displayPlan.type === 'run' ? (displayPlan.raceDay ? 'Race Day' : 'Run')
                : displayPlan.type === 'strength' ? 'Strength'
                : displayPlan.type === 'recovery' ? 'Recovery'
                : 'Rest'}
            </div>
            <div style={{ fontSize: '13px', color: theme.textPrimary }}>
              {displayPlan.type === 'walk'
                ? `${displayPlan.distance}mi · ${displayPlan.speed}`
                : displayPlan.type === 'run'
                ? displayPlan.distance != null
                  ? `${displayPlan.distance}mi${displayPlan.raceDay ? ' — trust the training' : ' long run'}`
                  : `${displayPlan.durationMin} min${displayPlan.runWalkRatio ? ` · run/walk ${displayPlan.runWalkRatio}` : ' · continuous'}`
                : displayPlan.type === 'strength'
                ? `${displayPlan.duration} min`
                : displayPlan.type === 'recovery'
                ? '15 min · light stretch only'
                : 'Recovery day'}
            </div>
          </div>
          <div style={{ fontSize: '11px', color: theme.textMuted, fontStyle: 'italic' }}>
            {displayPlan.nutritionNote}
          </div>
          {isRecovery && (
            <div style={{
              background:   theme.badgeWarn.bg,
              border:       `0.5px solid ${theme.badgeWarn.color}40`,
              borderRadius: '6px',
              padding:      '6px 10px',
              marginTop:    '6px',
              fontSize:     '11px',
              color:        theme.badgeWarn.color,
            }}>
              ⚠ {recoveryReason}
            </div>
          )}
        </div>
      )}

      <button
        className="start-workout-btn"
        onClick={() => navigate('/workout')}
        style={{
          width:        '100%',
          marginBottom: '12px',
          padding:      '8px',
          background:   'transparent',
          border:       `0.5px solid ${theme.accent}`,
          borderRadius: '8px',
          color:        theme.accent,
          fontSize:     '13px',
          fontWeight:   600,
          cursor:       'pointer',
          transition:   'border-color 1.5s ease, color 1.5s ease',
        }}
      >
        → Start Workout
      </button>

      {/* Weight goal — Phase 1 only */}
      {weightTarget && (
        <div style={{
          background:   theme.bgSecondary,
          border:       `0.5px solid ${theme.cardBorder}`,
          borderRadius: '8px',
          padding:      '8px 10px',
          transition:   CARD_TRANSITION,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Weight Goal (projected)
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: theme.accent }}>
              {weightTarget.targetWeight} lbs by {fmtDate(weightTarget.targetDate)}
            </span>
          </div>
          {currentWeight != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: theme.textPrimary, whiteSpace: 'nowrap' }}>
                {currentWeight} lbs
              </span>
              <div style={{ flex: 1, height: '4px', background: theme.cardBorder, borderRadius: '2px', overflow: 'hidden', transition: CARD_TRANSITION }}>
                <div style={{ width: `${weightPct}%`, height: '100%', background: theme.accent, borderRadius: '2px', transition: 'background-color 1.5s ease' }} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: theme.textMuted, whiteSpace: 'nowrap' }}>
                {WEIGHT_GOAL} lbs
              </span>
            </div>
          )}
          <div style={{ fontSize: '11px', color: theme.textMuted, fontStyle: 'italic' }}>
            ~{weightTarget.weeklyTarget ?? 1.5} lbs/week needed · {weightTarget.daysToTarget}d left
            {currentWeight != null && lbsRemaining > 0 ? ` · ${lbsRemaining} lbs to go` : ''}
            {currentWeight != null && lbsRemaining === 0 ? ' · Goal reached!' : ''}
          </div>
        </div>
      )}

    </div>
  )
}
