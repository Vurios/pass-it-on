import { SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react'

export function SoundToggle({ muted, onToggle }) {
  const Icon = muted ? SpeakerSlash : SpeakerHigh
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={muted ? 'Turn Sound On' : 'Mute Sound'}
      aria-pressed={muted}
      className="press-sm grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border-chunky border-ink bg-white text-ink shadow-hard-sm focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ink sm:h-10 sm:w-10 host:h-12 host:w-12"
    >
      <Icon size={20} weight="fill" aria-hidden="true" />
    </button>
  )
}
