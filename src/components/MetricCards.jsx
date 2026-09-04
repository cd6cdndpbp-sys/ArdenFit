const FALLBACK = {
  restingHR: 63,
  hrTrend:   [66, 64, 63, 67, 61, 63, 60],
  hrv:       40,
  hrvTrend:  [32, 36, 38, 36, 40, 42, 44],
  steps:     3122,
}

const STEPS_GOAL  = 8000
const STEPS_FLOOR = 5000
const CARD_TRANSITION = 'background-color 1.5s ease, border-color 1.5s ease'

const cardStyle = (theme) => ({
  background:   theme.cardBg,
  border:       `0.5px solid ${theme.cardBorder}`,
  borderRadius: '10px',
  padding:      '12px 14px',
  transition:   CARD_TRANSITION,
})

const badge = (label, variant, theme) => {
  const s = variant === 'good' ? { background: theme.badgeGood.bg,   color: theme.badgeGood.color }
          : variant === 'warn' ? { background: theme.badgeWarn.bg,   color: theme.badgeWarn.color }
          :                      { background: theme.badgeNormal.bg, color: theme.badgeNormal.color }
  return (
    <span style={{
      ...s,
      fontSize: '10px',
      fontWeight: 600,
      padding: '2px 7px',
      borderRadius: '20px',
      textTransform: 'uppercase',
      float: 'right',
      transition: CARD_TRANSITION,
    }}>
      {label}
    </span>
  )
}

const valueStyle = { fontSize: '24px', fontWeight: 700, margin: '8px 0 6px' }

function hrvBadge(val) {
  if (val == null) return ['--',     'normal']
  if (val >= 40)  return ['GOOD',   'good']
  if (val >= 25)  return ['NORMAL', 'normal']
  return               ['LOW',    'warn']
}

function hrBadge(val, sevenDayAvg) {
  if (val == null) return ['--', 'normal']
  if (sevenDayAvg == null) return ['NORMAL', 'normal']
  const pctAbove = ((val - sevenDayAvg) / sevenDayAvg) * 100
  if (pctAbove >= 10)  return ['ELEVATED', 'warn']
  if (pctAbove <= -10) return ['LOW', 'good']
  return ['NORMAL', 'normal']
}

function trendPoints(values) {
  if (!values || values.length === 0) return [[0, 18], [200, 18]]
  const min   = Math.min(...values)
  const max   = Math.max(...values)
  const range = max - min || 1
  const xStep = 200 / (values.length - 1 || 1)
  return values.map((v, i) => [
    Math.round(i * xStep),
    Math.round(4 + ((max - v) / range) * 28),
  ])
}

function Sparkline({ values, color }) {
  const points = trendPoints(values)
  const d    = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ')
  const last = points[points.length - 1]
  return (
    <svg width="100%" height="36" viewBox="0 0 200 36" preserveAspectRatio="none">
      <path d={d} stroke={color} strokeWidth="2" fill="none" />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
    </svg>
  )
}

function StepsCard({ steps, theme }) {
  const s         = steps ?? FALLBACK.steps
  const pct       = Math.min(Math.round((s / STEPS_GOAL) * 100), 100)
  const remaining = Math.max(STEPS_GOAL - s, 0)
  const floorMet  = s >= STEPS_FLOOR

  return (
    <div className="metric-steps-card" style={cardStyle(theme)}>
      <div>
        {badge(`${pct}%`, pct >= 100 ? 'good' : pct >= 60 ? 'normal' : 'warn', theme)}
        <div style={{ fontSize: '11px', fontWeight: 600, color: theme.textSecondary, letterSpacing: '0.04em' }}>STEPS</div>
        <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '1px' }}>Goal: 8,000</div>
      </div>
      <div style={{ ...valueStyle, color: theme.textPrimary }}>{s.toLocaleString()}</div>
      <div style={{ height: '5px', background: theme.cardBorder, borderRadius: '3px', margin: '4px 0', transition: CARD_TRANSITION }}>
        <div style={{ width: `${pct}%`, height: '100%', background: theme.accent, borderRadius: '3px' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: theme.textMuted, marginTop: '3px' }}>
        <span>0</span>
        <span>8k</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
        <span style={{
          fontSize: '10px',
          fontWeight: 600,
          padding: '1px 6px',
          borderRadius: '20px',
          background: floorMet ? theme.badgeGood.bg : theme.badgeWarn.bg,
          color:      floorMet ? theme.badgeGood.color : theme.badgeWarn.color,
        }}>
          {floorMet ? 'FLOOR ✓' : 'FLOOR'}
        </span>
        <span style={{ fontSize: '11px', color: theme.textMuted }}>
          {floorMet
            ? `${(s - STEPS_FLOOR).toLocaleString()} above minimum`
            : `${(STEPS_FLOOR - s).toLocaleString()} to floor`}
        </span>
      </div>
      <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '3px' }}>
        {remaining > 0 ? `${remaining.toLocaleString()} steps to goal` : 'Goal reached!'}
      </div>
    </div>
  )
}

