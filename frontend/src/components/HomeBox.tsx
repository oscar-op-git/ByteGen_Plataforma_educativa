import React from 'react'

interface HomeBoxProps {
  children: React.ReactNode
}

const HomeBox: React.FC<HomeBoxProps> = ({ children }) => {
  return <div className="login-box">{children}</div>
}

export default HomeBox
