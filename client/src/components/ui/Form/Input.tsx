import './Form.css'

type InputSize = 'sm' | 'md' | 'lg'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  inputSize?: InputSize
  error?: boolean
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

export default function Input({
  inputSize = 'md',
  error = false,
  prefix,
  suffix,
  className = '',
  ...props
}: InputProps) {
  const controlClasses = [
    'form-control',
    `form-control--${inputSize}`,
    error ? 'form-control--error' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (!prefix && !suffix) {
    return <input className={controlClasses} {...props} />
  }

  const wrapperClasses = [
    'input-wrapper',
    prefix ? 'input-wrapper--prefix' : '',
    suffix ? 'input-wrapper--suffix' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={wrapperClasses}>
      {prefix && <span className="input-prefix">{prefix}</span>}
      <input className={controlClasses} {...props} />
      {suffix && <span className="input-suffix">{suffix}</span>}
    </div>
  )
}
