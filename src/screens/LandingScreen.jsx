import { Link } from 'react-router-dom'
import { BigButton } from '../components/BigButton.jsx'
import { CarnivalTent } from '../components/CarnivalTent.jsx'

export function LandingScreen() {
  return (
    <main className="dot-grid min-h-[100dvh] bg-cream px-5 py-8 text-ink sm:px-8">
      <section className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-xl flex-col items-center justify-center">
        <CarnivalTent className="mb-2 w-44 sm:w-52" />
        <h1 className="text-center font-display text-5xl font-bold leading-none tracking-[-0.04em] sm:text-7xl">
          Pass It On
        </h1>
        <p className="mt-3 max-w-md text-center font-body text-lg font-medium leading-relaxed sm:text-xl">
          Spot the tricks. Share the clues. Play together.
        </p>
        <nav className="mt-8 grid w-full gap-5" aria-label="Choose a game mode">
          <BigButton as={Link} to="/host" variant="coral">Host a game</BigButton>
          <BigButton as={Link} to="/player" variant="ocean">Join a game</BigButton>
          <BigButton as={Link} to="/solo" variant="lime">Play on one screen</BigButton>
        </nav>
      </section>
    </main>
  )
}
