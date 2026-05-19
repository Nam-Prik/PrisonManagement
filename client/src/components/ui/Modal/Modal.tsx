import { Cross2Icon } from '@radix-ui/react-icons'
import type { ReactNode } from 'react'
import { useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import './Modal.css'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: ModalSize
  footer?: ReactNode
  closeOnBackdrop?: boolean
  children: ReactNode
}

export default function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  footer,
  closeOnBackdrop = true,
  children,
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return createPortal(
    <div
      className="modal-backdrop"
      onClick={
        closeOnBackdrop
          ? (e) => {
              if (e.target === e.currentTarget) onClose()
            }
          : undefined
      }
      onKeyDown={
        closeOnBackdrop
          ? (e) => {
              if (e.key === 'Escape') onClose()
            }
          : undefined
      }
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div className={`modal modal--${size}`}>
        {title && (
          <div className="modal__header">
            <h2 id="modal-title" className="modal__title">
              {title}
            </h2>
            <button
              type="button"
              className="modal__close"
              onClick={onClose}
              aria-label="Close modal"
            >
              <Cross2Icon width={18} height={18} />
            </button>
          </div>
        )}

        <div className="modal__body">{children}</div>

        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}
