import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import DashboardHeader from '../components/DashboardHeader'
import MetricCards from '../components/MetricCards'
import BottomRow from '../components/BottomRow'
import useHealthData from '../hooks/useHealthData'
import useTheme from '../hooks/useTheme'
import { runDecisionEngine } from '../utils/decisionEngine'
import { getTodaysPlan, getWeekPlan } from '../utils/trainingPlan'

function Home() {
  const location = useLocation()
  const { healthData, loading } = useHealthData()
  const theme = useTheme()
  const decision = runDecisionEngine(healthData)
  const [celebrating, setCelebrating] = useState(false)

  useEffect(() => {
    if (location.state?.justCompleted) {
      setCelebrating(true)
      const t = setTimeout(() => setCelebrating(false), 5000)
      return () => clearTimeout(t)
    }
  }, [location.state?.justCompleted])

  const todaysPlan  = getTodaysPlan()

  const weekPlan    = getWeekPlan()
  const DAYS        = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const todayIdx    = (new Date().getDay() + 6) % 7   // maps Sun→6, Mon→0, …, Sat→5
  const orderedDays = [...DAYS.slice(todayIdx), ...DAYS.slice(0, todayIdx)]
  const afterToday  = orderedDays.slice(1)
  const nextWorkout = afterToday
    .map(d => weekPlan.find(w => w.day === d))
    .find(d => d?.type !== 'rest')
  const isTomorrow  = nextWorkout?.day === afterToday[0]
  const tomorrowWorkoutLabel = nextWorkout
    ? (isTomorrow ? `Tomorrow: ${nextWorkout.label}` : `Next: ${nextWorkout.label} (${nextWorkout.day})`)
    : 'Check back tomorrow'

  const ardenState  = celebrating ? 'pr' : (decision?.ardenState ?? 'rest')
  const subtitle    = celebrating
    ? "That's what consistency looks like. Well done."
    : (decision?.subtitle ?? 'Loading...')

  return (
    <main style={{ background: theme.bg, minHeight: '100vh', transition: 'background-color 2s ease' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', background: theme.bg, minHeight: '100vh', transition: 'background-color 2s ease' }}>
        <DashboardHeader
          userName="Joma"
          subtitle={subtitle}
          tomorrowWorkout={tomorrowWorkoutLabel}
          ardenState={ardenState}
          theme={theme}
          healthData={healthData}
        />
        <MetricCards healthData={loading ? null : healthData} theme={theme} />
        <BottomRow
          theme={theme}
          decision={decision}
          streak={healthData?.streak}
          weekSummary={healthData?.weekSummary}
          todaysPlan={todaysPlan}
        />
      </div>
    </main>
  )
}

export default Home
