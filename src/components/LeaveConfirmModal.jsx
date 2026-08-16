import { ArrowLeft, SignOut, X } from '@phosphor-icons/react'
import { BigButton } from './BigButton.jsx'
import { Card } from './Card.jsx'

export function LeaveConfirmModal({
  open,
  onConfirm,
  onCancel,
  title = 'Leave Game?',
  message = 'Are you sure you want to return to the main menu? Your active game progress will be lost.',
  confirmLabel = 'Leave Game',
  cancelLabel = 'Keep Playing',
  confirmVariant = 'coral',
  icon: Icon = SignOut,
}) {
  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="leave-modal-title"
      className="fixed inset-0 z-50 grid place-items-center bg-ink/75 p-4"
    >
      <div className="game-screen w-full max-w-md">
        <Card fill="white" tilt="left" className="p-6 text-center sm:p-8">
          <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-full border-chunky border-ink bg-coral shadow-hard-sm">
            <Icon size={32} weight="bold" className="text-white" aria-hidden="true" />
          </div>
          <h2 id="leave-modal-title" className="font-display text-3xl font-bold sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 font-body text-base font-semibold leading-relaxed sm:text-lg">
            {message}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <BigButton variant={confirmVariant} onClick={onConfirm} className="gap-2 text-lg">
              <Icon size={20} weight="bold" aria-hidden="true" />
              {confirmLabel}
            </BigButton>
            <BigButton variant="sunshine" onClick={onCancel} className="gap-2 text-lg">
              <X size={20} weight="bold" aria-hidden="true" />
              {cancelLabel}
            </BigButton>
          </div>
        </Card>
      </div>
    </div>
  )
}
