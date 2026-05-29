const DAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const CARD_TRANSITION = 'background-color 1.5s ease, border-color 1.5s ease'

const TODAY_STR = new Date().toISOString().split('T')[0]

function SleepSparkline({ sleepLast7, theme }) {
  if (!sleepLast7?.length) return null
  return (
    <div>
      <div style={{ fontSize: '10px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
        Sleep last 7 nights
      </div>
      <div style={{ display: 'flex', gap: '4px' }}>
        {sleepLast7.map(({ date, hours }) => {
          const isToday  = date === TODAY_STR
          const barH     = hours ? Math.max(2, Math.round((Math.min(hours, 9) / 9) * 60)) : 4
          const barColor = !hours ? theme.cardBorder
            : hours >= 7 ? theme.accent
            : hours >= 6 ? '#888'
            : '#e05555'
          const dayIdx   = new Date(date + 'T00:00:00').getDay()
          const topLabel = hours ? hours.toFixed(1) : isToday ? '—' : ''
          return (
            <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '9px', color: theme.textMuted, height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {topLabel}
              </div>
              <div style={{ height: '60px', display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                <div style={{
                  width: '100%', height: `${barH}px`,
                  background: barColor,
                  borderRadius: '2px 2px 0 0',
                  transition: 'background-color 1.5s ease',
                }} />
              </div>
              <div style={{ fontSize: '10px', color: theme.textMuted, marginTop: '4px' }}>
                {DAY_INITIALS[dayIdx]}
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
    avgSleep, nightsUnder7, sleepTrend, sleepLast7,
    avgSteps, avgHRV, avgActiveEnergy,
    workoutsCompleted, workoutsPlanned,
  } = weekSummary

  const trendArrow = sleepTrend === 'up'   ? { char: '↑', color: '#3ecf8e' }
    : sleepTrend === 'down' ? { char: '↓', color: '#f0a030' }
    : { char: '→', color: theme.textMuted }

  const sleepColor = avgSleep >= 7 ? theme.accent : avgSleep >= 6 ? theme.textPrimary : '#f0a030'
  const workoutColor = workoutsCompleted >= workoutsPlanned ? theme.accent : theme.textPrimary

  const stats = [
    { label: 'Workouts',       value: `${workoutsCompleted} of ${workoutsPlanned}`, color: workoutColor },
    { label: 'Avg sleep',      value: avgSleep != null ? `${avgSleep}h` : '--',      color: sleepColor, suffix: trendArrow },
    { label: 'Avg steps',      value: avgSteps != null ? avgSteps.toLocaleString() : '--', color: theme.textPrimary },
    { label: 'Streak',         value: streak != null ? `${streak}d` : '--',          color: theme.textPrimary },
    { label: 'Avg active kcal', value: avgActiveEnergy != null ? `${avgActiveEnergy} kcal` : '--', color: theme.accent },
    { label: 'Avg HRV',        value: avgHRV != null ? `${avgHRV} ms` : '--',        color: theme.accent },
  ]

  const flags = []
  if (avgSleep != null && avgSleep < 7) {
    flags.push(`⚠ Avg sleep ${avgSleep}h this week. ${nightsUnder7} night${nightsUnder7 !== 1 ? 's' : ''} under 7h. This is suppressing recovery — prioritize sleep.`)
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

      {/* 2×3 stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
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

      {/* Sleep sparkline */}
      <SleepSparkline sleepLast7={sleepLast7} theme={theme} />

      {/* Flags */}
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
  )
}
