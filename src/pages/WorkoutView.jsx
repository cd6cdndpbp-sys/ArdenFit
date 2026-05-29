import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../hooks/useTheme'
import useDecision from '../hooks/useDecision'
import { generateWorkout } from '../utils/workoutGenerator'

const sectionLabel = (theme) => ({
  fontSize: '11px',
  fontWeight: 600,
  color: theme.textMuted,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginTop: '20px',
  marginBottom: '8px',
})

const cardStyle = (theme) => ({
  background: theme.cardBg,
  border: `0.5px solid ${theme.cardBorder}`,
  borderRadius: '10px',
  padding: '14px',
  marginBottom: '8px',
  transition: 'background-color 1.5s ease, border-color 1.5s ease',
})

function Pill({ children, style }) {
  return (
    <span style={{
      display: 'inline-block',
      fontSize: '11px',
      padding: '2px 8px',
      borderRadius: '20px',
      fontWeight: 500,
      ...style,
    }}>
      {children}
    </span>
  )
}

function ExerciseCard({ ex, theme }) {
  const [mod, setMod] = useState(null)

  const toggleMod = (type) => setMod(prev => prev === type ? null : type)

  const modBtnStyle = (active, theme) => ({
    fontSize: '12px',
    padding: '4px 10px',
    borderRadius: '6px',
    border: `0.5px solid ${theme.cardBorder}`,
    background: active ? theme.accentBg : 'transparent',
    color: active ? theme.accentText : theme.textMuted,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  })

  return (
    <div style={cardStyle(theme)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: theme.accent, flex: 1, marginRight: '8px' }}>
          {ex.name}
        </div>
        <Pill style={{ background: theme.accentBg, color: theme.accentText, whiteSpace: 'nowrap' }}>
          {ex.sets}×{ex.reps}
        </Pill>
      </div>

      <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
        <Pill style={{ background: theme.bgSecondary, color: theme.textSecondary, border: `0.5px solid ${theme.cardBorder}` }}>
          {ex.weight}
        </Pill>
        <Pill style={{ background: theme.bgSecondary, color: theme.textSecondary, border: `0.5px solid ${theme.cardBorder}` }}>
          {ex.rest}s rest
        </Pill>
      </div>

      <div style={{ fontSize: '13px', color: theme.textMuted, fontStyle: 'italic', marginTop: '6px' }}>
        {ex.formCue}
      </div>

      {ex.safetyNote && (
        <div style={{
          background: '#3d2a0a',
          color: '#f0a030',
          borderRadius: '6px',
          padding: '5px 10px',
          fontSize: '12px',
          marginTop: '6px',
        }}>
          {ex.safetyNote}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        <button onClick={() => toggleMod('easier')} style={modBtnStyle(mod === 'easier', theme)}>
          Easier ↓
        </button>
        <button onClick={() => toggleMod('harder')} style={modBtnStyle(mod === 'harder', theme)}>
          Harder ↑
        </button>
      </div>

      {mod && (
        <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '6px' }}>
          {mod === 'easier' ? ex.easier : ex.harder}
        </div>
      )}
    </div>
  )
}

export default function WorkoutView() {
  const navigate  = useNavigate()
  const theme     = useTheme()
  const decision  = useDecision()
  const workout   = generateWorkout(decision, new Date().getDay())

  return (
    <div style={{ background: theme.bg, minHeight: '100vh', transition: 'background-color 2s ease' }}>

      {/* Fixed top bar */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: '52px',
        background: theme.bg,
        borderBottom: `0.5px solid ${theme.cardBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 10,
        transition: 'background-color 2s ease, border-color 1.5s ease',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            color: theme.accent,
            fontSize: '22px',
            cursor: 'pointer',
            padding: '4px 8px 4px 0',
            lineHeight: 1,
          }}
        >
          ←
        </button>
        <span style={{ fontSize: '15px', fontWeight: 600, color: theme.textPrimary }}>
          Today's Workout
        </span>
        <span style={{ fontSize: '13px', color: theme.textMuted }}>
          {workout.duration} min
        </span>
      </div>

      {/* Scrollable content */}
      <div style={{ padding: '68px 14px 40px', maxWidth: '600px', margin: '0 auto' }}>

        {/* 1. Workout header card */}
        <div style={cardStyle(theme)}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: theme.accent }}>
            {workout.type}
          </div>
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
              background: theme.accentBg,
              color: theme.accentText,
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '12px',
              fontStyle: 'italic',
              marginTop: '10px',
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
          <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '10px', textAlign: 'right' }}>
            Total: 5 min
          </div>
        </div>

        {/* 3. Exercises */}
        {workout.exercises.length > 0 && (
          <>
            <div style={sectionLabel(theme)}>EXERCISES</div>
            {workout.exercises.map((ex, i) => (
              <ExerciseCard key={i} ex={ex} theme={theme} />
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
              <div style={{ fontSize: '13px', color: theme.textMuted }}>
                {workout.cardio.instruction}
              </div>
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

        {/* 6. Complete button */}
        <button
          onClick={() => navigate('/')}
          style={{
            width: '100%',
            background: theme.accent,
            color: '#000',
            border: 'none',
            borderRadius: '10px',
            padding: '16px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            marginTop: '20px',
            marginBottom: '40px',
            transition: 'background-color 1.5s ease',
          }}
        >
          Complete Workout
        </button>

      </div>
    </div>
  )
}
