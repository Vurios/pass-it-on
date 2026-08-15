import { Ticket } from '@phosphor-icons/react'

export function LoadingState({ message = 'Getting the show ready...', host = false }) {
  return (
    <div className={`${host ? 'host-screen' : 'safe-player-screen'} dot-grid flex screen-min-h flex-col items-center justify-center gap-5 bg-cream p-6 text-center text-ink`} role="status">
      <Ticket className="ticket-turn" size={host ? 110 : 72} weight="fill" aria-hidden="true" />
      <p className={`${host ? 'host:text-5xl' : 'text-2xl'} font-display font-bold`}>{message}</p>
    </div>
  )
}
