import React from 'react'

interface CustomButtonProps {
  label: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  fullWidth?: boolean
  variant?: 'default' | 'danger'
}

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  onClick,
  type = 'button',
  disabled = false,
  fullWidth = true,
  variant = 'default',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`custom-btn ${fullWidth ? 'custom-btn--full' : ''} ${variant === 'danger' ? 'custom-btn--danger' : ''}`}
    >
      {label}
    </button>
  )
}

export default CustomButton
