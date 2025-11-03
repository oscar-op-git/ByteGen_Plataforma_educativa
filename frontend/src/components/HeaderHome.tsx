// src/components/HeaderHome.tsx
import React from 'react'
import CustomButton from './CustomBotton'
import "../styles/HeaderHome.css"
import { Link } from 'react-router-dom'

type HeaderHomeProps = {
  isLoggedIn: boolean
  userName?: string
  onGoHome: () => void
  onGoCursos: () => void
  onGoActividades: () => void
  onGoLogin: () => void
  onOpenUserMenu: () => void
  userMenuOpen: boolean
  onCloseUserMenu: () => void
  onUserMenuAction: (action: 'perfil' | 'config' | 'ayuda' | 'salir') => void
}

const HeaderHome: React.FC<HeaderHomeProps> = ({
  isLoggedIn,
  userName,
  onGoHome,
  onGoCursos,
  onGoActividades,
  onGoLogin,
  onOpenUserMenu,
  userMenuOpen,
  onCloseUserMenu,
  onUserMenuAction
}) => {
  React.useEffect(() => {
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.user-menu')) onCloseUserMenu()
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [onCloseUserMenu])

  return (
    <header className="header-home">
      <Link to="/home" className="header-home__brand header-home__brand--clickable">
        EduMasterCrack
      </Link>
      <nav className="header-home__nav">
        <CustomButton label="Home" onClick={onGoHome} fullWidth={false} />
        <CustomButton label="Cursos" onClick={onGoCursos} fullWidth={false} />
        <CustomButton label="Actividades" onClick={onGoActividades} fullWidth={false} />

        {!isLoggedIn ? (
          <CustomButton label="Login" onClick={onGoLogin} fullWidth={false} />
        ) : (
          <div className="user-menu">
            <button className="user-menu__trigger" onClick={onOpenUserMenu}>
              {userName ?? 'Usuario'}
            </button>
            {userMenuOpen && (
              <div className="user-menu__dropdown">
                <button className="user-menu__item" onClick={() => onUserMenuAction('perfil')}>
                  Configurar perfil
                </button>
                <button className="user-menu__item" onClick={() => onUserMenuAction('config')}>
                  Configuración
                </button>
                <button className="user-menu__item" onClick={() => onUserMenuAction('ayuda')}>
                  Ayuda
                </button>
                <button className="user-menu__item user-menu__item--danger" onClick={() => onUserMenuAction('salir')}>
                  Salir
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}

export default HeaderHome