function HRVCard({ hrv, hrvTrend, theme }) {
  const hrvVal = hrv ?? FALLBACK.hrv
  const trend  = hrvTrend?.length ? hrvTrend : FALLBACK.hrvTrend
  const [badgeLabel, badgeVariant] = hrvBadge(hrvVal)
  return (
    <div style={cardStyle(theme)}>
      <div>
        {badge(badgeLabel, badgeVariant, theme)}
        <div style={{ fontSize: '11px', fontWeight: 600, color: theme.textSecondary, letterSpacing: '0.04em' }}>HRV</div>
        <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '1px' }}>7-day trend</div>
      </div>
      <div style={{ ...valueStyle, color: theme.textPrimary }}>{hrvVal} ms</div>
      <Sparkline values={trend} color={theme.sparklineHRV} />
    </div>
  )
}

function HRCard({ restingHR, hrTrend, hrSevenDayAvg, theme }) {
  const hrVal = restingHR ?? FALLBACK.restingHR
  const trend = hrTrend?.length ? hrTrend : FALLBACK.hrTrend
  const [badgeLabel, badgeVariant] = hrBadge(hrVal, hrSevenDayAvg)
  return (
    <div style={cardStyle(theme)}>
      <div>
        {badge(badgeLabel, badgeVariant, theme)}
        <div style={{ fontSize: '11px', fontWeight: 600, color: theme.textSecondary, letterSpacing: '0.04em' }}>RESTING HR</div>
        <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '1px' }}>7-day trend</div>
      </div>
      <div style={{ ...valueStyle, color: theme.textPrimary }}>{hrVal} bpm</div>
      <Sparkline values={trend} color={theme.sparklineHR} />
    </div>
  )
}

// No good/normal/warn badge here — unlike steps/HRV/resting HR, there's no established
// target or baseline for body fat % anywhere in the app to judge the reading against, so
// this card shows the reading plainly rather than inventing a threshold.
function BodyFatCard({ bodyFatPct, bodyFatTrend, theme }) {
  const trend = bodyFatTrend?.length ? bodyFatTrend : []
  return (
    <div style={cardStyle(theme)}>
      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: theme.textSecondary, letterSpacing: '0.04em' }}>BODY FAT</div>
        <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '1px' }}>Latest reading</div>
      </div>
      <div style={{ ...valueStyle, color: theme.textPrimary }}>{bodyFatPct != null ? `${bodyFatPct}%` : '--'}</div>
      {trend.length > 1 && <Sparkline values={trend} color={theme.sparklineHRV} />}
    </div>
  )
}

export default function MetricCards({ healthData, theme }) {
  return (
    <div className="metric-cards-grid" style={{
      display:    'grid',
      gap:        '10px',
      padding:    '14px',
      background: theme.bg,
      transition: 'background-color 1.5s ease',
    }}>
      <StepsCard steps={healthData?.steps}                                        theme={theme} />
      <HRVCard   hrv={healthData?.hrv}            hrvTrend={healthData?.hrvTrend} theme={theme} />
      <HRCard
        restingHR={healthData?.restingHR}
        hrTrend={healthData?.hrTrend}
        hrSevenDayAvg={healthData?.hrSevenDayAvg}
        theme={theme}
      />
      <BodyFatCard
        bodyFatPct={healthData?.currentBodyFatPct}
        bodyFatTrend={healthData?.bodyFatTrend}
        theme={theme}
      />
    </div>
  )
}
