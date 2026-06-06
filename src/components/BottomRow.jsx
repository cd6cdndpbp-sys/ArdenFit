import { useNavigate } from 'react-router-dom'
import { getNextRace, getDaysUntil, RACE_DISTANCES } from '../utils/raceManager'
import { getCurrentPhase } from '../utils/trainingPlan'
import WeeklySummary from './WeeklySummary'
import TrainingPlanCard from './TrainingPlanCard'

const CARD_TRANSITION = 'background-color 1.5s ease, border-color 1.5s ease'

const REST_DAY_STRETCHES = [
  { name: 'Hip Flexor Stretch',       duration: '30s each side' },
  { name: 'Seated Hamstring Stretch', duration: '30s each side' },
  { name: 'Doorway Chest Stretch',    duration: '30s' },
  { name: 'Seated Spinal Twist',      duration: '30s each side' },
  { name: 'Calf Stretch',             duration: '30s each side' },
]

const cardStyle = (theme) => ({
  background:   theme.cardBg,
  border:       `0.5px solid ${theme.cardBorder}`,
  borderRadius: '10px',
  padding:      '14px',
  transition:   CARD_TRANSITION,
})

function TomorrowCard({ theme, decision, todaysPlan }) {
  const navigate = useNavigate()
  const now  = new Date()
  const hour = now.getHours()
  const isToday = hour >= 5
  const nextWorkoutDate = new Date(now)
  nextWorkoutDate.setDate(now.getDate() + (isToday ? 0 : 1))
  const dayName = nextWorkoutDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
  const label = isToday ? `TODAY · ${dayName}` : `TOMORROW · ${dayName}`

  const isRest = todaysPlan?.type === 'rest'
  const isWalk = todaysPlan?.type === 'walk'

  const workoutTitle = todaysPlan?.label || 'Lower body + core'
  const subtitle = isWalk || isRest
    ? (isWalk ? `${todaysPlan.distance}mi · ${todaysPlan.speed}` : todaysPlan.label)
    : '30–40 min · full intensity'

  const intensity = decision?.intensity ?? 0
  const intensityLabel =
    intensity <= 3 ? 'Active recovery'
    : intensity <= 5 ? 'Moderate'
    : intensity <= 7 ? 'Solid session'
    : intensity <= 9 ? 'Hard session'
    : 'Full intensity'

  const pills = ['Glute bridges', 'Dead bug', 'Hip hinge', 'Band abduction']

  return (
    <div style={{ ...cardStyle(theme), display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div style={{ fontSize: '20px', fontWeight: 600, color: theme.accent, marginTop: '4px', transition: 'color 1.5s ease' }}>
        {workoutTitle}
      </div>
      {!isRest && (
        <div style={{ fontSize: '12px', color: theme.textSecondary, marginBottom: '8px' }}>
          {subtitle}
        </div>
      )}

      {/* Rest day */}
      {isRest && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '20px', fontWeight: 600, color: theme.textSecondary }}>
            Recovery Day
          </div>
          <div style={{ fontSize: '13px', color: theme.textMuted }}>
            Light stretching or full rest
          </div>
          {todaysPlan.nutritionNote && (
            <div style={{ fontSize: '11px', color: theme.textMuted, fontStyle: 'italic' }}>
              {todaysPlan.nutritionNote}
            </div>
          )}
          <div className="rest-day-stretches" style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '10px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              Today's Stretches
            </div>
            {REST_DAY_STRETCHES.map((stretch, i) => (
              <div key={i} style={{
                display:        'flex',
                justifyContent: 'space-between',
                alignItems:     'center',
                padding:        '6px 0',
                borderBottom:   i < REST_DAY_STRETCHES.length - 1 ? `0.5px solid ${theme.cardBorder}` : 'none',
              }}>
                <span style={{ fontSize: '13px', color: theme.textPrimary }}>
                  {stretch.name}
                </span>
                <span style={{ fontSize: '12px', color: theme.textMuted, background: theme.bgSecondary, padding: '2px 8px', borderRadius: '20px' }}>
                  {stretch.duration}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Walk day */}
      {isWalk && (
        <div style={{ marginTop: '4px' }}>
          <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{
              background: '#172554', color: '#60a5fa',
              borderRadius: '20px', padding: '3px 10px', fontSize: '11px',
            }}>
              {todaysPlan.distance}mi
            </span>
            <span style={{
              background: '#172554', color: '#60a5fa',
              borderRadius: '20px', padding: '3px 10px', fontSize: '11px',
            }}>
              {todaysPlan.speed}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '8px' }}>
            {todaysPlan.label}
          </div>
        </div>
      )}

      {/* Strength day — exercise pills */}
      {!isRest && !isWalk && (
        <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '6px' }}>
          {pills.map(p => (
            <span key={p} style={{
              background:   theme.bgSecondary,
              border:       `0.5px solid ${theme.cardBorder}`,
              color:        theme.textSecondary,
              borderRadius: '20px',
              padding:      '3px 10px',
              fontSize:     '11px',
              transition:   CARD_TRANSITION,
            }}>
              {p}
            </span>
          ))}
        </div>
      )}

      {/* Intensity bar — hidden on rest days */}
      {!isRest && (
        <div>
          <div style={{ fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            Today's Intensity
          </div>
          <div style={{ display: 'flex', gap: '3px' }}>
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} style={{
                flex: 1, height: '6px', borderRadius: '3px',
                background: i < intensity ? theme.accent : theme.cardBorder,
                transition: 'background-color 1.5s ease',
              }} />
            ))}
          </div>
          <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '5px' }}>
            {intensityLabel}
          </div>
        </div>
      )}

      {/* Coach note */}
      <div style={{ fontSize: '11px', color: theme.textMuted }}>
        {decision?.reasons?.[0] ?? 'HRV trending up. Sleep was solid. Green light.'}
      </div>

      <button
        className="start-workout-btn"
        onClick={() => navigate('/workout')}
        style={{
          width: '100%',
          padding: '8px',
          background: 'transparent',
          border: `0.5px solid ${theme.accent}`,
          borderRadius: '8px',
          color: theme.accent,
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'border-color 1.5s ease, color 1.5s ease',
        }}
      >
        → Start Workout
      </button>
    </div>
  )
}


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

  const exerciseLast7  = healthData?.exerciseLast7 ?? []
  const distanceLast7  = healthData?.distanceLast7 ?? []
  const qualifyingDays = exerciseLast7
    .map(exDay => {
      const distDay = distanceLast7.find(d => d.date === exDay.date)
      return { mins: exDay.mins, miles: distDay?.miles ?? 0 }
    })
    .filter(d => d.mins >= 20 && d.miles > 0)
  const hasPace        = qualifyingDays.length >= 2
  const paceMinPerMile = hasPace
    ? qualifyingDays.reduce((sum, d) => sum + d.mins / d.miles, 0) / qualifyingDays.length
    : 20.0
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

export default function BottomRow({ theme, decision, streak, weekSummary, todaysPlan }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10px',
      padding: '0 14px 14px',
    }}>
      <TomorrowCard theme={theme} decision={decision} todaysPlan={todaysPlan} />
      <WeeklySummary weekSummary={weekSummary} theme={theme} streak={streak} />
      <div style={{ gridColumn: 'span 2' }}>
        <TrainingPlanCard theme={theme} />
      </div>
      <RaceCard theme={theme} />
    </div>
  )
}
