import { BookOpenText, Brain, CaretRight, Images, MagnifyingGlass, ShareNetwork } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { BrandLockup } from '../components/BrandMark.jsx'
import { TopRail } from '../components/TopRail.jsx'

const rounds = [
  { Icon: MagnifyingGlass, colour: 'bg-ocean', title: 'Odd Source Out', copy: 'Compare four sources and choose the one that gives you the least reason to trust it.' },
  { Icon: ShareNetwork, colour: 'bg-coral', title: 'Spin Doctor', copy: 'Spot the phrases that push emotion, certainty, or blame harder than the evidence supports.' },
  { Icon: Images, colour: 'bg-lime', title: 'Real or Rendered', copy: 'Look closely at a visual clue and decide whether it is authentic or a teaching example.' },
]

export function HowToPlayScreen() {
  const navigate = useNavigate()
  return (
    <>
      <TopRail onBack={() => navigate('/')} backLabel="Menu" title="How to Play" />
      <main className="how-to-scroll dot-grid bg-cream text-ink">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
          <BrandLockup compact className="justify-start" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <section>
              <p className="font-display text-sm font-bold uppercase tracking-[0.1em] text-ocean">Living-Room Media Literacy</p>
              <h1 className="mt-2 font-display text-[clamp(2.5rem,7vw,5rem)] font-bold leading-[0.92] tracking-[-0.04em]">Look Up. Talk It Out. Pass It On.</h1>
              <p className="mt-5 max-w-[58ch] font-body text-lg font-medium leading-relaxed">One person hosts on the shared screen. Everyone else joins with a four-letter code and answers on a phone. No account or install needed.</p>
              <div className="mt-6 rounded-[18px] border-chunky border-ink bg-sunshine p-5 shadow-hard">
                <Brain size={36} weight="fill" aria-hidden="true" />
                <h2 className="mt-2 font-display text-2xl font-bold">Scoring</h2>
                <p className="mt-1 font-body text-base font-medium leading-relaxed">Correct answers earn points. Faster catches can earn more. Consecutive correct answers build a streak, but careful thinking beats random speed.</p>
              </div>
            </section>

            <section className="grid gap-4" aria-label="Round Types">
              {rounds.map(({ Icon, colour, title, copy }, index) => (
                <article key={title} className="flex gap-4 rounded-[18px] border-chunky border-ink bg-white p-5 shadow-hard">
                  <div className={`${colour} grid h-14 w-14 shrink-0 place-items-center rounded-[14px] border-chunky border-ink shadow-hard-sm`}>
                    <Icon size={28} weight="fill" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-display text-xs font-bold uppercase tracking-[0.1em]">Round {index + 1}</p>
                    <h2 className="mt-0.5 font-display text-2xl font-bold">{title}</h2>
                    <p className="mt-1 font-body text-base font-medium leading-relaxed">{copy}</p>
                  </div>
                </article>
              ))}
              <article className="rounded-[18px] border-chunky border-ink bg-paper p-5 shadow-hard">
                <div className="flex items-center gap-3">
                  <BookOpenText size={34} weight="fill" aria-hidden="true" />
                  <h2 className="font-display text-2xl font-bold">Family Recap Card</h2>
                </div>
                <p className="mt-2 font-body text-base font-medium leading-relaxed">At the end, save a shareable card with the manipulation techniques your room encountered. It is a reminder for the next time a suspicious post appears in a family chat.</p>
              </article>
            </section>
          </div>
          <button type="button" onClick={() => navigate('/')} className="press mt-8 inline-flex min-h-12 items-center gap-2 rounded-[16px] border-chunky border-ink bg-coral px-5 font-display text-lg font-bold text-white shadow-hard">
            Back to Menu <CaretRight size={20} weight="bold" aria-hidden="true" />
          </button>
        </div>
      </main>
    </>
  )
}
