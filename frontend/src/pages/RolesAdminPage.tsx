// src/pages/RolesAdminPage.tsx
// COMENTARIO: Página de administración de roles (solo admin). Mock sin backend.

import React from 'react'
import { useNavigate } from 'react-router-dom'
import HeaderHome from '../components/HeaderHome'
import FooterHome from '../components/FooterHome'
import CustomButton from '../components/CustomBotton'
import '../styles/RolesAdminPage.css'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

type RoleKey = 'ADMIN' | 'DOCENTE_EJECUTOR' | 'DOCENTE_MODIFICADOR' | 'ESTUDIANTE'

type UserRow = {
    id: string
    firstName: string
    lastName: string
    email: string
    roles: RoleKey[] // COMENTARIO: para mostrar múltiples roles
}

// MOCK de usuarios
const MOCK_USERS: UserRow[] = [
    { id: 'u1', firstName: 'Juan', lastName: 'Pérez', email: 'juan@example.com', roles: ['ESTUDIANTE'] },
    { id: 'u2', firstName: 'Ana', lastName: 'García', email: 'ana@example.com', roles: ['DOCENTE_EJECUTOR'] },
    { id: 'u3', firstName: 'Carlos', lastName: 'Ramírez', email: 'carlos@example.com', roles: ['DOCENTE_MODIFICADOR'] },
    { id: 'u4', firstName: 'Luz', lastName: 'Mendoza', email: 'luz@example.com', roles: ['ADMIN'] },
]

const LABEL: Record<RoleKey, string> = {
    ADMIN: 'Admin',
    DOCENTE_EJECUTOR: 'Docente ejecutor',
    DOCENTE_MODIFICADOR: 'Docente modificador',
    ESTUDIANTE: 'Estudiante',
}

