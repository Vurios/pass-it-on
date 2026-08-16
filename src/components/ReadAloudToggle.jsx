import { BookOpenText } from '@phosphor-icons/react'

export function ReadAloudToggle({ enabled, supported, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={!supported}
      aria-pressed={enabled}
      aria-label={enabled ? 'Turn Read Aloud Off' : 'Turn Read Aloud On'}
      className={`${enabled ? 'bg-lime' : 'bg-white'} press-sm inline-flex h-10 shrink-0 items-center gap-2 rounded-[12px] border-chunky border-ink px-3 font-display text-sm font-bold text-ink shadow-hard-sm focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:opacity-45 sm:h-11 sm:px-3.5 sm:text-base host:h-14 host:text-3xl`}
      title={supported ? undefined : 'Speech synthesis is unavailable in this browser'}
    >
      <BookOpenText size={22} weight="fill" aria-hidden="true" />
      <span className="read-aloud-label">{enabled ? 'Reading On' : 'Read Aloud'}</span>
    </button>
  )
}
