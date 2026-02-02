import React, { useState } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
  error?: string
}

export function Input({ 
  className = '', 
  error,
  ...props 
}: InputProps) {
  const [touched, setTouched] = useState(false)

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true)
    props.onBlur?.(e)
  }

  return (
    <div className="space-y-2">
      <input
        className={`w-full px-4 py-3 rounded-lg bg-dark-panel border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20 transition-all ${className}`}
        onBlur={handleBlur}
        {...props}
      />
      {error && touched && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}