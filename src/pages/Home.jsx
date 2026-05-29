import DashboardHeader from '../components/DashboardHeader'
import MetricCards from '../components/MetricCards'
import BottomRow from '../components/BottomRow'
import useHealthData from '../hooks/useHealthData'
import useTheme from '../hooks/useTheme'
import { runDecisionEngine } from '../utils/decisionEngine'

function Home() {
  const { healthData, loading } = useHealthData()
  const theme = useTheme()
  const decision = runDecisionEngine(healthData)
  console.log('decision:', decision)

  return (
    <main style={{ background: theme.bg, minHeight: '100vh', transition: 'background-color 2s ease' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', background: theme.bg, minHeight: '100vh', transition: 'background-color 2s ease' }}>
        <DashboardHeader
          userName="Joma"
          subtitle={decision?.subtitle ?? 'Loading...'}
          tomorrowWorkout={decision?.tomorrowWorkout ?? 'Check back tomorrow'}
          ardenState={decision?.ardenState ?? 'rest'}
          theme={theme}
        />
        <MetricCards healthData={loading ? null : healthData} theme={theme} />
        <BottomRow
          theme={theme}
          decision={decision}
          streak={healthData?.streak}
          activeEnergyToday={healthData?.activeEnergyToday}
          respiratoryRate={healthData?.respiratoryRate}
        />
      </div>
    </main>
  )
}

export default Home
