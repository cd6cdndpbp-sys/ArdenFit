import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../hooks/useTheme'
import {
  getRaces, addRace, deleteRace, setPrimaryRace,
  getDaysUntil, getProgressPercent,
} from '../utils/raceManager'

const EMPTY_FORM = { name: '', date: '', location: '', distance: '', goal: '', primary: false }

const formatDate = (dateStr) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })

export default function RaceManager() {
  const navigate  = useNavigate()
  const theme     = useTheme()
  const [races, setRaces]       = useState(getRaces)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(EMPTY_FORM)

  const refresh = () => setRaces(getRaces())

  const handleDelete = (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return
    deleteRace(id)
    refresh()
  }

  const handleSetPrimary = (id) => {
    setPrimaryRace(id)
    refresh()
  }

  const handleSave = () => {
    if (!form.name || !form.date) return
    addRace({ ...form })
    setForm(EMPTY_FORM)
    setShowForm(false)
    refresh()
  }

  const cardStyle = {
    background:   theme.cardBg,
    border:       `0.5px solid ${theme.cardBorder}`,
    borderRadius: '10px',
    padding:      '14px',
    marginBottom: '10px',
    transition:   'background-color 1.5s ease, border-color 1.5s ease',
  }

  const inputStyle = {
    width:        '100%',
    background:   theme.bgSecondary,
    border:       `0.5px solid ${theme.cardBorder}`,
    borderRadius: '8px',
    padding:      '10px 12px',
    color:        theme.textPrimary,
    fontSize:     '14px',
    marginBottom: '10px',
    outline:      'none',
    boxSizing:    'border-box',
  }

  return (
    <div style={{ background: theme.bg, minHeight: '100vh', transition: 'background-color 2s ease' }}>

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: theme.bg,
        borderBottom: `0.5px solid ${theme.cardBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: '52px',
        transition: 'background-color 2s ease, border-color 1.5s ease',
      }}>
        <button onClick={() => navigate('/')} style={{
          background: 'none', border: 'none',
          color: theme.accent, fontSize: '22px',
          cursor: 'pointer', padding: '4px 8px 4px 0', lineHeight: 1,
        }}>
          ←
        </button>
        <span style={{ fontSize: '15px', fontWeight: 600, color: theme.textPrimary }}>
          My Races
        </span>
        <div style={{ width: '36px' }} />
      </div>

      <div style={{ padding: '16px 14px 100px', maxWidth: '600px', margin: '0 auto' }}>

        {/* Race list */}
        {races.length === 0 && (
          <div style={{ color: theme.textMuted, textAlign: 'center', padding: '40px 0', fontSize: '14px' }}>
            No races yet. Add your first one below!
          </div>
        )}

        {races.map(race => {
          const days     = getDaysUntil(race.date)
          const progress = getProgressPercent(race.date)
          const isPast   = days <= 0

          return (
            <div key={race.id} style={cardStyle}>
              {/* Name + primary badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: theme.accent, flex: 1, marginRight: '8px' }}>
                  {race.name}
                </div>
                {race.primary && (
                  <span style={{
                    fontSize: '10px', fontWeight: 600,
                    padding: '2px 8px', borderRadius: '20px',
                    background: theme.accentBg, color: theme.accentText,
                    whiteSpace: 'nowrap',
                  }}>
                    PRIMARY
                  </span>
                )}
              </div>

              {/* Distance · location */}
              <div style={{ fontSize: '13px', color: theme.textMuted, marginTop: '4px' }}>
                {[race.distance, race.location].filter(Boolean).join(' · ')}
              </div>

              {/* Date + days away */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '6px' }}>
                <div style={{ fontSize: '13px', color: theme.textSecondary }}>
                  {formatDate(race.date)}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#c084fc' }}>
                  {isPast ? 'Past' : `${days}d away`}
                </div>
              </div>

              {/* Goal */}
              {race.goal && (
                <div style={{ fontSize: '13px', color: theme.accentText, fontStyle: 'italic', marginTop: '4px' }}>
                  Goal: {race.goal}
                </div>
              )}

              {/* Progress bar */}
              {!isPast && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: theme.textMuted, marginBottom: '4px' }}>
                    <span>Today</span>
                    <span>Race day</span>
                  </div>
                  <div style={{ height: '4px', background: theme.cardBorder, borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${progress}%`, height: '100%',
                      background: theme.accent, borderRadius: '2px',
                      transition: 'background-color 1.5s ease',
                    }} />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                {!race.primary && (
                  <button onClick={() => handleSetPrimary(race.id)} style={{
                    flex: 1, padding: '7px 10px',
                    background: theme.accentBg,
                    border: `0.5px solid ${theme.accent}`,
                    borderRadius: '8px',
                    color: theme.accentText,
                    fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    transition: 'background-color 1.5s ease, border-color 1.5s ease',
                  }}>
                    Set as Primary
                  </button>
                )}
                <button onClick={() => handleDelete(race.id, race.name)} style={{
                  padding: '7px 14px',
                  background: 'transparent',
                  border: '0.5px solid #e05555',
                  borderRadius: '8px',
                  color: '#e05555',
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                }}>
                  Delete
                </button>
              </div>
            </div>
          )
        })}

        {/* Add race form */}
        {showForm ? (
          <div style={{ ...cardStyle, marginTop: '6px' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: theme.textPrimary, marginBottom: '14px' }}>
              Add Race
            </div>

            <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Race Name *</div>
            <input
              style={inputStyle}
              placeholder="MCM Historic Half"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />

            <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date *</div>
            <input
              type="date"
              style={inputStyle}
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            />

            <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</div>
            <input
              style={inputStyle}
              placeholder="Washington, DC"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            />

            <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Distance</div>
            <input
              style={inputStyle}
              placeholder="Half Marathon, 10 Miles, 5K…"
              value={form.distance}
              onChange={e => setForm(f => ({ ...f, distance: e.target.value }))}
            />

            <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Goal (optional)</div>
            <input
              style={inputStyle}
              placeholder="Sub 3:30, finish strong…"
              value={form.goal}
              onChange={e => setForm(f => ({ ...f, goal: e.target.value }))}
            />

            {/* Primary toggle */}
            <div
              onClick={() => setForm(f => ({ ...f, primary: !f.primary }))}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                cursor: 'pointer', marginBottom: '16px',
              }}
            >
              <div style={{
                width: '36px', height: '20px', borderRadius: '10px',
                background: form.primary ? theme.accent : theme.cardBorder,
                position: 'relative', transition: 'background-color 0.2s ease',
              }}>
                <div style={{
                  position: 'absolute', top: '3px',
                  left: form.primary ? '18px' : '3px',
                  width: '14px', height: '14px',
                  borderRadius: '50%', background: '#fff',
                  transition: 'left 0.2s ease',
                }} />
              </div>
              <span style={{ fontSize: '13px', color: theme.textSecondary }}>Set as primary race</span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleSave} style={{
                flex: 1, padding: '12px',
                background: form.name && form.date ? theme.accent : theme.cardBorder,
                color: form.name && form.date ? '#000' : theme.textMuted,
                border: 'none', borderRadius: '8px',
                fontSize: '14px', fontWeight: 700, cursor: form.name && form.date ? 'pointer' : 'default',
                transition: 'background-color 0.3s ease',
              }}>
                Save Race
              </button>
              <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }} style={{
                padding: '12px 16px',
                background: 'transparent',
                border: `0.5px solid ${theme.cardBorder}`,
                borderRadius: '8px',
                color: theme.textMuted, fontSize: '14px', cursor: 'pointer',
              }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowForm(true)} style={{
            width: '100%', padding: '14px',
            background: theme.accentBg,
            border: `0.5px solid ${theme.accent}`,
            borderRadius: '10px',
            color: theme.accentText, fontSize: '15px', fontWeight: 600,
            cursor: 'pointer', marginTop: '6px',
            transition: 'background-color 1.5s ease, border-color 1.5s ease',
          }}>
            + Add Race
          </button>
        )}

      </div>
    </div>
  )
}
