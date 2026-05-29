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

const label = { fontSize: '11px', fontWeight: 600, color: '#aaa', letterSpacing: '0.04em' }
const sublabel = { fontSize: '11px', color: '#555', marginTop: '1px' }
const value = { fontSize: '24px', fontWeight: 700, color: '#fff', margin: '8px 0 6px' }

function SleepCard() {
  const stages = [
    { name: 'Deep',  val: '0h 26m' },
    { name: 'Core',  val: '5h 32m' },
    { name: 'REM',   val: '1h 42m' },
    { name: 'Awake', val: '0h 25m' },
  ]
  return (
    <div style={card}>
      <div>
        {badge('GOOD', 'good')}
        <div style={label}>SLEEP</div>
        <div style={sublabel}>Last night</div>
      </div>
      <div style={value}>7.7 hrs</div>
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

function Sparkline({ points, color }) {
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ')
  const last = points[points.length - 1]
  return (
    <svg width="100%" height="36" viewBox="0 0 200 36" preserveAspectRatio="none">
      <path d={d} stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
    </svg>
  )
}

function HRCard() {
  const points = [[0,18],[33,20],[66,22],[100,16],[133,24],[166,20],[200,14]]
  return (
    <div style={card}>
      <div>
        {badge('NORMAL', 'normal')}
        <div style={label}>RESTING HR</div>
        <div style={sublabel}>7-day trend</div>
      </div>
      <div style={value}>63 bpm</div>
      <Sparkline points={points} color="#4a9edd" />
    </div>
  )
}

function HRVCard() {
  const points = [[0,28],[33,24],[66,20],[100,22],[133,18],[166,14],[200,10]]
  return (
    <div style={card}>
      <div>
        {badge('GOOD', 'good')}
        <div style={label}>HRV</div>
        <div style={sublabel}>7-day trend</div>
      </div>
      <div style={value}>40 ms</div>
      <Sparkline points={points} color="#3ecf8e" />
    </div>
  )
}

function StepsCard() {
  return (
    <div style={card}>
      <div>
        {badge('39%', 'warn')}
        <div style={label}>STEPS</div>
        <div style={sublabel}>Goal: 8,000</div>
      </div>
      <div style={value}>3,122 steps</div>
      <div style={{ height: '5px', background: '#2a2a2e', borderRadius: '3px', margin: '4px 0' }}>
        <div style={{ width: '39%', height: '100%', background: '#3ecf8e', borderRadius: '3px' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#555', marginTop: '3px' }}>
        <span>0</span>
        <span>8k</span>
      </div>
      <div style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>4,878 steps to go</div>
    </div>
  )
}

export default function MetricCards() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10px',
      padding: '14px',
      background: '#0e0e10',
    }}>
      <SleepCard />
      <HRCard />
      <HRVCard />
      <StepsCard />
    </div>
  )
}
