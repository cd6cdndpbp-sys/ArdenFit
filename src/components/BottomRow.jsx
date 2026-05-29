import { useNavigate } from 'react-router-dom'
import { getNextRace, getDaysUntil, getProgressPercent } from '../utils/raceManager'

const CARD_TRANSITION = 'background-color 1.5s ease, border-color 1.5s ease'

const cardStyle = (theme) => ({
  background:   theme.cardBg,
  border:       `0.5px solid ${theme.cardBorder}`,
  borderRadius: '10px',
  padding:      '14px',
  transition:   CARD_TRANSITION,
})

function TomorrowCard({ theme, decision }) {
  const navigate = useNavigate()
  const now  = new Date()
  const hour = now.getHours()
  const isToday = hour >= 5
  const nextWorkoutDate = new Date(now)
  nextWorkoutDate.setDate(now.getDate() + (isToday ? 0 : 1))
  const dayName = nextWorkoutDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
  const label = isToday ? `TODAY · ${dayName}` : `TOMORROW · ${dayName}`

  const pills = ['Glute bridges', 'Dead bug', 'Hip hinge', 'Band abduction']
  return (
    <div style={cardStyle(theme)}>
      <div style={{ fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div style={{ fontSize: '20px', fontWeight: 600, color: theme.accent, marginTop: '6px', transition: 'color 1.5s ease' }}>
        Lower body + core
      </div>
      <div style={{ fontSize: '12px', color: theme.textSecondary, marginBottom: '10px' }}>
        30–40 min · full intensity
      </div>
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
      <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '10px' }}>
        {decision?.reasons?.[0] ?? 'HRV trending up. Sleep was solid. Green light.'}
      </div>
      <button
        onClick={() => navigate('/workout')}
        style={{
          display: 'block',
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

function ThisWeekCard({ theme, streak, activeEnergyToday }) {
  const stats = [
    { label: 'Workouts',    value: '3 of 5',                                             color: theme.textPrimary },
    { label: 'Avg sleep',   value: '5.7h ↓',                                             color: '#f0a030'        },
    { label: 'Avg steps',   value: '3,188',                                              color: theme.textPrimary },
    { label: 'Streak',      value: streak != null ? `${streak}d` : '--',                 color: theme.textPrimary },
    { label: 'Active kcal', value: activeEnergyToday != null ? `${activeEnergyToday} kcal` : '--', color: theme.accent },
  ]
  return (
    <div style={cardStyle(theme)}>
      <div style={{ fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        THIS WEEK
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
        {stats.map(s => (
          <div key={s.label}>
            <div style={{ fontSize: '11px', color: theme.textMuted }}>{s.label}</div>
            <div style={{ fontSize: '15px', fontWeight: 500, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{
        background:   theme.badgeWarn.bg,
        borderRadius: '6px',
        padding:      '8px 10px',
        marginTop:    '10px',
        fontSize:     '11px',
        color:        theme.badgeWarn.color,
        transition:   CARD_TRANSITION,
      }}>
        ⚠ Avg sleep 5.7h this week. Three nights under 7h. This is suppressing recovery — prioritize sleep this weekend.
      </div>
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

export default function BottomRow({ theme, decision, streak, activeEnergyToday, respiratoryRate }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10px',
      padding: '0 14px 14px',
    }}>
      <TomorrowCard theme={theme} decision={decision} />
      <ThisWeekCard theme={theme} streak={streak} activeEnergyToday={activeEnergyToday} />
      <RaceCard     theme={theme} />
    </div>
  )
}
