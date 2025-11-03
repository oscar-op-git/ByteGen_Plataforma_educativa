import React from 'react'

type RoleBadgeProps = {
  role: 1|2|3
  onChangeRoleView: (role: 1|2|3) => void
}

const roleText = (r: 1|2|3) => r===1 ? 'Admin' : r===2 ? 'Estudiante' : 'Docente'

const RoleBadge: React.FC<RoleBadgeProps> = ({ role, onChangeRoleView }) => {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const close = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest('.role-badge')) setOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  return (
    <div className="role-badge" onClick={() => setOpen(v=>!v)}>
      Rol: {roleText(role)}
      {open && (
        <div className="role-badge__menu">
          <button className="role-badge__item" onClick={() => onChangeRoleView(2)}>Estudiante</button>
          <button className="role-badge__item" onClick={() => onChangeRoleView(3)}>Docente (editor/ejecutor)</button>
          <button className="role-badge__item" onClick={() => onChangeRoleView(1)}>Admin</button>
        </div>
      )}
    </div>
  )
}

export default RoleBadge
