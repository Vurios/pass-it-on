import clsx from 'clsx'

export function FabricatedStamp({ className }) {
  return (
    <span
      className={clsx(
        'inline-flex -rotate-2 items-center border-chunky border-ink bg-sunshine px-2.5 py-0.5 sm:px-3 sm:py-1',
        'font-display text-xs font-bold uppercase tracking-[0.08em] text-ink shadow-hard-sm sm:text-sm',
        'host:px-5 host:text-4xl',
        className,
      )}
    >
      Fabricated Teaching Example
    </span>
  )
}
