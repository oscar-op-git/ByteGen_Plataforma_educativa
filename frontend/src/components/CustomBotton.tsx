import React from 'react'

interface CustomButtonProps {
  label: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  fullWidth?: boolean
}

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  onClick,
  type = 'button',
  disabled = false,
  fullWidth = true,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`custom-btn ${fullWidth ? 'custom-btn--full' : ''}`}
    >
      {label}
    </button>
  )
}

export default CustomButton
