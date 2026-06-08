const CARD_TRANSITION = 'background-color 1.5s ease, border-color 1.5s ease'

function SlimSleepSparkline({ sleepLast7, theme }) {
  if (!sleepLast7?.length) return null
  return (
    <div>
      <div style={{ fontSize: '10px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
        Sleep
      </div>
      <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end' }}>
        {sleepLast7.map(({ date, hours }) => {
          const barH     = hours ? Math.max(2, Math.round((Math.min(hours, 9) / 9) * 180)) : 3
          const barColor = !hours ? theme.cardBorder
            : hours >= 6.5 ? theme.accent
            : hours >= 5.5 ? '#888'
            : '#e05555'
          const dayLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })
          return (
            <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '9px', color: theme.textMuted, marginBottom: '2px', height: '11px', lineHeight: '11px' }}>
                {hours ? hours.toFixed(1) : ''}
              </div>
              <div style={{
                width:        '100%',
                height:       `${barH}px`,
                background:   barColor,
                borderRadius: '2px 2px 0 0',
                transition:   'background-color 1.5s ease',
              }} />
              <div style={{ fontSize: '9px', color: theme.textMuted, marginTop: '3px' }}>
                {dayLabel}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function WeeklySummary({ weekSummary, theme, streak }) {
  if (!weekSummary) {
    return (
      <div style={{ background: theme.cardBg, border: `0.5px solid ${theme.cardBorder}`, borderRadius: '10px', padding: '14px', transition: CARD_TRANSITION }}>
        <div style={{ fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>THIS WEEK</div>
        <div style={{ color: theme.textMuted, fontSize: '13px', marginTop: '8px' }}>Loading...</div>
      </div>
    )
  }

  const {
    avgSleep, nightsUnder6, sleepTrend, sleepLast7,
    avgSteps, avgHRV, avgActiveEnergy,
    workoutsCompleted, workoutsPlanned,
  } = weekSummary

  const trendArrow = sleepTrend === 'up'   ? { char: '↑', color: '#3ecf8e' }
    : sleepTrend === 'down' ? { char: '↓', color: '#f0a030' }
    : { char: '→', color: theme.textMuted }

  const sleepColor   = avgSleep >= 6.5 ? theme.accent : avgSleep >= 5.5 ? theme.textPrimary : '#f0a030'
  const workoutColor = workoutsCompleted >= workoutsPlanned ? theme.accent : theme.textPrimary

  const stats = [
    { label: 'Workouts',        value: `${workoutsCompleted} of ${workoutsPlanned}`, color: workoutColor },
    { label: 'Avg sleep',       value: avgSleep != null ? `${avgSleep}h` : '--',      color: sleepColor, suffix: trendArrow },
    { label: 'Avg steps',       value: avgSteps != null ? avgSteps.toLocaleString() : '--', color: theme.textPrimary },
    { label: 'Streak',          value: streak != null ? `${streak}d` : '--',          color: theme.textPrimary },
    { label: 'Avg active kcal', value: avgActiveEnergy != null ? `${avgActiveEnergy} kcal` : '--', color: theme.accent },
    { label: 'Avg HRV',         value: avgHRV != null ? `${avgHRV} ms` : '--',        color: theme.accent },
  ]

  const flags = []
  if (avgSleep != null && avgSleep < 5.5) {
    flags.push(`⚠ Avg sleep ${avgSleep}h this week. ${nightsUnder6} night${nightsUnder6 !== 1 ? 's' : ''} under 5.5h. Recovery is compromised — protect sleep tonight.`)
  }
  if (workoutsCompleted === 0) {
    flags.push('⚠ No logged workouts this week. Even a short session counts.')
  }
  if (avgSteps != null && avgSteps < 3000) {
    flags.push('⚠ Very low step count this week. Try adding a short daily walk.')
  }

  return (
    <div style={{ background: theme.cardBg, border: `0.5px solid ${theme.cardBorder}`, borderRadius: '10px', padding: '14px', transition: CARD_TRANSITION }}>
      <div style={{ fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
        THIS WEEK
      </div>

      {/* Stats left (2fr) + sleep sparkline right (1fr) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', alignItems: 'start' }}>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {stats.map(s => (
              <div key={s.label}>
                <div style={{ fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: s.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {s.value}
                  {s.suffix && (
                    <span style={{ fontSize: '12px', color: s.suffix.color }}>{s.suffix.char}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {flags.map((flag, i) => (
            <div key={i} style={{
              background:   theme.badgeWarn.bg,
              border:       `0.5px solid ${theme.badgeWarn.color}40`,
              borderRadius: '6px',
              padding:      '8px 10px',
              marginTop:    '10px',
              fontSize:     '11px',
              color:        theme.badgeWarn.color,
              transition:   CARD_TRANSITION,
            }}>
              {flag}
            </div>
          ))}
        </div>

        <SlimSleepSparkline sleepLast7={sleepLast7} theme={theme} />
      </div>
    </div>
  )
}
