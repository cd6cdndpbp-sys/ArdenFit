import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import WorkoutView from './pages/WorkoutView'
import RaceManager from './pages/RaceManager'

function App() {
  return (
    <div className="app-wrapper">
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/workout" element={<WorkoutView />} />
      <Route path="/races" element={<RaceManager />} />
    </Routes>
    </div>
  )
}

export default App
