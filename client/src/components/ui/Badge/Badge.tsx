import type { ReactNode } from 'react'
import './Badge.css'

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  children: ReactNode
  className?: string
}

export default function Badge({
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  className = '',
}: BadgeProps) {
  const classes = ['badge', `badge--${variant}`, `badge--${size}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes}>
      {dot && <span className="badge__dot" aria-hidden="true" />}
      {children}
    </span>
  )
}
