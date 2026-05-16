import type { ReactNode } from 'react'
import './Card.css'

type CardPadding = 'default' | 'compact' | 'flush'
type CardVariant = 'default' | 'elevated' | 'borderless'

interface CardProps {
  title?: ReactNode
  subtitle?: string
  actions?: ReactNode
  footer?: ReactNode
  padding?: CardPadding
  variant?: CardVariant
  children: ReactNode
  className?: string
}

export default function Card({
  title,
  subtitle,
  actions,
  footer,
  padding = 'default',
  variant = 'default',
  children,
  className = '',
}: CardProps) {
  const cardClasses = ['card', variant !== 'default' ? `card--${variant}` : '', className]
    .filter(Boolean)
    .join(' ')

  const bodyClasses = [
    'card__body',
    padding === 'compact' ? 'card__body--compact' : '',
    padding === 'flush' ? 'card__body--flush' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const hasHeader = title || actions

  return (
    <div className={cardClasses}>
      {hasHeader && (
        <div className="card__header">
          <div className="card__header-left">
            {title && <h3 className="card__title">{title}</h3>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card__header-actions">{actions}</div>}
        </div>
      )}

      <div className={bodyClasses}>{children}</div>

      {footer && <div className="card__footer">{footer}</div>}
    </div>
  )
}
