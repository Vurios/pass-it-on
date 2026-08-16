import { Gear, Sparkle, SpeakerHigh } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { SoundToggle } from '../components/SoundToggle.jsx'
import { TopRail } from '../components/TopRail.jsx'
import { useSessionSound } from '../audio/useSessionSound.js'

export function SettingsScreen() {
  const navigate = useNavigate()
  const sound = useSessionSound()
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  return (
    <>
      <TopRail onBack={() => navigate('/')} backLabel="Menu" title="Settings">
        <SoundToggle muted={sound.muted} onToggle={sound.toggleMuted} />
      </TopRail>
      <main className="dot-grid screen-min-h grid place-items-center bg-cream px-4 py-6 text-ink">
        <section className="game-screen w-full max-w-2xl rounded-[22px] border-chunky border-ink bg-white p-[clamp(1.25rem,4vw,2.25rem)] shadow-hard">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-[14px] border-chunky border-ink bg-sunshine shadow-hard-sm">
              <Gear size={30} weight="fill" aria-hidden="true" />
            </div>
            <div>
              <p className="font-display text-sm font-bold uppercase tracking-[0.1em] text-ocean">Game Preferences</p>
              <h1 className="font-display text-3xl font-bold sm:text-4xl">Settings</h1>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            <div className="flex items-center justify-between gap-4 rounded-[16px] border-chunky border-ink bg-cream p-4">
              <div className="flex items-center gap-3">
                <SpeakerHigh size={28} weight="fill" aria-hidden="true" />
                <div>
                  <h2 className="font-display text-xl font-bold">Game Audio</h2>
                  <p className="font-body text-base font-medium">Sound effects stay muted or unmuted for this tab.</p>
                </div>
              </div>
              <SoundToggle muted={sound.muted} onToggle={sound.toggleMuted} />
            </div>
            <div className="flex items-center gap-3 rounded-[16px] border-chunky border-ink bg-paper p-4">
              <Sparkle size={28} weight="fill" aria-hidden="true" />
              <div>
                <h2 className="font-display text-xl font-bold">Reduced Motion</h2>
                <p className="font-body text-base font-medium">{reducedMotion ? 'Your device requests reduced motion. Large movement and confetti are disabled.' : 'Your device allows motion. Change this in system accessibility settings.'}</p>
              </div>
            </div>
          </div>
          <p className="mt-5 border-t-chunky border-ink pt-4 font-body text-base font-medium">Read Aloud is available on the host screen so one shared device narrates questions without phone audio overlap.</p>
        </section>
      </main>
    </>
  )
}
