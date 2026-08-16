import { useEffect, useState } from 'react'
import { Check, DeviceMobile, TelevisionSimple, UsersThree, X } from '@phosphor-icons/react'
import { BigButton } from './BigButton.jsx'
import { Card } from './Card.jsx'

const ONBOARDING_KEY = 'pass-it-on:onboarding-seen'

const steps = [
  { Icon: TelevisionSimple, colour: 'bg-coral', title: 'Host on One Screen', copy: 'Put the host screen where everyone can see it.' },
  { Icon: UsersThree, colour: 'bg-ocean', title: 'Join with Four Letters', copy: 'Everyone else opens the game on a phone.' },
  { Icon: DeviceMobile, colour: 'bg-lime', title: 'Tap Answers on Phones', copy: 'Look up for the clues, then lock in a choice.' },
]

export function OnboardingOverlay() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try { setOpen(localStorage.getItem(ONBOARDING_KEY) !== 'true') } catch { setOpen(true) }
  }, [])

  const close = () => {
    try { localStorage.setItem(ONBOARDING_KEY, 'true') } catch { /* Private browsing can block storage. */ }
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/75 p-3 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="first-game-title">
      <Card fill="white" tilt="left" className="game-screen relative max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl overflow-hidden p-[clamp(0.8rem,3vw,2rem)]">
        <button type="button" onClick={close} aria-label="Close Guide" className="press-sm absolute right-3 top-3 grid h-12 w-12 place-items-center rounded-[12px] border-chunky border-ink bg-white shadow-hard-sm">
          <X size={24} weight="bold" aria-hidden="true" />
        </button>
        <p className="font-display text-sm font-bold uppercase tracking-[0.1em] text-ocean">First Game</p>
        <h2 id="first-game-title" className="mt-1 max-w-2xl font-display text-[clamp(2rem,5vw,3.75rem)] font-bold leading-none tracking-[-0.035em]">
          Three Steps. Everyone Plays.
        </h2>
        <div className="mt-[clamp(0.65rem,2dvh,2rem)] grid gap-2 sm:grid-cols-3 sm:gap-3">
          {steps.map(({ Icon, colour, title, copy }, index) => (
            <article key={title} className="flex items-center gap-3 rounded-[16px] border-chunky border-ink bg-cream p-2.5 shadow-hard-sm sm:block sm:p-5">
              <div className={`${colour} grid h-12 w-12 shrink-0 place-items-center rounded-[14px] border-chunky border-ink shadow-hard-sm sm:h-14 sm:w-14`}>
                <Icon size={30} weight="fill" aria-hidden="true" />
              </div>
              <div>
                <p className="font-display text-sm font-bold uppercase tracking-[0.08em] sm:mt-3">Step {index + 1}</p>
                <h3 className="font-display text-lg font-bold leading-tight sm:mt-1 sm:text-2xl">{title}</h3>
                <p className="font-body text-base font-medium leading-snug sm:mt-1.5">{copy}</p>
              </div>
            </article>
          ))}
        </div>
        <BigButton variant="sunshine" onClick={close} className="mt-4 gap-2 sm:ml-auto sm:w-auto sm:min-w-60">
          <Check size={24} weight="bold" aria-hidden="true" />
          Got It
        </BigButton>
      </Card>
    </div>
  )
}
