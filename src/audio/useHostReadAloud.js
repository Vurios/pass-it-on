import { useEffect, useMemo, useState } from 'react'
import { getHostNarration } from './hostNarration.js'

export function useHostReadAloud(state) {
  const [enabled, setEnabled] = useState(false)
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
  const text = useMemo(
    () => getHostNarration(state),
    [state.phase, state.renderIndex, state.session],
  )

  useEffect(() => {
    if (!supported) return undefined
    window.speechSynthesis.cancel()
    if (!enabled || !text) return undefined
    const timer = window.setTimeout(() => {
      const utterance = new window.SpeechSynthesisUtterance(text)
      utterance.lang = state.session.locale === 'fil' ? 'fil-PH' : 'en-US'
      utterance.rate = 0.92
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    }, 400)
    return () => {
      window.clearTimeout(timer)
      window.speechSynthesis.cancel()
    }
  }, [enabled, state.session.locale, supported, text])

  return {
    enabled,
    supported,
    toggle: () => setEnabled((current) => !current),
  }
}
