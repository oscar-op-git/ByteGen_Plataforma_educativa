import React from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import HeaderHome from '../components/HeaderHome'
import FooterHome from '../components/FooterHome'
import HomeBox from '../components/HomeBox'
import CustomButton from '../components/CustomBotton'
import '../styles/ProfileSettingsPage.css'


const ProfileSettingsPage: React.FC = () => {
  const navigate = useNavigate()

  // ESTÁTICO. BACKEND: reemplazar con /user/me
  const [userName, setUserName] = React.useState('Juan Pérez')
  const [userEmail, setUserEmail] = React.useState('juan@example.com')
  const [currentPass, setCurrentPass] = React.useState('')
  const [newPass, setNewPass] = React.useState('')
  const [avatar] = React.useState<string | null>(null)
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)

  const handleUserMenuAction = async (a: 'perfil'|'config'|'ayuda'|'salir') => {
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
    if (a === 'perfil') return
    if (a === 'config') return toast('Configuración (pendiente)')
    if (a === 'ayuda') return toast('Ayuda (pendiente)')
  }

  const onUploadAvatar = () => {
    // BACKEND: Supabase Storage / S3 presigned URL + guardar URL en DB (Prisma)
    toast('Subir foto (pendiente backend)')
  }

  const onSave = async () => {
    // BACKEND: PATCH /user/profile, PATCH /user/password
    toast.success('Guardado (fake)')
  }

  const onExit = () => navigate(-1)

  return (
    <>
      <HeaderHome
        isLoggedIn={true}
        userName={userName}
        onGoHome={() => navigate('/home')}
        onGoCursos={() => toast('Cursos (pendiente)')}
        onGoActividades={() => toast('Actividades (pendiente)')}
        onGoLogin={() => navigate('/login')}
        onOpenUserMenu={() => setUserMenuOpen(v=>!v)}
        onCloseUserMenu={() => setUserMenuOpen(false)}
        userMenuOpen={userMenuOpen}
        onUserMenuAction={handleUserMenuAction}
      />

      <div className="login-page " style={{ maxWidth: 410, margin: '0 auto', padding: 20 }}>
        <HomeBox>
          <div className="profile">
            <h2 className="project-name profile__header">Configurar perfil</h2>

            <div className="profile__avatar">
              <div className="profile__avatar-circle">
                {avatar ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%' }}/> : 'Foto'}
              </div>
            </div>
            <div className="profile__upload">
              <CustomButton label="Subir foto" onClick={onUploadAvatar} />
            </div>

            <div className="profile__form">
              <div className="profile__row">
                <label>Nombre</label>
                <input value={userName} onChange={(e)=>setUserName(e.target.value)} />
              </div>
              <div className="profile__row">
                <label>Correo</label>
                <input type="email" value={userEmail} onChange={(e)=>setUserEmail(e.target.value)} />
              </div>
              <div className="profile__row">
                <label>Contraseña actual</label>
                <input type="password" value={currentPass} onChange={(e)=>setCurrentPass(e.target.value)} />
              </div>
              <div className="profile__row">
                <label>Nueva contraseña</label>
                <input type="password" value={newPass} onChange={(e)=>setNewPass(e.target.value)} />
              </div>

              <div className="profile__actions">
                <CustomButton label="Guardar" onClick={onSave} fullWidth={false} />
                <CustomButton label="Salir" onClick={onExit} fullWidth={false} />
              </div>
            </div>
          </div>
        </HomeBox>
      </div>

      <FooterHome />
    </>
  )
}

export default ProfileSettingsPage
