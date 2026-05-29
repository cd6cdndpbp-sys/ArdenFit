import DashboardHeader from '../components/DashboardHeader'
import MetricCards from '../components/MetricCards'
import BottomRow from '../components/BottomRow'
import useHealthData from '../hooks/useHealthData'
import useTheme from '../hooks/useTheme'

function Home() {
  const { healthData, loading } = useHealthData()
  const theme = useTheme()

  return (
    <main style={{ background: theme.bg, minHeight: '100vh', transition: 'background-color 2s ease' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', background: theme.bg, minHeight: '100vh', transition: 'background-color 2s ease' }}>
        <DashboardHeader
          userName="Joma"
          subtitle="Rest day. You've earned it."
          tomorrowWorkout="Tomorrow: lower body + core"
          ardenState="rest"
          theme={theme}
        />
        <MetricCards healthData={loading ? null : healthData} theme={theme} />
        <BottomRow theme={theme} />
      </div>
    </main>
  )
}

export default Home
