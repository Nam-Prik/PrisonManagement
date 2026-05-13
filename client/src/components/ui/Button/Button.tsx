import './Button.css'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  iconOnly?: boolean
  as?: 'button' | 'a'
  href?: string
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  iconOnly = false,
  children,
  className = '',
  disabled,
  as: Tag = 'button',
  href,
  ...props
}: ButtonProps) {
  const classes = [
    'btn',
    `btn--${variant}`,
    iconOnly ? `btn--icon-${size}` : `btn--${size}`,
    fullWidth ? 'btn--full' : '',
    loading ? 'btn--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (Tag === 'a') {
    return (
      <a
        className={classes}
        href={href}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {loading && <span className="btn__spinner" aria-hidden="true" />}
        {children}
      </a>
    )
  }

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      {children}
    </button>
  )
}
