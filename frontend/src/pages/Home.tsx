import React from 'react'
import { useNavigate } from 'react-router-dom'
import HomeBox from '../components/HomeBox'
import CustomButton from '../components/CustomBotton'
import RoleBadge from '../components/RoleBadge'
import CoursesGrid from '../components/CoursesGrid'
import JoinClassModal from '../components/JoinClassModal'
import HeaderHome from '../components/HeaderHome'

type User = {
  id: string
  name: string
  email: string
  id_role_role: 1 | 2 | 3
  isAdmin: boolean
}


type Course = { id: string; title: string; teacher: string; hidden?: boolean }

const Home: React.FC = () => {
  const navigate = useNavigate()

  const [user, setUser] = React.useState<User>({
    id: 'u1',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    id_role_role: 2,
    isAdmin: false,
  })

  const [roleView, setRoleView] = React.useState<1 | 2 | 3>(user.id_role_role)
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)
  const [courses, setCourses] = React.useState<Course[]>([
    { id: 'c1', title: 'Matemática I', teacher: 'Prof. Ramírez' },
    { id: 'c2', title: 'Lenguaje y Comunicación', teacher: 'Prof. Salinas' },
    { id: 'c3', title: 'Física', teacher: 'Prof. Vargas' },
    { id: 'c4', title: 'Química', teacher: 'Prof. Quispe', hidden: true },
    { id: 'c5', title: 'Historia', teacher: 'Prof. Cruz' },
    { id: 'c6', title: 'Programación I', teacher: 'Prof. Lara' },
  ])
  const [showHidden, setShowHidden] = React.useState(false)
  const [joinOpen, setJoinOpen] = React.useState(false)

  // ── BACKEND: aquí conectas con tu Auth.js + Prisma (Supabase)
  // React.useEffect(() => {
  //   (async () => {
  //     // 1) /auth/session (para asegurar login)
  //     const s = await fetch(`${import.meta.env.VITE_API_URL}/auth/session`, { credentials:'include' })
  //     if (!s.ok) return navigate('/login')
  //     // 2) /user/me → { id_role_role: 1|2|3, isAdmin: boolean, name, email }
  //     const meRes = await fetch(`${import.meta.env.VITE_API_URL}/user/me`, { credentials:'include' })
  //     const me = await meRes.json()
  //     setUser({
  //       id: me.id, name: me.name ?? 'Usuario', email: me.email,
  //       id_role_role: me.id_role_role, isAdmin: me.isAdmin
  //     })
  //     setRoleView(me.id_role_role)
  //   })()
  // }, [navigate])


  const handleLogout = async () => {
    // Aquí puedes limpiar tokens, cookies o llamar al backend
    /* try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, { method: 'POST', credentials: 'include' })
    } catch { } */
    navigate('/login')
  }

  const onUserMenuAction = (a: 'perfil' | 'config' | 'ayuda' | 'salir') => {
    if (a === 'salir') return handleLogout()
    if (a === 'perfil') return navigate('/perfil')
    if (a === 'config') alert('Configuración (pendiente)')
    if (a === 'ayuda') alert('Ayuda (pendiente)')
  }
  const onEnterCourse = (id: string) => alert(`Entrar al curso ${id} (pendiente)`)
  const onToggleHidden = (id: string) => setCourses(prev => prev.map(c => c.id === id ? { ...c, hidden: !c.hidden } : c))
  const onJoin = (code: string) => { setJoinOpen(false); alert(`Unirse con código: ${code} (pendiente)`) }

  const renderRoleActions = () => {
    if (roleView === 2) {
      return (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <CustomButton label="Unirse a clase" onClick={() => setJoinOpen(true)} fullWidth={false} />
          </div>
          <CoursesGrid
            courses={courses}
            showHidden={showHidden}
            onToggleShowHidden={() => setShowHidden(v => !v)}
            onEnter={onEnterCourse}
            onToggleHidden={onToggleHidden}
          />
        </>
      )
    }
    if (roleView === 3) {
      return (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
          <CustomButton label="Editar curso" onClick={() => alert('Editar curso (pendiente)')} fullWidth={false} />
          <CustomButton label="Unirse a clase" onClick={() => setJoinOpen(true)} fullWidth={false} />
        </div>
      )
    }
    // Admin
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
        <CustomButton label="Editar curso" onClick={() => alert('Editar curso (pendiente)')} fullWidth={false} />
        <CustomButton label="Editar curso base" onClick={() => alert('Editar curso base (pendiente)')} fullWidth={false} />
        <CustomButton label="Unirse a clase" onClick={() => setJoinOpen(true)} fullWidth={false} />
      </div>
    )
  }

  return (
    <>
      <HeaderHome
        isLoggedIn={true}
        userName={user.name}
        onGoHome={() => navigate('/')}
        onGoCursos={() => alert('Cursos (pendiente)')}
        onGoActividades={() => alert('Actividades (pendiente)')}
        onGoLogin={() => navigate('/login')}
        onOpenUserMenu={() => setUserMenuOpen(v => !v)}
        onCloseUserMenu={() => setUserMenuOpen(false)}
        userMenuOpen={userMenuOpen}
        onUserMenuAction={onUserMenuAction}
      />

      <div className="login-page">
        <HomeBox>
          <h1 className="project-name">Bienvenido, {user.name}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="title" style={{ margin: 0 }}>Rol:</span>
            <RoleBadge role={roleView} onChangeRoleView={(r) => setRoleView(r)} />
            <span className="title" style={{ margin: 0, color: user.isAdmin ? '#16a34a' : '#6b7280' }}>
              isAdmin: {user.isAdmin ? 'true' : 'false'}
            </span>
          </div>

          <div style={{ marginTop: 16 }}>
            {renderRoleActions()}
          </div>
        </HomeBox>
      </div>

      <JoinClassModal open={joinOpen} onClose={() => setJoinOpen(false)} onJoin={onJoin} />
      <footer style={{ textAlign: 'center', marginTop: 24, color: '#6b7280' }}>
        @bytegeneration
      </footer>
    </>
  )
}

export default Home
