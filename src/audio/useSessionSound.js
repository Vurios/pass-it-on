import { useCallback, useEffect, useRef, useState } from 'react'
import { playSound, setSoundMuted, SOUND_CUES } from './soundSystem.js'

const SESSION_MUTE_KEY = 'pass-it-on:muted'

function initialMuted() {
  try { return sessionStorage.getItem(SESSION_MUTE_KEY) === 'true' } catch { return false }
}

export function useSessionSound() {
  const [muted, setMuted] = useState(initialMuted)
  const mutedRef = useRef(muted)

  useEffect(() => {
    mutedRef.current = muted
    setSoundMuted(muted)
    try { sessionStorage.setItem(SESSION_MUTE_KEY, String(muted)) } catch { /* Session storage can be unavailable. */ }
  }, [muted])

  const play = useCallback((cue) => {
    window.setTimeout(() => {
      if (!mutedRef.current) playSound(cue)
    }, 0)
  }, [])

  const onCountdownSecond = useCallback((seconds) => {
    if (seconds >= 1 && seconds <= 3) play(SOUND_CUES.TICK)
  }, [play])

  return { muted, toggleMuted: () => setMuted((current) => !current), play, onCountdownSecond }
}
