import { getWorkoutLogs } from '../utils/workoutLogger'

const FEELING_LABELS = ['', 'Rough', 'Hard', 'OK', 'Good', 'Great']

const formatDate = (dateStr) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })

const feelingStars = (n) =>
  Array.from({ length: 5 }, (_, i) => i < n ? '★' : '☆').join('')

export default function WorkoutHistory({ theme, onClose }) {
  const logs = getWorkoutLogs().slice(0, 7)

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex', alignItems: 'flex-end',
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: theme.cardBg,
          border: `0.5px solid ${theme.cardBorder}`,
          borderRadius: '16px 16px 0 0',
          padding: '20px 16px 40px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          transition: 'background-color 1.5s ease',
        }}
      >
        {/* Sheet header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, color: theme.textPrimary }}>
            Recent Workouts
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none',
            color: theme.textMuted, fontSize: '22px',
            cursor: 'pointer', lineHeight: 1, padding: '0 0 0 8px',
          }}>
            ×
          </button>
        </div>

        {logs.length === 0 ? (
          <div style={{
            color: theme.textMuted, fontSize: '14px',
            textAlign: 'center', padding: '32px 0',
          }}>
            No workouts logged yet. Complete your first one!
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} style={{
              background: theme.bg,
              border: `0.5px solid ${theme.cardBorder}`,
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '8px',
              transition: 'background-color 1.5s ease, border-color 1.5s ease',
            }}>
              {/* Date + badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', color: theme.textMuted }}>
                  {formatDate(log.date)}
                </div>
                <span style={{
                  fontSize: '10px', fontWeight: 600,
                  padding: '2px 7px', borderRadius: '20px',
                  background: log.completed ? '#0f3d2e' : '#3d2a0a',
                  color:      log.completed ? '#3ecf8e' : '#f0a030',
                }}>
                  {log.completed ? '✓ Done' : 'Stopped early'}
                </span>
              </div>

              {/* Type + duration */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: theme.textPrimary }}>
                  {log.type}
                </div>
                <div style={{ fontSize: '12px', color: theme.textMuted }}>
                  {log.actualDuration} min
                </div>
              </div>

              {/* Feeling stars */}
              {log.feeling && (
                <div style={{ marginTop: '4px' }}>
                  <span style={{ fontSize: '13px', color: theme.accent, letterSpacing: '1px' }}>
                    {feelingStars(log.feeling)}
                  </span>
                  <span style={{ fontSize: '11px', color: theme.textMuted, marginLeft: '6px' }}>
                    {FEELING_LABELS[log.feeling]}
                  </span>
                </div>
              )}

              {/* Modifications */}
              {log.modifications?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                  {log.modifications.map((m, i) => (
                    <span key={i} style={{
                      fontSize: '10px', padding: '1px 6px', borderRadius: '20px',
                      background: theme.bgSecondary,
                      border: `0.5px solid ${theme.cardBorder}`,
                      color: theme.textMuted,
                    }}>
                      {m.exerciseName} ({m.type})
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
