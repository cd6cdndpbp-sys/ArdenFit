const CARD_TRANSITION = 'background-color 1.5s ease, border-color 1.5s ease'

const cardStyle = (theme) => ({
  background:   theme.cardBg,
  border:       `0.5px solid ${theme.cardBorder}`,
  borderRadius: '10px',
  padding:      '14px',
  transition:   CARD_TRANSITION,
})

function TomorrowCard({ theme, decision }) {
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
  const totalWeeks     = 52
  const weeksRemaining = 49
  const weeksElapsed   = totalWeeks - weeksRemaining
  const progress       = Math.round((weeksElapsed / totalWeeks) * 100)

  return (
    <div style={{ ...cardStyle(theme), display: 'flex', alignItems: 'center', justifyContent: 'space-between', gridColumn: 'span 2' }}>
      <div style={{ minWidth: '160px' }}>
        <div style={{ fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>NEXT RACE</div>
        <div style={{ fontSize: '16px', fontWeight: 600, color: theme.textPrimary, marginTop: '4px' }}>
          MCM Historic Half
        </div>
        <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '2px' }}>
          May 2027 · Fredericksburg, VA
        </div>
      </div>

      <div style={{ flex: 1, margin: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: theme.textMuted, marginBottom: '5px' }}>
          <span>Today</span>
          <span>Race day</span>
        </div>
        <div style={{ height: '5px', background: theme.cardBorder, borderRadius: '3px', transition: CARD_TRANSITION }}>
          <div style={{ width: `${progress}%`, height: '100%', background: theme.accent, borderRadius: '3px', transition: 'background-color 1.5s ease' }} />
        </div>
      </div>

      <div style={{ textAlign: 'right', minWidth: '72px' }}>
        <div style={{ fontSize: '28px', fontWeight: 700, color: '#c084fc', lineHeight: 1 }}>
          {weeksRemaining * 7}
        </div>
        <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '3px' }}>days away</div>
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
