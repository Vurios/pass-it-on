import clsx from 'clsx'

export function FabricatedStamp({ className }) {
  return (
    <span
      className={clsx(
        'inline-flex -rotate-2 items-center border-chunky border-ink bg-sunshine px-3 py-1',
        'font-display text-sm font-bold uppercase tracking-[0.08em] text-ink shadow-hard-sm',
        'host:px-5 host:text-5xl',
        className,
      )}
    >
      Fabricated for teaching
    </span>
  )
}
