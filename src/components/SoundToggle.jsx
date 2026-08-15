import { SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react'

export function SoundToggle({ muted, onToggle }) {
  const Icon = muted ? SpeakerSlash : SpeakerHigh
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={muted ? 'Turn sound on' : 'Mute sound'}
      aria-pressed={muted}
      className="press grid min-h-16 min-w-16 shrink-0 place-items-center rounded-[16px] border-chunky border-ink bg-white text-ink shadow-hard focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ink"
    >
      <Icon size={30} weight="fill" aria-hidden="true" />
    </button>
  )
}
