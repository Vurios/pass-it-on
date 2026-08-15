import clsx from 'clsx'

const tiltClasses = {
  left: '-rotate-1',
  right: 'rotate-1',
  none: 'rotate-0',
}

export function Card({ as: Element = 'div', fill = 'cream', tilt = 'none', press = false, className, children, ...props }) {
  return (
    <Element
      className={clsx(
        'rounded-[18px] border-chunky border-ink p-5 text-ink shadow-hard',
        fill === 'white' ? 'bg-paper' : 'bg-cream',
        tiltClasses[tilt] ?? tiltClasses.none,
        press && 'press focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ink',
        className,
      )}
      {...props}
    >
      {children}
    </Element>
  )
}
