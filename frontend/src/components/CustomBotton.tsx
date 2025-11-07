import React from 'react'

interface CustomButtonProps {
  label: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  fullWidth?: boolean
  variant?: 'default' | 'danger'
  className?: string 
}

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  onClick,
  type = 'button',
  disabled = false,
  fullWidth = true,
  variant = 'default',
  className = '',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`custom-btn ${fullWidth ? 'custom-btn--full' : ''} ${variant === 'danger' ? 'custom-btn--danger' : ''}${className}`}
    >
      {label}
    </button>
  )
}

export default CustomButton
