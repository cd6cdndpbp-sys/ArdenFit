import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import WorkoutView from './pages/WorkoutView'

function App() {
  return (
    <div className="app-wrapper">
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/workout" element={<WorkoutView />} />
    </Routes>
    </div>
  )
}

export default App
