import { useState } from 'react'
import {
  ArrowsCounterClockwise,
  Check,
  Eye,
  Gear,
  Info,
  Play,
  SpeakerHigh,
  Vibrate,
  Waveform,
} from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { SoundToggle } from '../components/SoundToggle.jsx'
import { TopRail } from '../components/TopRail.jsx'
import { useSessionSound } from '../audio/useSessionSound.js'
import { SOUND_CUES } from '../audio/soundSystem.js'

export function SettingsScreen() {
  const navigate = useNavigate()
  const sound = useSessionSound()
  const [testingVoice, setTestingVoice] = useState(false)
  const [activeCue, setActiveCue] = useState(null)
  const [resetSuccess, setResetSuccess] = useState(false)

  const [highContrast, setHighContrast] = useState(() => {
    try { return localStorage.getItem('pass-it-on:high-contrast') === 'true' } catch { return false }
  })
  const [haptics, setHaptics] = useState(() => {
    try { return localStorage.getItem('pass-it-on:haptics') !== 'false' } catch { return true }
  })

  const toggleHighContrast = () => {
    const next = !highContrast
    setHighContrast(next)
    try {
      localStorage.setItem('pass-it-on:high-contrast', String(next))
      if (next) document.documentElement.classList.add('high-contrast')
      else document.documentElement.classList.remove('high-contrast')
    } catch { /* storage fallback */ }
  }

  const toggleHaptics = () => {
    const next = !haptics
    setHaptics(next)
    try {
      localStorage.setItem('pass-it-on:haptics', String(next))
      if (next && navigator.vibrate) navigator.vibrate(30)
    } catch { /* storage fallback */ }
  }

  const testSoundCue = (cue, name) => {
    sound.play(cue)
    setActiveCue(name)
    window.setTimeout(() => setActiveCue(null), 700)
  }

  const testNarration = () => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    setTestingVoice(true)
    const utterance = new window.SpeechSynthesisUtterance(
      'Pass It On! Spot the spin, share the clues, and check your sources.'
    )
    utterance.rate = 0.92
    utterance.pitch = 1
    utterance.onend = () => setTestingVoice(false)
    utterance.onerror = () => setTestingVoice(false)
    window.speechSynthesis.speak(utterance)
  }

  const handleResetData = () => {
    try {
      sessionStorage.clear()
      localStorage.removeItem('pass-it-on:player-name')
      localStorage.removeItem('pass-it-on:high-contrast')
      localStorage.removeItem('pass-it-on:haptics')
      document.documentElement.classList.remove('high-contrast')
      setHighContrast(false)
      setHaptics(true)
      setResetSuccess(true)
      window.setTimeout(() => setResetSuccess(false), 3000)
    } catch { /* storage fallback */ }
  }

  const soundCuesList = [
    { cue: SOUND_CUES.CORRECT, label: 'Correct', colour: 'bg-lime text-ink' },
    { cue: SOUND_CUES.INCORRECT, label: 'Incorrect', colour: 'bg-coral text-white' },
    { cue: SOUND_CUES.SCOREBOARD, label: 'Fanfare', colour: 'bg-sunshine text-ink' },
    { cue: SOUND_CUES.LOCK, label: 'Lock In', colour: 'bg-ocean text-white' },
    { cue: SOUND_CUES.TICK, label: 'Timer Tick', colour: 'bg-paper text-ink' },
  ]

  const hasTTS = typeof window !== 'undefined' && 'speechSynthesis' in window

  return (
    <>
      <TopRail onBack={() => navigate('/')} backLabel="Menu" title="Settings">
        <SoundToggle muted={sound.muted} onToggle={sound.toggleMuted} />
      </TopRail>
      
      <main className="dot-grid screen-min-h flex flex-col justify-center items-center bg-cream px-3 py-2 text-ink sm:px-6">
        <div className="mx-auto w-full max-w-2xl">
          <section className="game-screen w-full rounded-[20px] border-chunky border-ink bg-white p-4 shadow-hard sm:p-6">
            
            {/* Header */}
            <div className="flex items-center gap-3 border-b-chunky border-ink pb-3">
              <div className="grid h-11 w-11 place-items-center rounded-[12px] border-chunky border-ink bg-sunshine shadow-hard-sm sm:h-12 sm:w-12">
                <Gear size={24} weight="fill" aria-hidden="true" />
              </div>
              <div>
                <p className="font-display text-xs font-bold uppercase tracking-[0.08em] text-ocean">Game Preferences & Tools</p>
                <h1 className="font-display text-2xl font-bold sm:text-3xl">Settings</h1>
              </div>
            </div>

            <div className="mt-3.5 space-y-2.5">
              
              {/* Audio Soundboard & Speaker Calibration */}
              <div className="rounded-[14px] border-chunky border-ink bg-cream p-3 shadow-hard-sm sm:p-3.5">
                <div className="flex items-center gap-2">
                  <SpeakerHigh size={20} weight="fill" className="text-ocean" aria-hidden="true" />
                  <div>
                    <h2 className="font-display text-sm font-bold sm:text-base">Soundboard & Speaker Test</h2>
                    <p className="font-body text-xs font-medium text-ink/75">
                      Tap any sound effect to test your party room audio.
                    </p>
                  </div>
                </div>

                <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {soundCuesList.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => testSoundCue(item.cue, item.label)}
                      className={`${item.colour} press-sm flex h-9 items-center justify-center gap-1 rounded-[8px] border-2 border-ink font-display text-xs font-bold shadow-hard-sm focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ink sm:h-10 sm:text-sm`}
                    >
                      {activeCue === item.label ? <Check size={14} weight="bold" /> : <Play size={12} weight="fill" />}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Host Narration Preview */}
              <div className="flex flex-col gap-2 rounded-[14px] border-chunky border-ink bg-paper p-3 shadow-hard-sm sm:flex-row sm:items-center sm:justify-between sm:p-3.5">
                <div className="flex items-center gap-2">
                  <Waveform size={20} weight="bold" className="text-coral" aria-hidden="true" />
                  <div>
                    <h2 className="font-display text-sm font-bold sm:text-base">Host Voice Narration</h2>
                    <p className="font-body text-xs font-medium text-ink/75">
                      {hasTTS ? 'Preview text-to-speech audio used for read-aloud questions.' : 'Speech synthesis not supported on this browser.'}
                    </p>
                  </div>
                </div>

                {hasTTS && (
                  <button
                    type="button"
                    onClick={testNarration}
                    disabled={testingVoice}
                    className="press-sm inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-[8px] border-2 border-ink bg-sunshine px-3 font-display text-xs font-bold text-ink shadow-hard-sm focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:opacity-50 sm:h-9"
                  >
                    <Play size={14} weight="fill" aria-hidden="true" />
                    <span>{testingVoice ? 'Speaking...' : 'Test Voice'}</span>
                  </button>
                )}
              </div>

              {/* Display & Accessibility Preferences */}
              <div className="grid gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={toggleHighContrast}
                  aria-pressed={highContrast}
                  className="press-sm flex items-center justify-between gap-2.5 rounded-[12px] border-chunky border-ink bg-cream p-3 text-left shadow-hard-sm"
                >
                  <div className="flex items-center gap-2">
                    <Eye size={20} weight="fill" className="text-ocean" aria-hidden="true" />
                    <div>
                      <h3 className="font-display text-xs font-bold sm:text-sm">Projector Mode</h3>
                      <p className="font-body text-[11px] text-ink/75">Enhanced contrast for TV/projectors</p>
                    </div>
                  </div>
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-ink font-display text-[10px] font-bold ${highContrast ? 'bg-lime text-ink' : 'bg-white text-ink/40'}`}>
                    {highContrast ? 'ON' : 'OFF'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={toggleHaptics}
                  aria-pressed={haptics}
                  className="press-sm flex items-center justify-between gap-2.5 rounded-[12px] border-chunky border-ink bg-cream p-3 text-left shadow-hard-sm"
                >
                  <div className="flex items-center gap-2">
                    <Vibrate size={20} weight="fill" className="text-coral" aria-hidden="true" />
                    <div>
                      <h3 className="font-display text-xs font-bold sm:text-sm">Phone Haptics</h3>
                      <p className="font-body text-[11px] text-ink/75">Vibrate on answer tap & lock-in</p>
                    </div>
                  </div>
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-ink font-display text-[10px] font-bold ${haptics ? 'bg-lime text-ink' : 'bg-white text-ink/40'}`}>
                    {haptics ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>

              {/* Data & Session Storage Reset */}
              <div className="flex flex-col gap-2 rounded-[14px] border-chunky border-ink bg-paper p-3 shadow-hard-sm sm:flex-row sm:items-center sm:justify-between sm:p-3.5">
                <div className="flex items-center gap-2">
                  <ArrowsCounterClockwise size={20} weight="bold" className="text-ink" aria-hidden="true" />
                  <div>
                    <h2 className="font-display text-xs font-bold sm:text-sm">Reset Local Game Data</h2>
                    <p className="font-body text-[11px] text-ink/75">Clears saved player nicknames, room sessions, and cached preferences.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetData}
                  className="press-sm inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-[8px] border-2 border-ink bg-white px-2.5 font-display text-xs font-bold text-coral shadow-hard-sm hover:bg-coral hover:text-white sm:h-9 sm:px-3"
                >
                  {resetSuccess ? <Check size={14} weight="bold" /> : <ArrowsCounterClockwise size={14} weight="bold" />}
                  <span>{resetSuccess ? 'Reset Done!' : 'Clear Cache'}</span>
                </button>
              </div>

            </div>

            {/* Footer / About */}
            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t-chunky border-ink pt-2.5 font-body text-xs font-semibold text-ink/70">
              <div className="flex items-center gap-1.5">
                <Info size={15} weight="bold" aria-hidden="true" />
                <span>Pass It On · Party Edition</span>
              </div>
              <span className="rounded-full border-2 border-ink bg-sunshine px-2 py-0.5 font-display text-[10px] font-bold text-ink shadow-hard-sm">
                v1.0.0 · Offline Ready
              </span>
            </div>

          </section>
        </div>
      </main>
    </>
  )
}
