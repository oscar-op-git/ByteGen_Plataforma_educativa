import React, { useState, useEffect } from 'react'
import { X, Home, BookOpen, Users, Mail } from 'lucide-react'
import '../styles/Header.css'

interface HeaderProps {
  onLoginClick?: () => void
  onRegisterClick?: () => void
}

export const Header: React.FC<HeaderProps> = ({ onLoginClick, onRegisterClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  const navLinks = [
    { label: 'Inicio', href: '#', icon: <Home size={18} /> },
    { label: 'Características', href: '#features', icon: <BookOpen size={18} /> },
    { label: 'Nosotros', href: '#about', icon: <Users size={18} /> },
    { label: 'Contacto', href: '#contact', icon: <Mail size={18} /> },
  ]

  return (
    <>
      <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
        <div className="header__container">
          <a href="#" className="header__logo">
            <div className="header__logo-icon">A</div>
            <span className="header__logo-text">AppName</span>
          </a>

          <nav className="header__nav header__nav--desktop">
            <div className="header__actions">
              <button onClick={onLoginClick} className="header__button header__button--secondary">
                Iniciar Sesión
              </button>
              <button onClick={onRegisterClick} className="header__button header__button--primary">
                Registrarse
              </button>
            </div>
          </nav>

          <button
            className={`header__hamburger ${isMenuOpen ? 'header__hamburger--active' : ''}`}
            onClick={toggleMenu}
            aria-label="Menú"
          >
            <span className="header__hamburger-line"></span>
            <span className="header__hamburger-line"></span>
            <span className="header__hamburger-line"></span>
          </button>
        </div>
      </header>

      <div
        className={`header__overlay ${isMenuOpen ? 'header__overlay--visible' : ''}`}
        onClick={closeMenu}
      />

      <aside className={`header__mobile-menu ${isMenuOpen ? 'header__mobile-menu--open' : ''}`}>
        <div className="header__mobile-header">
          <span className="header__mobile-title">Menú</span>
          <button className="header__close-button" onClick={closeMenu} aria-label="Cerrar menú">
            <X size={24} />
          </button>
        </div>

        <nav className="header__mobile-nav">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="header__nav-link" onClick={closeMenu}>
              {link.icon}
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header__mobile-actions">
          <button
            onClick={() => {
              closeMenu()
              onLoginClick?.()
            }}
            className="header__button header__button--secondary"
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => {
              closeMenu()
              onRegisterClick?.()
            }}
            className="header__button header__button--primary"
          >
            Registrarse
          </button>
        </div>
      </aside>
    </>
  )
}
