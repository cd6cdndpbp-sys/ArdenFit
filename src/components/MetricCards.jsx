const FALLBACK = {
  sleep:     { total: 7.7, deep: 26, core: 332, rem: 102, awake: 25 },
  restingHR: 63,
  hrTrend:   [66, 64, 63, 67, 61, 63, 60],
  hrv:       40,
  hrvTrend:  [32, 36, 38, 36, 40, 42, 44],
  steps:     3122,
}

const STEPS_GOAL = 8000

const badgeStyles = {
  good:   { background: '#0f3d2e', color: '#3ecf8e' },
  normal: { background: '#1a2a3a', color: '#4a9edd' },
  warn:   { background: '#3d2a0a', color: '#f0a030' },
}

const badge = (label, variant) => (
  <span style={{
    ...badgeStyles[variant],
    fontSize: '10px',
    fontWeight: 600,
    padding: '2px 7px',
    borderRadius: '20px',
    textTransform: 'uppercase',
    float: 'right',
  }}>
    {label}
  </span>
)

const card = {
  background: '#18181c',
  borderRadius: '10px',
  padding: '12px 14px',
  border: '0.5px solid #2a2a2e',
}

const labelStyle  = { fontSize: '11px', fontWeight: 600, color: '#aaa', letterSpacing: '0.04em' }
const sublabelStyle = { fontSize: '11px', color: '#555', marginTop: '1px' }
const valueStyle  = { fontSize: '24px', fontWeight: 700, color: '#fff', margin: '8px 0 6px' }

const minsToHm = (mins) => {
  if (!mins) return '--'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function sleepBadge(hrs) {
  if (hrs == null) return ['--', 'normal']
  if (hrs >= 7) return ['GOOD', 'good']
  if (hrs >= 6) return ['OK', 'normal']
  return ['LOW', 'warn']
}

function trendPoints(values) {
  if (!values || values.length === 0) return [[0, 18], [200, 18]]
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const xStep = 200 / (values.length - 1 || 1)
  return values.map((v, i) => [
    Math.round(i * xStep),
    Math.round(4 + ((max - v) / range) * 28),
  ])
}

function Sparkline({ values, color }) {
  const points = trendPoints(values)
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ')
  const last = points[points.length - 1]
  return (
    <svg width="100%" height="36" viewBox="0 0 200 36" preserveAspectRatio="none">
      <path d={d} stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
    </svg>
  )
}

function SleepCard({ sleep }) {
  const s = sleep || FALLBACK.sleep
  const totalHrs = s.total != null ? s.total.toFixed(1) : FALLBACK.sleep.total
  const [badgeLabel, badgeVariant] = sleepBadge(parseFloat(totalHrs))
  const stages = [
    { name: 'Deep',  val: minsToHm(s.deep  ?? FALLBACK.sleep.deep)  },
    { name: 'Core',  val: minsToHm(s.core  ?? FALLBACK.sleep.core)  },
    { name: 'REM',   val: minsToHm(s.rem   ?? FALLBACK.sleep.rem)   },
    { name: 'Awake', val: minsToHm(s.awake ?? FALLBACK.sleep.awake) },
  ]
  return (
    <div style={card}>
      <div>
        {badge(badgeLabel, badgeVariant)}
        <div style={labelStyle}>SLEEP</div>
        <div style={sublabelStyle}>Last night</div>
      </div>
      <div style={valueStyle}>{totalHrs} hrs</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', fontSize: '11px' }}>
        {stages.map(s => (
          <div key={s.name}>
            <div style={{ color: '#555' }}>{s.name}</div>
            <div style={{ color: '#888' }}>{s.val}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function HRCard({ restingHR, hrTrend }) {
  const hrVal   = restingHR ?? FALLBACK.restingHR
  const trend   = hrTrend?.length ? hrTrend : FALLBACK.hrTrend
  return (
    <div style={card}>
      <div>
        {badge('NORMAL', 'normal')}
        <div style={labelStyle}>RESTING HR</div>
        <div style={sublabelStyle}>7-day trend</div>
      </div>
      <div style={valueStyle}>{hrVal} bpm</div>
      <Sparkline values={trend} color="#4a9edd" />
    </div>
  )
}

function HRVCard({ hrv, hrvTrend }) {
  const hrvVal = hrv ?? FALLBACK.hrv
  const trend  = hrvTrend?.length ? hrvTrend : FALLBACK.hrvTrend
  return (
    <div style={card}>
      <div>
        {badge('GOOD', 'good')}
        <div style={labelStyle}>HRV</div>
        <div style={sublabelStyle}>7-day trend</div>
      </div>
      <div style={valueStyle}>{hrvVal} ms</div>
      <Sparkline values={trend} color="#3ecf8e" />
    </div>
  )
}

function StepsCard({ steps }) {
  const s    = steps ?? FALLBACK.steps
  const pct  = Math.min(Math.round((s / STEPS_GOAL) * 100), 100)
  const remaining = Math.max(STEPS_GOAL - s, 0)
  return (
    <div style={card}>
      <div>
        {badge(`${pct}%`, pct >= 100 ? 'good' : pct >= 60 ? 'normal' : 'warn')}
        <div style={labelStyle}>STEPS</div>
        <div style={sublabelStyle}>Goal: 8,000</div>
      </div>
      <div style={valueStyle}>{s.toLocaleString()} steps</div>
      <div style={{ height: '5px', background: '#2a2a2e', borderRadius: '3px', margin: '4px 0' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: '#3ecf8e', borderRadius: '3px' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#555', marginTop: '3px' }}>
        <span>0</span>
        <span>8k</span>
      </div>
      <div style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>
        {remaining > 0 ? `${remaining.toLocaleString()} steps to go` : 'Goal reached!'}
      </div>
    </div>
  )
}

export default function MetricCards({ healthData }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10px',
      padding: '14px',
      background: '#0e0e10',
    }}>
      <SleepCard  sleep={healthData?.sleep}                              />
      <HRCard     restingHR={healthData?.restingHR} hrTrend={healthData?.hrTrend} />
      <HRVCard    hrv={healthData?.hrv}             hrvTrend={healthData?.hrvTrend} />
      <StepsCard  steps={healthData?.steps}                              />
    </div>
  )
}
