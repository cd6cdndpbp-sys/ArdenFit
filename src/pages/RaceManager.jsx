import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../hooks/useTheme'
import {
  getRaces, addRace, updateRace, deleteRace, setPrimaryRace,
  getDaysUntil, getProgressPercent, RACE_DISTANCES,
} from '../utils/raceManager'

const EMPTY_FORM = { name: '', date: '', location: '', distance: '', goalHH: '', goalMM: '', goalSS: '', primary: false }

const formatDate = (dateStr) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })

const fmtGoal = (secs) => {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const secsToFormFields = (secs) => ({
  goalHH: String(Math.floor(secs / 3600)),
  goalMM: String(Math.floor((secs % 3600) / 60)),
  goalSS: String(secs % 60),
})

export default function RaceManager() {
  const navigate  = useNavigate()
  const theme     = useTheme()
  const [races, setRaces]       = useState(getRaces)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm]         = useState(EMPTY_FORM)

  const refresh = () => setRaces(getRaces())

  const handleEdit = (race) => {
    setForm({
      name:     race.name,
      date:     race.date,
      location: race.location || '',
      distance: race.distance || '',
      primary:  race.primary,
      ...(race.goalSeconds > 0 ? secsToFormFields(race.goalSeconds) : { goalHH: '', goalMM: '', goalSS: '' }),
    })
    setEditingId(race.id)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const handleDelete = (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return
    deleteRace(id)
    refresh()
  }

  const handleSetPrimary = (id) => {
    setPrimaryRace(id)
    refresh()
  }

  const goalSeconds = parseInt(form.goalHH || 0) * 3600 + parseInt(form.goalMM || 0) * 60 + parseInt(form.goalSS || 0)
  const canSave = !!(form.name && form.date && form.distance && goalSeconds > 0)

  const handleSave = () => {
    if (!canSave) return
    const data = { name: form.name, date: form.date, location: form.location, distance: form.distance, goalSeconds, primary: form.primary }
    if (editingId != null) {
      updateRace(editingId, data)
    } else {
      addRace(data)
    }
    handleCloseForm()
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
              {race.goalSeconds > 0 && (
                <div style={{ fontSize: '13px', color: theme.accentText, fontStyle: 'italic', marginTop: '4px' }}>
                  Goal: {fmtGoal(race.goalSeconds)}
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
                <button onClick={() => handleEdit(race)} style={{
                  padding: '7px 14px',
                  background: 'transparent',
                  border: `0.5px solid ${theme.cardBorder}`,
                  borderRadius: '8px',
                  color: theme.textSecondary,
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                }}>
                  Edit
                </button>
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

        {/* Add / Edit race form */}
        {showForm ? (
          <div style={{ ...cardStyle, marginTop: '6px' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: theme.textPrimary, marginBottom: '14px' }}>
              {editingId != null ? 'Edit Race' : 'Add Race'}
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

            <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Distance *</div>
            <select
              style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
              value={form.distance}
              onChange={e => setForm(f => ({ ...f, distance: e.target.value }))}
            >
              <option value="" disabled>Select distance…</option>
              {RACE_DISTANCES.map(d => (
                <option key={d.label} value={d.label}>{d.label}</option>
              ))}
            </select>

            <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Goal Time * (H : MM : SS)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
              <input
                type="number" min="0" max="23"
                placeholder="H"
                style={{ ...inputStyle, width: '64px', marginBottom: 0, textAlign: 'center' }}
                value={form.goalHH}
                onChange={e => setForm(f => ({ ...f, goalHH: e.target.value }))}
              />
              <span style={{ color: theme.textMuted, fontSize: '18px', fontWeight: 300, lineHeight: 1 }}>:</span>
              <input
                type="number" min="0" max="59"
                placeholder="MM"
                style={{ ...inputStyle, width: '64px', marginBottom: 0, textAlign: 'center' }}
                value={form.goalMM}
                onChange={e => setForm(f => ({ ...f, goalMM: e.target.value }))}
              />
              <span style={{ color: theme.textMuted, fontSize: '18px', fontWeight: 300, lineHeight: 1 }}>:</span>
              <input
                type="number" min="0" max="59"
                placeholder="SS"
                style={{ ...inputStyle, width: '64px', marginBottom: 0, textAlign: 'center' }}
                value={form.goalSS}
                onChange={e => setForm(f => ({ ...f, goalSS: e.target.value }))}
              />
            </div>

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
                background: canSave ? theme.accent : theme.cardBorder,
                color: canSave ? '#000' : theme.textMuted,
                border: 'none', borderRadius: '8px',
                fontSize: '14px', fontWeight: 700, cursor: canSave ? 'pointer' : 'default',
                transition: 'background-color 0.3s ease',
              }}>
                Save Race
              </button>
              <button onClick={handleCloseForm} style={{
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
