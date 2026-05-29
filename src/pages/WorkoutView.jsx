import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../hooks/useTheme'
import useDecision from '../hooks/useDecision'
import { generateWorkout } from '../utils/workoutGenerator'
import { saveWorkoutLog } from '../utils/workoutLogger'
import WorkoutHistory from '../components/WorkoutHistory'

const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.3)
  } catch (e) {}
}

const INIT_EX_STATE = { currentSet: 0, resting: false, timeLeft: 0, done: false, modification: null }

const formatElapsed = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

const sectionLabel = (theme) => ({
  fontSize: '11px', fontWeight: 600, color: theme.textMuted,
  letterSpacing: '0.08em', textTransform: 'uppercase',
  marginTop: '20px', marginBottom: '8px',
})

const cardStyle = (theme) => ({
  background: theme.cardBg,
  border: `0.5px solid ${theme.cardBorder}`,
  borderRadius: '10px', padding: '14px', marginBottom: '8px',
  transition: 'background-color 1.5s ease, border-color 1.5s ease',
})

function Pill({ children, style }) {
  return (
    <span style={{
      display: 'inline-block', fontSize: '11px',
      padding: '2px 8px', borderRadius: '20px', fontWeight: 500, ...style,
    }}>
      {children}
    </span>
  )
}

const FEELINGS = [
  { value: 1, label: 'Rough' },
  { value: 2, label: 'Hard'  },
  { value: 3, label: 'OK'    },
  { value: 4, label: 'Good'  },
  { value: 5, label: 'Great' },
]

