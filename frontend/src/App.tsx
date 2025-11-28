import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPages from './pages/LoginPages';
import { RegisterPage } from './pages/RegisterPage';
import Home from './pages/Home';
import Recover from './pages/Recover';
import VerifyEmail from './pages/VerifyEmail';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import RolesAdminPage from './pages/RolesAdminPage';
import TopicLesson from './pages/Topico';
import TopicoGoldenLayout from './pages/TopicoGoldenLayout';
import TopicoEditorLayout from './pages/TopicoEditorLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPages />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/recover" element={<Recover />} />

        {/* Rutas protegidas */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <ProfileSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <ProtectedRoute requireAdmin>
              <RolesAdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/topic/basic"
          element={
            <ProtectedRoute>
              <TopicLesson />
            </ProtectedRoute>
          }
        />
        <Route
          path="/topic/layout"
          element={
            <ProtectedRoute>
              <TopicoGoldenLayout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/topic/layout/editor"
          element={
            <ProtectedRoute>
              <TopicoEditorLayout />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/topic/layout/:plantillaId" element={<TopicoGoldenLayout />} />
        <Route path="/topic/editor/:plantillaId" element={<TopicoEditorLayout />} />

      </Routes>
    </Router>
  );
}

export default App;