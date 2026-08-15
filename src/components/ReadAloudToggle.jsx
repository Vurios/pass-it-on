import { BookOpenText } from '@phosphor-icons/react'

export function ReadAloudToggle({ enabled, supported, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={!supported}
      aria-pressed={enabled}
      className={`${enabled ? 'bg-lime' : 'bg-white'} press inline-flex min-h-16 shrink-0 items-center gap-2 rounded-[16px] border-chunky border-ink px-4 font-display text-lg font-bold text-ink shadow-hard focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:opacity-45 host:text-3xl`}
      title={supported ? undefined : 'Speech synthesis is unavailable in this browser'}
    >
      <BookOpenText size={28} weight="fill" aria-hidden="true" />
      {enabled ? 'Reading on' : 'Read aloud'}
    </button>
  )
}
