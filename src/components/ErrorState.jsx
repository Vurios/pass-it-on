import { Warning } from '@phosphor-icons/react'
import { BigButton } from './BigButton.jsx'
import { Card } from './Card.jsx'

export function ErrorState({ message, actionLabel, onAction, icon: Icon = Warning, host = false }) {
  return (
    <main className={`${host ? 'host-screen dot-grid p-6' : 'safe-player-screen dot-grid'} grid screen-min-h place-items-center bg-cream text-ink`}>
      <Card fill="white" tilt="left" className={`${host ? 'max-w-5xl' : 'max-w-md'} flex w-full flex-col items-center gap-6 p-8 text-center`} role="alert">
        <Icon size={host ? 110 : 72} weight="fill" aria-hidden="true" />
        <p className={`${host ? 'host:text-5xl' : 'text-2xl'} safe-copy font-display font-bold leading-tight`}>{message}</p>
        <BigButton variant="sunshine" onClick={onAction}>{actionLabel}</BigButton>
      </Card>
    </main>
  )
}
