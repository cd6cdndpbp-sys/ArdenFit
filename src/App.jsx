import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import WorkoutView from './pages/WorkoutView'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/workout" element={<WorkoutView />} />
    </Routes>
  )
}

export default App
