import { ArrowLeft } from '@phosphor-icons/react'
import { BrandMark } from './BrandMark.jsx'

/*
 * The session toggles and navigation controls live in a sticky rail that takes up
 * compact, fluid space. Screens size themselves against --top-rail-height.
 */
export function TopRail({ onBack, backLabel, backAriaLabel = 'Back to Menu', title = 'Pass It On', children }) {
  return (
    <header className="top-rail sticky top-0 z-50 flex items-center justify-between border-b-chunky border-ink bg-cream px-3 sm:px-6">
      <div className="flex items-center gap-3">
        <BrandMark decorative className="w-8 sm:w-9 host:w-12" />
        <span className="top-rail-title font-display text-base font-bold uppercase tracking-[0.08em] text-ink sm:text-lg host:text-4xl">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {children}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label={backAriaLabel}
            className="press-sm inline-flex h-9 items-center gap-1.5 rounded-[10px] border-chunky border-ink bg-white px-2.5 font-display text-xs font-bold text-ink shadow-hard-sm focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ink sm:h-10 sm:px-3 sm:text-sm host:h-12 host:text-2xl"
          >
            <ArrowLeft size={18} weight="bold" aria-hidden="true" />
            <span className="hidden sm:inline">{backLabel || 'Back'}</span>
          </button>
        )}
      </div>
    </header>
  )
}
