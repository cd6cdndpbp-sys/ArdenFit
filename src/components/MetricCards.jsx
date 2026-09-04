const FALLBACK = {
  restingHR: 63,
  hrv:       40,
  steps:     3122,
}

const STEPS_GOAL  = 8000
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

function StepsCard({ steps, theme }) {
  const s   = steps ?? FALLBACK.steps
  const pct = Math.min(Math.round((s / STEPS_GOAL) * 100), 100)

  return (
    <div className="metric-steps-card" style={cardStyle(theme)}>
      <div>
        {badge(`${pct}%`, pct >= 100 ? 'good' : pct >= 60 ? 'normal' : 'warn', theme)}
        <div style={{ fontSize: '11px', fontWeight: 600, color: theme.textSecondary, letterSpacing: '0.04em' }}>STEPS</div>
      </div>
      <div style={{ ...valueStyle, color: theme.textPrimary }}>{s.toLocaleString()}</div>
    </div>
  )
}

function HRVCard({ hrv, theme }) {
  const hrvVal = hrv ?? FALLBACK.hrv
  const [badgeLabel, badgeVariant] = hrvBadge(hrvVal)
  return (
    <div style={cardStyle(theme)}>
      <div>
        {badge(badgeLabel, badgeVariant, theme)}
        <div style={{ fontSize: '11px', fontWeight: 600, color: theme.textSecondary, letterSpacing: '0.04em' }}>HRV</div>
      </div>
      <div style={{ ...valueStyle, color: theme.textPrimary }}>{hrvVal} ms</div>
    </div>
  )
}

function HRCard({ restingHR, hrSevenDayAvg, theme }) {
  const hrVal = restingHR ?? FALLBACK.restingHR
  const [badgeLabel, badgeVariant] = hrBadge(hrVal, hrSevenDayAvg)
  return (
    <div style={cardStyle(theme)}>
      <div>
        {badge(badgeLabel, badgeVariant, theme)}
        <div style={{ fontSize: '11px', fontWeight: 600, color: theme.textSecondary, letterSpacing: '0.04em' }}>RESTING HR</div>
      </div>
      <div style={{ ...valueStyle, color: theme.textPrimary }}>{hrVal} bpm</div>
    </div>
  )
}

// No good/normal/warn badge here — unlike steps/HRV/resting HR, there's no established
// target or baseline for body fat % anywhere in the app to judge the reading against, so
// this card shows the reading plainly rather than inventing a threshold.
function BodyFatCard({ bodyFatPct, theme }) {
  return (
    <div style={cardStyle(theme)}>
      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: theme.textSecondary, letterSpacing: '0.04em' }}>BODY FAT</div>
        <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '1px' }}>Latest reading</div>
      </div>
      <div style={{ ...valueStyle, color: theme.textPrimary }}>{bodyFatPct != null ? `${bodyFatPct}%` : '--'}</div>
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
      <StepsCard steps={healthData?.steps} theme={theme} />
      <HRVCard   hrv={healthData?.hrv}    theme={theme} />
      <HRCard
        restingHR={healthData?.restingHR}
        hrSevenDayAvg={healthData?.hrSevenDayAvg}
        theme={theme}
      />
      <BodyFatCard
        bodyFatPct={healthData?.currentBodyFatPct}
        theme={theme}
      />
    </div>
  )
}
