import type { ReactNode } from 'react'
import './Form.css'
import Label from './Label'

interface FormGroupProps {
  label?: string
  htmlFor?: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
  className?: string
}

export default function FormGroup({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className = '',
}: FormGroupProps) {
  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {error && <p className="form-error">{error}</p>}
      {hint && !error && <p className="form-hint">{hint}</p>}
    </div>
  )
}
