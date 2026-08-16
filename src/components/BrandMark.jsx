import clsx from 'clsx'

export function BrandMark({ className, title = 'Pass It On logo', decorative = false }) {
  return (
    <svg
      viewBox="0 0 160 160"
      className={clsx('brand-mark', className)}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? 'true' : undefined}
      aria-label={decorative ? undefined : title}
    >
      <g transform="translate(9, 5)">
        <path d="M34 20h76c17 0 30 13 30 30v44c0 17-13 30-30 30H75l-29 22 6-22H34C17 124 4 111 4 94V50c0-17 13-30 30-30Z" fill="#FFC53D" stroke="#1A1A1A" strokeWidth="8" strokeLinejoin="round" />
        <path d="M28 60h49V43l38 29-38 29V84H28Z" fill="#2E86AB" stroke="#1A1A1A" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  )
}

export function BrandLockup({ compact = false, className }) {
  return (
    <div className={clsx('brand-lockup flex items-center justify-center', compact ? 'gap-2.5' : 'gap-[clamp(0.85rem,2.2vw,1.6rem)]', className)}>
      <BrandMark decorative className={compact ? 'w-11 sm:w-12' : 'w-[clamp(5rem,12vw,7.5rem)]'} />
      <span className={clsx(
        'font-display font-bold leading-[0.86] tracking-[-0.055em] text-ink',
        compact ? 'text-xl sm:text-2xl' : 'text-[clamp(3rem,10vw,6rem)]',
      )}>
        Pass It On
      </span>
    </div>
  )
}
