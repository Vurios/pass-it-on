import { useEffect, useState } from 'react'
import { BookOpenText, GameController, Gear, Lightbulb, TelevisionSimple, UsersThree } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { BrandLockup, BrandMark } from '../components/BrandMark.jsx'
import { BigButton } from '../components/BigButton.jsx'
import { OnboardingOverlay } from '../components/OnboardingOverlay.jsx'
import { SoundToggle } from '../components/SoundToggle.jsx'
import { useSessionSound } from '../audio/useSessionSound.js'

const menuTips = [
  'Satirical sources can look real at first glance.',
  'A confident tone is not the same thing as strong evidence.',
  'Check the source before passing a surprising claim along.',
]

export function LandingScreen() {
  const sound = useSessionSound()
  const [tipIndex, setTipIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setTipIndex((current) => (current + 1) % menuTips.length), 6_000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <main className="ambient-dot-grid h-[100dvh] max-h-[100dvh] overflow-hidden bg-cream text-ink">
      <header className="menu-topbar flex h-[var(--top-rail-height)] items-center justify-between border-b-chunky border-ink bg-cream/95 px-3 sm:px-6">
        <Link to="/" aria-label="Pass It On Home" className="inline-flex items-center gap-2 font-display text-base font-bold sm:text-lg">
          <BrandMark decorative className="w-9 sm:w-10" />
          <span>Pass It On</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Link to="/how-to-play" aria-label="How to Play" className="press-sm grid h-9 w-9 place-items-center rounded-[10px] border-chunky border-ink bg-sunshine text-ink shadow-hard-sm sm:h-10 sm:w-10">
            <BookOpenText size={20} weight="fill" aria-hidden="true" />
          </Link>
          <Link to="/settings" aria-label="Settings" className="press-sm grid h-9 w-9 place-items-center rounded-[10px] border-chunky border-ink bg-white text-ink shadow-hard-sm sm:h-10 sm:w-10">
            <Gear size={20} weight="fill" aria-hidden="true" />
          </Link>
          <SoundToggle muted={sound.muted} onToggle={sound.toggleMuted} />
        </div>
      </header>

      <section className="relative z-[1] mx-auto flex h-[calc(100dvh-var(--top-rail-height))] w-full max-w-3xl flex-col items-center justify-center px-4 py-[clamp(0.65rem,2dvh,1.5rem)] sm:px-8">
        <BrandLockup className="menu-hero shrink-0" />
        <p className="tagline-badge mt-[clamp(0.5rem,1.5dvh,0.9rem)] max-w-xl rounded-[14px] border-2 border-ink bg-white/90 px-4 py-2 text-center font-body text-[clamp(0.9rem,2dvh,1.1rem)] font-medium leading-snug tracking-[0.025em] shadow-hard-sm">
          Spot the tricks. Share the clues. Play together.
        </p>

        <nav className="mt-[clamp(0.7rem,2dvh,1.4rem)] flex w-full flex-col items-center gap-[clamp(0.55rem,1.2dvh,0.85rem)]" aria-label="Choose a Game Mode">
          <BigButton as={Link} to="/host" variant="coral" className="!min-h-[clamp(4.25rem,9dvh,5.6rem)] gap-3 text-[clamp(1.35rem,3dvh,1.8rem)] text-white sm:w-[82%]">
            <TelevisionSimple size={30} weight="fill" aria-hidden="true" />
            Host a Game
          </BigButton>
          <BigButton as={Link} to="/player" variant="ocean" className="!min-h-[clamp(3.5rem,7dvh,4.35rem)] gap-2.5 text-[clamp(1.1rem,2.4dvh,1.4rem)] text-white sm:w-[64%]">
            <UsersThree size={25} weight="fill" aria-hidden="true" />
            Join a Game
          </BigButton>
          <Link to="/solo" className="press-sm inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] border-chunky border-ink bg-lime px-5 font-display text-[clamp(0.95rem,2dvh,1.15rem)] font-bold shadow-hard-sm sm:w-[54%]">
            <GameController size={22} weight="fill" aria-hidden="true" />
            Play on One Screen
          </Link>
        </nav>

        <p key={tipIndex} className="tip-line game-screen mt-[clamp(0.65rem,1.8dvh,1.15rem)] flex max-w-xl items-center gap-2 text-center font-body text-[clamp(0.78rem,1.7dvh,0.95rem)] font-semibold text-ink/75">
          <Lightbulb className="shrink-0 text-ocean" size={20} weight="fill" aria-hidden="true" />
          <span><strong>Tip:</strong> {menuTips[tipIndex]}</span>
        </p>
      </section>
      <OnboardingOverlay />
    </main>
  )
}
