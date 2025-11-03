import React from 'react'
import { useNavigate } from 'react-router-dom'

import HeaderHome from '../components/HeaderHome'
import FooterHome from '../components/FooterHome'
import HomeBox from '../components/HomeBox'
import CustomButton from '../components/CustomBotton'

const ProfileSettingsPage: React.FC = () => {
  const navigate = useNavigate()

  // ── ESTÁTICO (luego conectarás al backend)
  const [userName, setUserName] = React.useState('Juan Pérez')
  const [userEmail, setUserEmail] = React.useState('juan@example.com')
  const [currentPass, setCurrentPass] = React.useState('')
  const [newPass, setNewPass] = React.useState('')
  const [avatar, setAvatar] = React.useState<string | null>(null)
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)

  // BACKEND: al montar, puedes traer /user/me para rellenar datos
  // React.useEffect(() => {
  //   (async () => {
  //     const me = await fetch(`${import.meta.env.VITE_API_URL}/user/me`, { credentials:'include' }).then(r=>r.json())
  //     setUserName(me.name ?? '')
  //     setUserEmail(me.email ?? '')
  //   })()
  // }, [])

  const onUploadAvatar = () => {
    // BACKEND: subir a Supabase Storage/S3 y guardar URL en DB con Prisma
    alert('Subir foto (pendiente backend)')
  }

  const onSave = async () => {
    // BACKEND:
    // await fetch('/user/profile', { method:'PATCH', body:{ name: userName, email: userEmail } })
    // if (newPass) await fetch('/user/password', { method:'PATCH', body:{ currentPass, newPass } })
    alert('Guardado (pendiente backend)')
  }

  const onExit = () => {
    navigate(-1)
  }

  const handleUserMenuAction = (a: 'perfil' | 'config' | 'ayuda' | 'salir') => {
    if (a === 'salir') {
      // BACKEND: POST /auth/logout
      fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, { method: 'POST', credentials: 'include' })
        .finally(() => navigate('/login'))
      return
    }
    if (a === 'perfil') return // ya estás aquí
    if (a === 'config') alert('Configuración (pendiente)')
    if (a === 'ayuda') alert('Ayuda (pendiente)')
  }

  return (
    <>
      <HeaderHome
        isLoggedIn={true}               // BACKEND: cámbialo según sesión
        userName={userName}             // BACKEND: nombre del usuario actual
        onGoHome={() => navigate('/')}
        onGoCursos={() => alert('Cursos (pendiente)')}
        onGoActividades={() => alert('Actividades (pendiente)')}
        onGoLogin={() => navigate('/login')}
        onOpenUserMenu={() => setUserMenuOpen(v => !v)}
        onCloseUserMenu={() => setUserMenuOpen(false)}
        userMenuOpen={userMenuOpen}
        onUserMenuAction={handleUserMenuAction}
      />

      <div className="login-page">
        <HomeBox>
          <h2 className="project-name">Configurar perfil</h2>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 112, height: 112, borderRadius: '50%',
                  border: '2px solid #e5e7eb', background: '#f3f4f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto', overflow: 'hidden'
                }}
              >
                {avatar ? (
                  <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%' }} />
                ) : (
                  'Foto'
                )}
              </div>
              <div style={{ marginTop: 8 }}>
                <CustomButton label="Subir foto" onClick={onUploadAvatar} />
              </div>
            </div>
          </div>

          <div className="login-form">
            <div className="form-group">
              <label>Nombre</label>
              <input value={userName} onChange={(e) => setUserName(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Correo</label>
              <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Contraseña actual</label>
              <input type="password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Nueva contraseña</label>
              <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
              <CustomButton label="Guardar" onClick={onSave} fullWidth={false} />
              <CustomButton label="Salir" onClick={onExit} fullWidth={false} />
            </div>
          </div>
        </HomeBox>
      </div>

      <FooterHome />
    </>
  )
}

export default ProfileSettingsPage
