import { SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react'

export function SoundToggle({ muted, onToggle }) {
  const Icon = muted ? SpeakerSlash : SpeakerHigh
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={muted ? 'Turn Sound On' : 'Mute Sound'}
      aria-pressed={muted}
      className="press-sm grid h-10 w-10 shrink-0 place-items-center rounded-[12px] border-chunky border-ink bg-white text-ink shadow-hard-sm focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ink sm:h-11 sm:w-11 host:h-14 host:w-14"
    >
      <Icon size={22} weight="fill" aria-hidden="true" />
    </button>
  )
}
