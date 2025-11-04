import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPages from './pages/LoginPages';
import { RegisterPage } from './pages/RegisterPage'
import Home from './pages/Home'
import Recover from './pages/Recover'
import VerifyEmail from './pages/VerifyEmail';
import ProfileSettingsPage from './pages/ProfileSettingsPage'
import RolesAdminPage from './pages/RolesAdminPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPages />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path='/home' element={<Home />} />
        <Route path='/recover' element={<Recover />} />
        <Route path="/perfil" element={<ProfileSettingsPage />} />
        <Route path="/admin/roles" element={<RolesAdminPage />} />
      </Routes>
    </Router>
  )
}

export default App
