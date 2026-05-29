const cardBase = {
  background: '#18181c',
  border: '0.5px solid #2a2a2e',
  borderRadius: '10px',
  padding: '14px',
}

const sectionLabel = {
  fontSize: '11px',
  color: '#555',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

function TomorrowCard() {
  const pills = ['Glute bridges', 'Dead bug', 'Hip hinge', 'Band abduction']
  return (
    <div style={cardBase}>
      <div style={sectionLabel}>TOMORROW · FRIDAY</div>
      <div style={{ fontSize: '20px', fontWeight: 600, color: '#3ecf8e', marginTop: '6px' }}>
        Lower body + core
      </div>
      <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
        30–40 min · full intensity
      </div>
      <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '6px' }}>
        {pills.map(p => (
          <span key={p} style={{
            background: '#222228',
            border: '0.5px solid #333',
            color: '#aaa',
            borderRadius: '20px',
            padding: '3px 10px',
            fontSize: '11px',
          }}>
            {p}
          </span>
        ))}
      </div>
      <div style={{ fontSize: '11px', color: '#555', marginTop: '10px' }}>
        HRV trending up. Sleep was solid. Green light.
      </div>
    </div>
  )
}

function ThisWeekCard() {
  const stats = [
    { label: 'Workouts',  value: '3 of 5', color: '#fff' },
    { label: 'Avg sleep', value: '5.7h ↓', color: '#f0a030' },
    { label: 'Avg steps', value: '3,188',  color: '#fff' },
    { label: 'Streak',    value: '0d',     color: '#fff' },
  ]
  return (
    <div style={cardBase}>
      <div style={sectionLabel}>THIS WEEK</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
        {stats.map(s => (
          <div key={s.label}>
            <div style={{ fontSize: '11px', color: '#666' }}>{s.label}</div>
            <div style={{ fontSize: '15px', fontWeight: 500, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{
        background: '#3d2a0a',
        borderRadius: '6px',
        padding: '8px 10px',
        marginTop: '10px',
        fontSize: '11px',
        color: '#f0a030',
      }}>
        ⚠ Avg sleep 5.7h this week. Three nights under 7h. This is suppressing recovery — prioritize sleep this weekend.
      </div>
    </div>
  )
}

function RaceCard() {
  const totalWeeks = 52
  const weeksRemaining = 49
  const weeksElapsed = totalWeeks - weeksRemaining
  const progress = Math.round((weeksElapsed / totalWeeks) * 100)

  return (
    <div style={{ ...cardBase, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gridColumn: 'span 2' }}>
      <div style={{ minWidth: '160px' }}>
        <div style={sectionLabel}>NEXT RACE</div>
        <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginTop: '4px' }}>
          MCM Historic Half
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
          May 2027 · Fredericksburg, VA
        </div>
      </div>

      <div style={{ flex: 1, margin: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#555', marginBottom: '5px' }}>
          <span>Today</span>
          <span>Race day</span>
        </div>
        <div style={{ height: '5px', background: '#2a2a2e', borderRadius: '3px' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#3ecf8e', borderRadius: '3px' }} />
        </div>
      </div>

      <div style={{ textAlign: 'right', minWidth: '72px' }}>
        <div style={{ fontSize: '28px', fontWeight: 700, color: '#c084fc', lineHeight: 1 }}>
          {weeksRemaining * 7}
        </div>
        <div style={{ fontSize: '11px', color: '#555', marginTop: '3px' }}>days away</div>
      </div>
    </div>
  )
}

export default function BottomRow() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10px',
      padding: '0 14px 14px',
    }}>
      <TomorrowCard />
      <ThisWeekCard />
      <RaceCard />
    </div>
  )
}
