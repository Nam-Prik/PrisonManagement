import {
  CheckCircledIcon,
  Cross2Icon,
  CrossCircledIcon,
  InfoCircledIcon,
} from '@radix-ui/react-icons'
import { createPortal } from 'react-dom'
import type { ToastItem } from '../../../context/ToastContext'
import './Toast.css'

interface Props {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

const ICONS = {
  success: <CheckCircledIcon width={16} height={16} />,
  error: <CrossCircledIcon width={16} height={16} />,
  info: <InfoCircledIcon width={16} height={16} />,
}

export default function Toast({ toasts, onDismiss }: Props) {
  if (toasts.length === 0) return null

  return createPortal(
    <section className="toast-stack" aria-label="Notifications">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.variant}`} role="alert">
          <span className="toast__icon">{ICONS[t.variant]}</span>
          <span className="toast__message">{t.message}</span>
          <button
            type="button"
            className="toast__close"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss"
          >
            <Cross2Icon width={14} height={14} />
          </button>
        </div>
      ))}
    </section>,
    document.body
  )
}
