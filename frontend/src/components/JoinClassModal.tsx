// src/components/JoinClassModal.tsx
import React from 'react'
import CustomButton from './CustomBotton'

type Props = {
  open: boolean
  onClose: () => void
  onJoin: (code: string) => void
}

const JoinClassModal: React.FC<Props> = ({ open, onClose, onJoin }) => {
  const [code, setCode] = React.useState('')

  if (!open) return null

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3 style={{ fontWeight: 800, marginBottom: 8 }}>Unirse a clase</h3>
        <p>Ingresa el código de la clase:</p>
        <input
          className="input-field__input"
          placeholder="ABC-1234"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ width: '100%', marginTop: 8 }}
        />
        <div className="modal__actions">
          <CustomButton label="Cancelar" onClick={onClose} fullWidth={false} />
          <CustomButton label="Unirse" onClick={() => onJoin(code)} fullWidth={false} />
        </div>
      </div>
    </div>
  )
}

export default JoinClassModal
