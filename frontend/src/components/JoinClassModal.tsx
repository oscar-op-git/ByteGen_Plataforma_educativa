import React from 'react'
import CustomButton from './CustomBotton'
import '../styles/JoinClass.css'

type Props = {
  open: boolean
  onClose: () => void
  onJoin: (code: string) => void
}

const JoinClassModal: React.FC<Props> = ({ open, onClose, onJoin }) => {
  const [code, setCode] = React.useState('')

  if (!open) return null

  return (
    <div className="join-modal__backdrop" onClick={onClose}>
      <div className="join-modal" onClick={e => e.stopPropagation()}>
        <h3>Unirse a clase</h3>
        <p>Ingresa el código de la clase:</p>
        <input
          placeholder="ABC-1234"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <div className="join-modal__actions">
          <CustomButton label="Cancelar" onClick={onClose} fullWidth={false} />
          <CustomButton label="Unirse" onClick={() => onJoin(code)} fullWidth={false} />
        </div>
      </div>
    </div>
  )
}

export default JoinClassModal
