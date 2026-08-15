/*
 * The session toggles live in a sticky rail that takes up real space, so they
 * can never come to rest on top of a headline, a card or a button while the
 * page scrolls. Screens size themselves against --top-rail-height.
 */
export function TopRail({ children }) {
  return (
    <div className="top-rail sticky top-0 z-50 flex items-center justify-end gap-3 border-b-chunky border-ink bg-cream px-4">
      {children}
    </div>
  )
}
