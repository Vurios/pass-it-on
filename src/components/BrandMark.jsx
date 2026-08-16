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
      <path d="M24 25h88c12 0 22 10 22 22v42c0 12-10 22-22 22H75L49 134v-23H24C12 111 4 101 4 89V47c0-12 8-22 20-22Z" fill="#FFFEFB" stroke="#1A1A1A" strokeWidth="8" strokeLinejoin="round" />
      <path d="M42 68h66" fill="none" stroke="#2E86AB" strokeWidth="12" strokeLinecap="round" />
      <path d="m93 50 22 18-22 18" fill="#FFC53D" stroke="#1A1A1A" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M31 101c9-14 22-22 38-22h10v23H67c-9 0-15 4-22 13l-8 10-19-14 13-10Z" fill="#FF5A5F" stroke="#1A1A1A" strokeWidth="8" strokeLinejoin="round" />
      <path d="M129 91c-9 14-22 22-38 22H81V90h12c9 0 15-4 22-13l8-10 19 14-13 10Z" fill="#8BC34A" stroke="#1A1A1A" strokeWidth="8" strokeLinejoin="round" />
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
