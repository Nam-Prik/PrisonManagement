import './Spinner.css'

type SpinnerSize = 'sm' | 'md' | 'lg'

interface SpinnerProps {
  size?: SpinnerSize
  className?: string
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <span
      className={['spinner', `spinner--${size}`, className].filter(Boolean).join(' ')}
      role="status"
      aria-label="Loading"
    />
  )
}

interface PageLoaderProps {
  message?: string
}

export function PageLoader({ message = 'Loading…' }: PageLoaderProps) {
  return (
    <div className="page-loader">
      <Spinner size="lg" />
      <p className="page-loader__text">{message}</p>
    </div>
  )
}
