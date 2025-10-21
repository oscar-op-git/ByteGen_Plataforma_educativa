import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPages from './pages/LoginPages'
import { RegisterPage } from './pages/RegisterPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPages />} />
        <Route path="/Registro" element={<RegisterPage />} />
      </Routes>
    </Router>
  )
}

export default App
