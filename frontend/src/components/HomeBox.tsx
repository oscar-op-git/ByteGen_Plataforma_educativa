import React from 'react'

interface HomeBoxProps {
  children: React.ReactNode
  className?: string
}

const HomeBox: React.FC<HomeBoxProps> = ({ children,className  }) => {
  return <div className={className ?? 'home-box'}>{children}</div>
}

export default HomeBox
