import { Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './views/Dashboard'
import LogisticsDashboard from './views/LogisticsDashboard'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/logistics" element={<LogisticsDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
