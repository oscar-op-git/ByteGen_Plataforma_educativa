import React from 'react'




interface LogoutButtonProps {
  onLogout: () => void
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
  return (
    <button onClick={onLogout} className="btn-logout">
      Logout
    </button>
  )
}

export default LogoutButton
