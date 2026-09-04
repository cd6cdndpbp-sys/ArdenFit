import { getWorkoutLogs } from '../utils/workoutLogger'

const CARD_TRANSITION = 'background-color 1.5s ease, border-color 1.5s ease'

const HEATMAP_WEEKS = 6
const DAY_LETTERS   = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const localDateStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// Rolling recent window, not "since app start" — getWorkoutLogs() currently holds just one
// entry (the known migration-fixed record from 2026-05-30, see workoutLogger.js), not an
// ongoing log. A recent window honestly shows "no recent consistency" rather than a stale
// checkmark from months back. Only completed-vs-not is used (accent/warn/none) — a third
// "skipped but planned" tier would need reconstructing what the training plan called for on
// a given historical date, which isn't reliable: the plan's phase structure has been
// replaced multiple times and old phase definitions no longer exist in trainingPlan.js.
function WorkoutHeatmap({ theme }) {
  const byDate = new Map(getWorkoutLogs().map(l => [l.date, l.completed]))

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayDow    = (today.getDay() + 6) % 7 // Mon=0 ... Sun=6
  const thisMonday  = new Date(today)
  thisMonday.setDate(today.getDate() - todayDow)
  const gridStart   = new Date(thisMonday)
  gridStart.setDate(thisMonday.getDate() - (HEATMAP_WEEKS - 1) * 7)

  const weeks = Array.from({ length: HEATMAP_WEEKS }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = new Date(gridStart)
      date.setDate(gridStart.getDate() + w * 7 + d)
      return date
    })
  )

  const cellInfo = (date) => {
    if (date > today) return { color: 'transparent', label: 'upcoming' }
    const dateStr = localDateStr(date)
    if (!byDate.has(dateStr)) return { color: theme.cardBorder, label: 'no workout logged' }
    return byDate.get(dateStr)
      ? { color: theme.accent, label: 'completed' }
      : { color: theme.badgeWarn.color, label: 'bailed early' }
  }

  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ fontSize: '10px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
        Consistency — last {HEATMAP_WEEKS} weeks
      </div>
      <div style={{ display: 'inline-block' }}>
        <div style={{ display: 'flex', gap: '3px', marginBottom: '3px' }}>
          {DAY_LETTERS.map((letter, i) => (
            <div key={i} style={{ width: '13px', fontSize: '8px', color: theme.textMuted, textAlign: 'center' }}>
              {letter}
            </div>
          ))}
        </div>
        {weeks.map((days, wi) => (
          <div key={wi} style={{ display: 'flex', gap: '3px', marginBottom: '3px' }}>
            {days.map((date, di) => {
              const { color, label } = cellInfo(date)
              return (
                <div
                  key={di}
                  title={`${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${label}`}
                  style={{
                    width: '13px', height: '13px', borderRadius: '3px',
                    background: color,
                    transition: 'background-color 1.5s ease',
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

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

      <WorkoutHeatmap theme={theme} />
    </div>
  )
}
