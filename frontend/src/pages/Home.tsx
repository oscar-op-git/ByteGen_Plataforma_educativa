import React from 'react'
import { useNavigate } from 'react-router-dom'
import HomeBox from '../components/HomeBox'
import CustomButton from '../components/CustomBotton'
import RoleBadge from '../components/RoleBadge'
import CoursesGrid from '../components/CoursesGrid'
import JoinClassModal from '../components/JoinClassModal'
import HeaderHome from '../components/HeaderHome'
import FooterHome from '../components/FooterHome'
import '../styles/Home.css'
import toast from 'react-hot-toast'

type User = {
  id: string
  name: string
  email: string
  id_role_role: 1|2|3   // 1=Admin, 2=Estudiante, 3=Docente
}

type Course = { id: string; title: string; teacher: string; hidden?: boolean }

const Home: React.FC = () => {
  const navigate = useNavigate()

  // ESTÁTICO. BACKEND: reemplazar por /auth/session + /user/me
  const [user] = React.useState<User>({
    id: 'u1',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    id_role_role: 2,
  })
  const [roleView, setRoleView] = React.useState<1|2|3>(user.id_role_role)
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)
  const [courses, setCourses] = React.useState<Course[]>([
    { id: 'c1', title: 'Introduccion a python', teacher: 'Prof. Ramírez' },
    { id: 'c2', title: 'Primeros pasos de python', teacher: 'Prof. Salinas' },
    { id: 'c3', title: 'Introduccion a python', teacher: 'Prof. Vargas' },
    { id: 'c4', title: 'Nivel basico de python', teacher: 'Prof. Quispe', hidden: true },
    { id: 'c5', title: 'Introduccion a python', teacher: 'Prof. Cruz' },
    { id: 'c6', title: 'Curso basico de python', teacher: 'Prof. Lara' },
  ])
  const [showHidden, setShowHidden] = React.useState(false)
  const [joinOpen, setJoinOpen] = React.useState(false)

  const onUserMenuAction = async (a: 'perfil'|'config'|'ayuda'|'salir') => {
    if (a === 'salir') {
      const p = fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      await toast.promise(p, {
        loading: 'Cerrando sesión…',
        success: 'Sesión cerrada',
        error: 'No se pudo cerrar sesión',
      })
      navigate('/login')
      return
    }
    if (a === 'perfil') return navigate('/perfil')
    if (a === 'config') return toast('Configuración (pendiente)')
    if (a === 'ayuda') return toast('Ayuda (pendiente)')
  }

  const onEnterCourse = (id: string) => toast(`Entrar al curso ${id} (pendiente)`)
  const onToggleHidden = (id: string) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, hidden: !c.hidden } : c))
    // BACKEND: POST /courses/:id/hide | /unhide
  }
  const onJoin = async (code: string) => {
    setJoinOpen(false)
    // BACKEND: POST /courses/join {code}
    toast.success(`(fake) Te uniste con código ${code}`)
  }

  const renderRoleArea = () => (
    <div className="home-role-wrap">
      <RoleBadge
        role={roleView}
        onChangeRoleView={setRoleView}
        allowAdminSwitch={false}
        isAdminNow={roleView === 1}
      />
    </div>
  )

  const renderActionsByRole = () => {
    if (roleView === 2) {
      // Estudiante
      return (
        <>
          <div className="home-actions" style={{ justifyContent: 'flex-end' }}>
            <CustomButton label="Unirse a clase" onClick={() => setJoinOpen(true)} fullWidth={false}/>
          </div>
          <CoursesGrid
            courses={courses}
            showHidden={showHidden}
            onToggleShowHidden={() => setShowHidden(v=>!v)}
            onEnter={onEnterCourse}
            onToggleHidden={onToggleHidden}
          />
        </>
      )
    }
    if (roleView === 3) {
      // Docente
      return (
        <div className="home-actions">
          <CustomButton label="Editar curso" onClick={() => toast('Editar curso (pendiente)')} fullWidth={false}/>
          <CustomButton label="Unirse a clase" onClick={() => setJoinOpen(true)} fullWidth={false}/>
        </div>
      )
    }
    // Admin (no puede cambiar rol desde badge)
    return (
      <div className="home-actions">
        <CustomButton label="Editar curso" onClick={() => toast('Editar curso (pendiente)')} fullWidth={false}/>
        <CustomButton label="Editar curso base" onClick={() => toast('Editar curso base (pendiente)')} fullWidth={false}/>
        <CustomButton label="Unirse a clase" onClick={() => setJoinOpen(true)} fullWidth={false}/>
      </div>
    )
  }

  return (
    <>
      <HeaderHome
        isLoggedIn={true}
        userName={user.name}
        onGoHome={() => navigate('/home')}
        onGoCursos={() => toast('Cursos (pendiente)')}
        onGoActividades={() => toast('Actividades (pendiente)')}
        onGoLogin={() => navigate('/login')}
        onOpenUserMenu={() => setUserMenuOpen(v=>!v)}
        onCloseUserMenu={() => setUserMenuOpen(false)}
        userMenuOpen={userMenuOpen}
        onUserMenuAction={onUserMenuAction}
      />

      <div className="home-page">
        <HomeBox className='home-box'>
          <h1 className="project-name">Bienvenido, {user.name}</h1>
          {renderRoleArea()}
          <div style={{ marginTop: 16 }}>
            {renderActionsByRole()}
          </div>
        </HomeBox>
      </div>

      <JoinClassModal open={joinOpen} onClose={() => setJoinOpen(false)} onJoin={onJoin}/>
      <FooterHome />
    </>
  )
}

export default Home