const RolesAdminPage: React.FC = () => {
    const navigate = useNavigate()

    // COMENTARIO: Estado local. En la vida real, cargarias desde backend.
    const [query, setQuery] = React.useState('')
    const [users, setUsers] = React.useState<UserRow[]>(MOCK_USERS)
    const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null)

    // COMENTARIO: selección de rol para asignar (debajo)
    const [roleToAssign, setRoleToAssign] = React.useState<RoleKey | null>(null)

    // COMENTARIO: selección de roles para eliminar (click en pills del panel derecho/abajo)
    const [rolesToRemove, setRolesToRemove] = React.useState<RoleKey[]>([])

    const currentUser = users.find(u => u.id === selectedUserId) || null
    const filtered = users.filter(u => {
        const q = query.trim().toLowerCase()
        if (!q) return true
        return (
            u.firstName.toLowerCase().includes(q) ||
            u.lastName.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
        )
    })

    // COMENTARIO: HeaderHome — asume que eres admin en esta página
    const [userMenuOpen, setUserMenuOpen] = React.useState(false)
    const onUserMenuAction = async (a: 'perfil' | 'config' | 'ayuda' | 'salir') => {
        if (a === 'salir') {
            // BACKEND: POST /auth/logout
            toast.success('Sesión cerrada (mock)')
            navigate('/login')
            return
        }
        if (a === 'perfil') return navigate('/perfil')
        if (a === 'config') return toast('Configuración (pendiente)')
        if (a === 'ayuda') return toast('Ayuda (pendiente)')
    }

    // COMENTARIO: click en fila de usuario
    const onSelectRow = (id: string) => {
        setSelectedUserId(id)
        setRolesToRemove([])
    }

    // COMENTARIO: asignar rol seleccionado a usuario seleccionado
    const assignRole = async () => {
        if (!currentUser || !roleToAssign) {
            toast.error('Selecciona un usuario y un rol')
            return
        }
        // Si quieres permitir Admin aquí, quita este bloque. El backend igual debe validar.
        if (roleToAssign === 'ADMIN') {
            toast.error('El rol Admin se gestiona aparte')
            return
        }
        if (currentUser.roles.includes(roleToAssign)) {
            toast('El usuario ya tiene ese rol')
            return
        }

        // ⬇️ Confirm bonito con SweetAlert2
        const res = await Swal.fire({
            title: '¿Asignar rol?',
            text: `Asignar "${LABEL[roleToAssign]}" a ${currentUser.firstName} ${currentUser.lastName}.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Asignar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#6b7280',
        })

        if (!res.isConfirmed) return

        // BACKEND: POST /admin/roles/assign { userId, roleKey }
        setUsers(prev => prev.map(u =>
            u.id === currentUser.id ? { ...u, roles: [...u.roles, roleToAssign] } : u
        ))
        toast.success('Rol asignado')
    }

    // COMENTARIO: marcar/desmarcar roles para eliminar
    const toggleRoleToRemove = (rk: RoleKey) => {
        setRolesToRemove(prev => prev.includes(rk) ? prev.filter(x => x !== rk) : [...prev, rk])
    }

    // COMENTARIO: eliminar roles marcados del usuario seleccionado
    const removeRoles = async () => {
  if (!currentUser || rolesToRemove.length === 0) {
    toast.error('Selecciona un usuario y al menos un rol a eliminar')
    return
  }

  // Texto bonito con lista de roles a remover
  const htmlList = `
    <ul style="text-align:left; margin:8px 0 0; padding-left:18px;">
      ${rolesToRemove.map(rk => `<li>${LABEL[rk]}</li>`).join('')}
    </ul>
  `

  const res = await Swal.fire({
    title: '¿Eliminar roles?',
    html: `
      <div style="text-align:left;">
        <div>Usuario: <b>${currentUser.firstName} ${currentUser.lastName}</b></div>
        <div>Se eliminarán ${rolesToRemove.length} rol(es):</div>
        ${htmlList}
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    confirmButtonColor: '#ef4444', // rojo para dejar claro que es destructivo
    cancelButtonColor: '#6b7280',
  })

  if (!res.isConfirmed) return

  // BACKEND: POST /admin/roles/remove { userId: currentUser.id, roles: rolesToRemove }
  setUsers(prev =>
    prev.map(u =>
      u.id === currentUser.id
        ? { ...u, roles: u.roles.filter(r => !rolesToRemove.includes(r)) }
        : u
    )
  )
  setRolesToRemove([])
  toast.success('Roles eliminados')
}

    return (
        <>
            <HeaderHome
                isLoggedIn={true}
                userName={'Admin'}                 // BACKEND: nombre del admin logueado
                onGoHome={() => navigate('/home')}
                onGoCursos={() => toast('Cursos (pendiente)')}
                onGoActividades={() => toast('Actividades (pendiente)')}
                onGoLogin={() => navigate('/login')}
                onOpenUserMenu={() => setUserMenuOpen(v => !v)}
                onCloseUserMenu={() => setUserMenuOpen(false)}
                userMenuOpen={userMenuOpen}
                onUserMenuAction={onUserMenuAction}
                isAdmin={true}                    // BOTÓN "Asignar roles" no aplica aquí
            />

            <div className="roles-page">
                <div className="roles-box">
                    {/* ENCABEZADO */}
                    <div className="roles-header">
                        <h1 className="roles-title">Asignación de roles</h1>

                        {/* BOTONES AFUERA (EN EL HEADER) */}

                    </div>
                    <div className="roles-layout">
                        {/* IZQUIERDA: Buscador + Tabla */}
                        <div className="roles-left">
                            <div className="roles-search">
                                <input
                                    placeholder="Buscar por nombre, apellido o correo"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </div>

                            <div className="roles-table-wrap">
                                <table className="roles-table">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Apellido</th>
                                            <th>Correo</th>
                                            <th>Roles</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(u => {
                                            const isSelected = u.id === selectedUserId
                                            return (
                                                <tr
                                                    key={u.id}
                                                    className={isSelected ? 'selected' : ''}
                                                    onClick={() => onSelectRow(u.id)}
                                                >
                                                    <td>{u.firstName}</td>
                                                    <td>{u.lastName}</td>
                                                    <td>{u.email}</td>
                                                    <td>
                                                        <div className="roles-pills">
                                                            {u.roles.map(r => (
                                                                <span key={r} className="pill">{LABEL[r]}</span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* DERECHA: Paneles */}
                        <div className="roles-right">
                            {/* ── Asignar rol ───────────────────────────────────────── */}
                            {/* Botón arriba-izquierda, luego la card */}
                            <div className="roles-card-toolbar">
                                <CustomButton label="Asignar rol" onClick={assignRole} fullWidth={false} />
                            </div>

                            <div className="panel">
                                <h3 className="panel__title">Asignar rol</h3>
                                <div className="panel__body">
                                    <div className="role-options">
                                        {(['ADMIN', 'DOCENTE_EJECUTOR', 'DOCENTE_MODIFICADOR', 'ESTUDIANTE'] as const).map(rk => (
                                            <button
                                                key={rk}
                                                className={`role-option ${roleToAssign === rk ? 'active' : ''}`}
                                                onClick={() => setRoleToAssign(rk)}
                                            >
                                                {LABEL[rk]}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="hint">Selecciona un usuario y un rol, luego pulsa “Asignar rol”.</p>
                                </div>
                            </div>

                            {/* ── Eliminar roles ─────────────────────────────────────── */}
                            {/* Botón arriba-izquierda, luego la card */}
                            <div className="roles-card-toolbar">
                                <CustomButton label="Eliminar roles" onClick={removeRoles} fullWidth={false} />
                            </div>

                            <div className="panel">
                                <h3 className="panel__title">Eliminar roles</h3>
                                <div className="panel__body">
                                    {!currentUser ? (
                                        <p className="hint">Selecciona un usuario para ver sus roles.</p>
                                    ) : currentUser.roles.length === 0 ? (
                                        <p className="hint">Este usuario no tiene roles.</p>
                                    ) : (
                                        <div className="role-owned">
                                            {currentUser.roles.map(rk => (
                                                <button
                                                    key={rk}
                                                    className={`role-owned-pill ${rolesToRemove.includes(rk) ? 'marked' : ''}`}
                                                    onClick={() => toggleRoleToRemove(rk)}
                                                >
                                                    {LABEL[rk]}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <p className="hint">Marca roles para eliminarlos y pulsa “Eliminar roles”.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <FooterHome />
        </>
    )
}

export default RolesAdminPage
