import DashboardHeader from '../components/DashboardHeader'
import MetricCards from '../components/MetricCards'
import BottomRow from '../components/BottomRow'

function Home() {
  return (
    <main style={{ background: '#0e0e10', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', background: '#0e0e10', minHeight: '100vh' }}>
        <DashboardHeader
          userName="Joma"
          timeOfDay="evening"
          subtitle="Rest day. You've earned it."
          tomorrowWorkout="Tomorrow: lower body + core"
          ardenState="rest"
          currentTime="8:43 PM"
          currentDate="THU, MAY 28"
        />
        <MetricCards />
        <BottomRow />
      </div>
    </main>
  )
}

export default Home
