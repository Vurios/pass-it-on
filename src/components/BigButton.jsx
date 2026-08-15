import clsx from 'clsx'

const variants = {
  coral: 'bg-coral',
  sunshine: 'bg-sunshine',
  ocean: 'bg-ocean',
  lime: 'bg-lime',
}

export function BigButton({ as: Element = 'button', variant = 'coral', className, children, ...props }) {
  return (
    <Element
      className={clsx(
        'press inline-flex min-h-16 w-full items-center justify-center rounded-[18px] border-chunky border-ink px-6 py-4',
        'font-display text-xl font-bold leading-tight text-ink shadow-hard',
        'focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ink',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant] ?? variants.coral,
        className,
      )}
      {...props}
    >
      {children}
    </Element>
  )
}
