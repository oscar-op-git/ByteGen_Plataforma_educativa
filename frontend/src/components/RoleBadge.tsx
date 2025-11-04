import React from 'react'
import '../styles/Home.css' // reutilizamos clases del Home (role-badge__menu / item)
import { useOnClickOutside } from '../hooks/useOnClickOutSide'

type Props = {
  role: 1 | 2 | 3
  onChangeRoleView: (role: 1 | 2 | 3) => void
  allowAdminSwitch?: boolean // si es false, no se muestra ni permite admin
  isAdminNow?: boolean
}

const toText = (r: 1 | 2 | 3) => r === 1 ? 'Admin' : r === 2 ? 'Estudiante' : 'Docente'

const RoleBadge: React.FC<Props> = ({ role, onChangeRoleView, allowAdminSwitch = false, isAdminNow = false }) => {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, () => setOpen(false))



  const toggle = () => {
    if (isAdminNow) return // Admin no cambia rol
    setOpen(v => !v)
  }

  const choose = (r: 1 | 2 | 3) => {
    if (!allowAdminSwitch && r === 1) return
    onChangeRoleView(r)
    setOpen(false)
  }

  return (
    <div ref={ref} className="home-role" onClick={toggle} title={isAdminNow ? 'Admin no puede cambiar rol' : 'Cambiar rol'}>
      Rol: {toText(role)} <span className="home-role__hint">(click)</span>
      {open && (
        <div className="role-badge__menu">
          <button className="role-badge__item" onClick={() => choose(2)}>Estudiante</button>
          <button className="role-badge__item" onClick={() => choose(3)}>Docente</button>
          {allowAdminSwitch && <button className="role-badge__item" onClick={() => choose(1)}>Admin</button>}
        </div>
      )}
    </div>
  )
}

export default RoleBadge