function CompletionModal({ isBail, theme, workout, exerciseStates, startTime, feeling, setFeeling, onSave }) {
  const actualDuration      = Math.max(1, Math.round((Date.now() - startTime.current) / 60000))
  const exercisesCompleted  = workout.exercises.filter((_, i) => exerciseStates[i]?.done).length

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'flex-end', zIndex: 100,
    }}>
      <div style={{
        background: theme.cardBg,
        borderRadius: '16px 16px 0 0',
        padding: '24px 20px 40px',
        width: '100%', maxHeight: '90vh', overflowY: 'auto',
        border: `0.5px solid ${theme.cardBorder}`,
        transition: 'background-color 1.5s ease',
      }}>
        <div style={{ fontSize: '22px', fontWeight: 700, color: theme.textPrimary, marginBottom: '4px' }}>
          {isBail ? 'Good call listening to your body.' : 'Workout Complete! 💪'}
        </div>
        <div style={{ fontSize: '13px', color: theme.textMuted, marginBottom: '6px' }}>
          You worked out for {actualDuration} minute{actualDuration !== 1 ? 's' : ''}
        </div>
        <div style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '24px' }}>
          {exercisesCompleted} of {workout.exercises.length} exercises finished
        </div>

        {/* Feeling scale */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: theme.textSecondary, marginBottom: '10px' }}>
            How did it feel?
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {FEELINGS.map(f => (
              <div key={f.value} style={{ flex: 1, textAlign: 'center' }}>
                <button
                  onClick={() => setFeeling(f.value)}
                  style={{
                    width: '100%', aspectRatio: '1',
                    borderRadius: '10px',
                    border: `0.5px solid ${feeling === f.value ? theme.accent : theme.cardBorder}`,
                    background: feeling === f.value ? theme.accentBg : 'transparent',
                    color: feeling === f.value ? theme.accentText : theme.textMuted,
                    fontSize: '18px', fontWeight: 700, cursor: 'pointer',
                    transition: 'background-color 0.2s ease, border-color 0.2s ease',
                  }}
                >
                  {f.value}
                </button>
                <div style={{ fontSize: '10px', color: theme.textMuted, marginTop: '4px' }}>
                  {f.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onSave}
          disabled={!feeling}
          style={{
            width: '100%',
            background: feeling ? theme.accent : theme.cardBorder,
            color: feeling ? '#000' : theme.textMuted,
            border: 'none', borderRadius: '10px',
            padding: '16px', fontSize: '16px', fontWeight: 700,
            cursor: feeling ? 'pointer' : 'default',
            transition: 'background-color 0.3s ease',
          }}
        >
          Save & Finish
        </button>
      </div>
    </div>
  )
}

function ExerciseCard({ ex, index, theme, state, onUpdate }) {
  const s = state || INIT_EX_STATE

  useEffect(() => {
    if (!s.resting) return
    const id = setInterval(() => {
      onUpdate(index, current => {
        const timeLeft = current.timeLeft - 1
        if (timeLeft <= 0) {
          playBeep()
          return { ...current, resting: false, timeLeft: 0 }
        }
        return { ...current, timeLeft }
      })
    }, 1000)
    return () => clearInterval(id)
  }, [s.resting, index])

  const handleSetComplete = () => {
    const newSet = s.currentSet + 1
    if (newSet >= ex.sets) {
      onUpdate(index, { currentSet: newSet, resting: false, done: true })
    } else {
      onUpdate(index, { currentSet: newSet, resting: true, timeLeft: ex.rest })
    }
  }

  const skipRest  = () => onUpdate(index, { resting: false, timeLeft: 0 })
  const toggleMod = (type) => onUpdate(index, { modification: s.modification === type ? null : type })

  const modBtnStyle = (active) => ({
    fontSize: '12px', padding: '4px 10px', borderRadius: '6px',
    border: `0.5px solid ${theme.cardBorder}`,
    background: active ? theme.accentBg : 'transparent',
    color: active ? theme.accentText : theme.textMuted,
    cursor: 'pointer', transition: 'background-color 0.2s ease',
  })

  return (
    <div style={cardStyle(theme)}>
      {/* Name + sets×reps */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          fontSize: '16px', fontWeight: 700, flex: 1, marginRight: '8px',
          color: s.done ? theme.textMuted : theme.accent,
          transition: 'color 0.3s ease',
        }}>
          {ex.name}
        </div>
        <Pill style={{ background: theme.accentBg, color: theme.accentText, whiteSpace: 'nowrap' }}>
          {ex.sets}×{ex.reps}
        </Pill>
      </div>

      {/* Weight + rest pills */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
        <Pill style={{ background: theme.bgSecondary, color: theme.textSecondary, border: `0.5px solid ${theme.cardBorder}` }}>
          {ex.weight}
        </Pill>
        <Pill style={{ background: theme.bgSecondary, color: theme.textSecondary, border: `0.5px solid ${theme.cardBorder}` }}>
          {ex.rest}s rest
        </Pill>
      </div>

      {/* Form cue */}
      <div style={{ fontSize: '13px', color: theme.textMuted, fontStyle: 'italic', marginTop: '6px' }}>
        {ex.formCue}
      </div>

      {/* Safety note */}
      {ex.safetyNote && (
        <div style={{
          background: '#3d2a0a', color: '#f0a030',
          borderRadius: '6px', padding: '5px 10px',
          fontSize: '12px', marginTop: '6px',
        }}>
          {ex.safetyNote}
        </div>
      )}

      {/* Action area */}
      <div style={{ marginTop: '12px' }}>
        {s.done ? (
          <div style={{
            textAlign: 'center', padding: '10px',
            background: '#0f3d2e', borderRadius: '8px',
            color: '#3ecf8e', fontSize: '14px', fontWeight: 600,
          }}>
            ✓ Done
          </div>
        ) : s.resting ? (
          <div style={{
            background: theme.bgSecondary, borderRadius: '8px',
            padding: '16px', textAlign: 'center',
            transition: 'background-color 1.5s ease',
          }}>
            <div style={{ fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              REST
            </div>
            <div style={{ fontSize: '48px', fontWeight: 600, color: theme.accent, lineHeight: 1 }}>
              {s.timeLeft}
            </div>
            <div style={{ height: '3px', background: theme.cardBorder, borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
              <div style={{
                width: `${(s.timeLeft / ex.rest) * 100}%`,
                height: '100%', background: theme.accent, borderRadius: '2px',
                transition: 'width 1s linear, background-color 1.5s ease',
              }} />
            </div>
            <button onClick={skipRest} style={{
              marginTop: '10px', background: 'none',
              border: `0.5px solid ${theme.cardBorder}`,
              borderRadius: '6px', color: theme.textMuted,
              fontSize: '11px', padding: '4px 10px', cursor: 'pointer',
            }}>
              Skip Rest
            </button>
          </div>
        ) : (
          <button onClick={handleSetComplete} style={{
            width: '100%', padding: '10px',
            background: theme.accentBg,
            border: `0.5px solid ${theme.accent}`,
            borderRadius: '8px', color: theme.accentText,
            fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            transition: 'background-color 1.5s ease, border-color 1.5s ease',
          }}>
            Start Set {s.currentSet + 1}
          </button>
        )}
      </div>

      {/* Set progress dots */}
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '12px' }}>
        {Array.from({ length: ex.sets }, (_, i) => (
          <span key={i} style={{
            fontSize: '10px', lineHeight: 1,
            color: i < s.currentSet ? theme.accent : theme.textMuted,
          }}>
            {i < s.currentSet ? '●' : '○'}
          </span>
        ))}
      </div>

      {/* Easier / Harder */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        <button onClick={() => toggleMod('easier')} style={modBtnStyle(s.modification === 'easier')}>Easier ↓</button>
        <button onClick={() => toggleMod('harder')} style={modBtnStyle(s.modification === 'harder')}>Harder ↑</button>
      </div>
      {s.modification && (
        <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '6px' }}>
          {s.modification === 'easier' ? ex.easier : ex.harder}
        </div>
      )}
    </div>
  )
}

export default function WorkoutView() {
  const navigate = useNavigate()
  const theme    = useTheme()
  const decision = useDecision()
  const workout  = generateWorkout(decision, new Date().getDay())

  const startTime       = useRef(Date.now())
  const elapsedStartRef = useRef(null)

  const [exerciseStates, setExerciseStates] = useState({})
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [modal,       setModal]       = useState(null)   // null | 'complete' | 'bail'
  const [feeling,     setFeeling]     = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  const workoutStarted = Object.values(exerciseStates).some(s => s.currentSet > 0 || s.done)

  // Start elapsed timer on first set
  useEffect(() => {
    if (!workoutStarted || elapsedStartRef.current !== null) return
    elapsedStartRef.current = Date.now()
    const id = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - elapsedStartRef.current) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [workoutStarted])

  const updateExState = (index, updater) => {
    setExerciseStates(prev => {
      const current = prev[index] || INIT_EX_STATE
      const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater }
      return { ...prev, [index]: next }
    })
  }

  const totalSets     = workout.exercises.reduce((sum, ex) => sum + ex.sets, 0)
  const completedSets = workout.exercises.reduce((sum, _, i) => sum + (exerciseStates[i]?.currentSet || 0), 0)
  const allDone       = workout.exercises.length > 0 && workout.exercises.every((_, i) => exerciseStates[i]?.done === true)

  const handleSave = () => {
    if (!feeling) return
    const actualDuration     = Math.max(1, Math.round((Date.now() - startTime.current) / 60000))
    const exercisesCompleted = workout.exercises.filter((_, i) => exerciseStates[i]?.done).length
    const modifications      = workout.exercises
      .map((ex, i) => ({ exerciseName: ex.name, type: exerciseStates[i]?.modification }))
      .filter(m => m.type != null)

    saveWorkoutLog({
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: workout.type,
      plannedDuration: workout.duration,
      actualDuration,
      completed: modal === 'complete',
      feeling,
      exercisesCompleted,
      exercisesTotal: workout.exercises.length,
      modifications,
      intensity: workout.intensity,
      flags: workout.flags,
    })
    navigate('/', { state: { justCompleted: modal === 'complete' } })
  }

  return (
    <div style={{ background: theme.bg, minHeight: '100vh', transition: 'background-color 2s ease' }}>

      {/* Fixed top bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '52px',
        background: theme.bg, borderBottom: `0.5px solid ${theme.cardBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', zIndex: 10,
        transition: 'background-color 2s ease, border-color 1.5s ease',
      }}>
        <button onClick={() => navigate('/')} style={{
          background: 'none', border: 'none', color: theme.accent,
          fontSize: '22px', cursor: 'pointer', padding: '4px 8px 4px 0', lineHeight: 1,
        }}>
          ←
        </button>
        <span style={{ fontSize: '15px', fontWeight: 600, color: theme.textPrimary }}>
          Today's Workout
        </span>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '13px', color: workoutStarted ? theme.accent : theme.textMuted, fontVariantNumeric: 'tabular-nums' }}>
            {workoutStarted ? formatElapsed(elapsedSeconds) : `${workout.duration} min`}
          </div>
          <button onClick={() => setShowHistory(true)} style={{
            background: 'none', border: 'none', padding: 0,
            fontSize: '11px', color: theme.textMuted,
            cursor: 'pointer', textDecoration: 'underline',
          }}>
            History
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ padding: '68px 14px 40px', maxWidth: '600px', margin: '0 auto' }}>

        {/* 1. Header card */}
        <div style={cardStyle(theme)}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: theme.accent }}>{workout.type}</div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
            <Pill style={{ background: theme.bgSecondary, color: theme.textSecondary, border: `0.5px solid ${theme.cardBorder}` }}>
              {workout.duration} min
            </Pill>
            <Pill style={{ background: theme.accentBg, color: theme.accentText }}>
              Intensity {workout.intensity}/10
            </Pill>
          </div>
          {workout.coachNote && (
            <div style={{
              background: theme.accentBg, color: theme.accentText,
              borderRadius: '6px', padding: '8px 12px',
              fontSize: '12px', fontStyle: 'italic', marginTop: '10px',
            }}>
              {workout.coachNote}
            </div>
          )}
        </div>

        {/* 2. Warm-up */}
        <div style={sectionLabel(theme)}>WARM-UP</div>
        <div style={cardStyle(theme)}>
          {workout.warmup.map((item, i) => (
            <div key={i} style={{ marginBottom: i < workout.warmup.length - 1 ? '10px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: theme.textPrimary }}>{item.name}</span>
                <span style={{ fontSize: '12px', color: theme.textMuted }}>{item.duration} min</span>
              </div>
              <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '2px' }}>{item.instruction}</div>
            </div>
          ))}
          <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '10px', textAlign: 'right' }}>Total: 5 min</div>
        </div>

        {/* 3. Exercises */}
        {workout.exercises.length > 0 && (
          <>
            <div style={sectionLabel(theme)}>EXERCISES</div>
            {workout.exercises.map((ex, i) => (
              <ExerciseCard
                key={i} ex={ex} index={i} theme={theme}
                state={exerciseStates[i]} onUpdate={updateExState}
              />
            ))}
          </>
        )}

        {/* 4. Cardio */}
        {workout.cardio && (
          <>
            <div style={sectionLabel(theme)}>CARDIO</div>
            <div style={cardStyle(theme)}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <Pill style={{ background: theme.accentBg, color: theme.accentText }}>
                  {workout.cardio.duration} min
                </Pill>
                <Pill style={{ background: theme.bgSecondary, color: theme.textSecondary, border: `0.5px solid ${theme.cardBorder}` }}>
                  {workout.cardio.speed}
                </Pill>
              </div>
              <div style={{ fontSize: '13px', color: theme.textMuted }}>{workout.cardio.instruction}</div>
            </div>
          </>
        )}

        {/* 5. Cool-down */}
        <div style={sectionLabel(theme)}>COOL-DOWN</div>
        <div style={cardStyle(theme)}>
          {workout.cooldown.map((item, i) => (
            <div key={i} style={{ marginBottom: i < workout.cooldown.length - 1 ? '10px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: theme.textPrimary }}>{item.name}</span>
                <Pill style={{ background: theme.bgSecondary, color: theme.textMuted, border: `0.5px solid ${theme.cardBorder}` }}>
                  {item.duration}s
                </Pill>
              </div>
              <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '2px' }}>{item.instruction}</div>
            </div>
          ))}
        </div>

        {/* 6. Bottom action area */}
        <div style={{ marginTop: '20px', marginBottom: '40px' }}>
          {allDone || workout.exercises.length === 0 ? (
            <button onClick={() => setModal('complete')} style={{
              width: '100%',
              background: theme.accent, color: '#000',
              border: 'none', borderRadius: '10px',
              padding: '16px', fontSize: '16px', fontWeight: 700,
              cursor: 'pointer', marginBottom: '10px',
              transition: 'background-color 1.5s ease',
            }}>
              Complete Workout
            </button>
          ) : (
            <div style={{
              textAlign: 'center', color: theme.textMuted,
              fontSize: '13px', marginBottom: '10px',
            }}>
              {completedSets} of {totalSets} sets complete
            </div>
          )}
          <button onClick={() => setModal('bail')} style={{
            width: '100%',
            background: 'transparent',
            border: `0.5px solid ${theme.cardBorder}`,
            borderRadius: '10px',
            padding: '12px', fontSize: '13px',
            color: theme.textMuted, cursor: 'pointer',
            transition: 'border-color 1.5s ease',
          }}>
            Stop Early
          </button>
        </div>

      </div>

      {/* Completion modal */}
      {modal && (
        <CompletionModal
          isBail={modal === 'bail'}
          theme={theme}
          workout={workout}
          exerciseStates={exerciseStates}
          startTime={startTime}
          feeling={feeling}
          setFeeling={setFeeling}
          onSave={handleSave}
        />
      )}

      {/* History panel */}
      {showHistory && (
        <WorkoutHistory theme={theme} onClose={() => setShowHistory(false)} />
      )}

    </div>
  )
}
