import { useNavigate } from 'react-router-dom'
import { getNextRace, getDaysUntil, getProgressPercent } from '../utils/raceManager'
import WeeklySummary from './WeeklySummary'
import TrainingPlanCard from './TrainingPlanCard'

const CARD_TRANSITION = 'background-color 1.5s ease, border-color 1.5s ease'

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
    <div style={{ ...cardStyle(theme), display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
        <div style={{ marginTop: '12px' }}>
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
      <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '10px' }}>
        {decision?.reasons?.[0] ?? 'HRV trending up. Sleep was solid. Green light.'}
      </div>

      <button
        className="start-workout-btn"
        onClick={() => navigate('/workout')}
        style={{
          width: '100%',
          marginTop: '12px',
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


function RaceCard({ theme }) {
  const navigate  = useNavigate()
  const nextRace  = getNextRace()
  const daysUntil = nextRace ? getDaysUntil(nextRace.date) : null
  const progress  = nextRace ? getProgressPercent(nextRace.date) : 0

  if (!nextRace) return null

  return (
    <div style={{ ...cardStyle(theme), gridColumn: 'span 2' }}>
      {/* Label */}
      <div style={{ fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        NEXT RACE
      </div>

      {/* Race name */}
      <div style={{ fontSize: '18px', fontWeight: 600, color: theme.textPrimary, marginTop: '4px' }}>
        {nextRace.name}
      </div>

      {/* Distance · location */}
      <div style={{ fontSize: '13px', color: theme.textSecondary, marginTop: '2px' }}>
        {[nextRace.distance, nextRace.location].filter(Boolean).join(' · ')}
      </div>

      {/* Goal */}
      {nextRace.goal && (
        <div style={{ fontSize: '13px', color: theme.accentText, fontStyle: 'italic', marginTop: '3px', transition: 'color 1.5s ease' }}>
          {nextRace.goal}
        </div>
      )}

      {/* Progress bar */}
      <div style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: theme.textMuted, marginBottom: '5px' }}>
          <span>Today</span>
          <span>Race day</span>
        </div>
        <div style={{ height: '4px', background: theme.cardBorder, borderRadius: '2px', overflow: 'hidden', transition: CARD_TRANSITION }}>
          <div style={{ width: `${progress}%`, height: '100%', background: theme.accent, borderRadius: '2px', transition: 'background-color 1.5s ease' }} />
        </div>
      </div>

      {/* Days away + manage link */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px' }}>
        <div>
          <span style={{ fontSize: '36px', fontWeight: 700, color: '#c084fc', lineHeight: 1 }}>
            {daysUntil}
          </span>
          <span style={{ fontSize: '13px', color: theme.textMuted, marginLeft: '6px' }}>
            days away
          </span>
        </div>
        <button onClick={() => navigate('/races')} style={{
          background: 'none', border: 'none',
          color: theme.textMuted, fontSize: '11px',
          cursor: 'pointer', textDecoration: 'underline', padding: 0,
        }}>
          Manage →
        </button>
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
