import type { SelectHTMLAttributes } from 'react'
import './Form.css'

type InputSize = 'sm' | 'md' | 'lg'

interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  inputSize?: InputSize
  error?: boolean
  options: SelectOption[]
  placeholder?: string
}

export default function Select({
  inputSize = 'md',
  error = false,
  options,
  placeholder,
  className = '',
  ...props
}: SelectProps) {
  const controlClasses = [
    'form-control',
    `form-control--${inputSize}`,
    error ? 'form-control--error' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="select-wrapper">
      <select className={controlClasses} {...props}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
