import { useEffect, useMemo, useRef, useState } from 'react'
import { CaretLeft, CaretRight, DownloadSimple, Eye, Images, Megaphone, Repeat, ShareNetwork, Sparkle } from '@phosphor-icons/react'
import { toPng } from 'html-to-image'
import { BigButton } from './BigButton.jsx'
import { BrandMark } from './BrandMark.jsx'
import { ErrorState } from './ErrorState.jsx'

const EXPORT_WIDTH = 1080
const DESKTOP_CARDS_PER_PAGE = 2
const techniqueIcons = [Eye, Megaphone, Images, ShareNetwork]

export function RecapCard({ state, onBack, onPlayAgain, onMenu, onBonus }) {
  const exportCardRef = useRef(null)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')
  const [page, setPage] = useState(0)
  const [cardsPerPage, setCardsPerPage] = useState(() => (window.innerWidth < 640 ? 1 : DESKTOP_CARDS_PER_PAGE))

  useEffect(() => {
    const update = () => setCardsPerPage(window.innerWidth < 640 ? 1 : DESKTOP_CARDS_PER_PAGE)
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const techniques = useMemo(() => {
    const seen = new Set()
    return state.encountered.filter((entry) => {
      const key = `${entry.technique}|${entry.explanation}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [state.encountered])

  const totalPages = Math.max(1, Math.ceil(techniques.length / cardsPerPage))
  const currentPage = Math.min(page, totalPages - 1)
  const pageItems = techniques.slice(currentPage * cardsPerPage, (currentPage + 1) * cardsPerPage)

  const download = async () => {
    if (!exportCardRef.current || exporting) return
    setExporting(true)
    setExportError('')
    try {
      const dataUrl = await toPng(exportCardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        width: EXPORT_WIDTH,
        backgroundColor: '#FFF8ED',
      })
      const link = document.createElement('a')
      link.download = 'pass-it-on-recap.png'
      link.href = dataUrl
      link.click()
    } catch {
      setExportError('The card could not download. Try once more.')
    } finally {
      setExporting(false)
    }
  }

  if (exportError) {
    return (
      <ErrorState
        host
        message={exportError}
        actionLabel="Back to Recap"
        onAction={() => setExportError('')}
      />
    )
  }

  return (
    <main className="host-screen dot-grid screen-min-h flex flex-col justify-between bg-cream px-3 py-2 text-ink sm:px-6 sm:py-3">
      {/* Top Action & Navigation Bar */}
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 border-b-chunky border-ink pb-2.5">
        <div className="flex items-center gap-2 sm:gap-3">
          <BrandMark decorative className="w-9 shrink-0 sm:w-11" />
          <div>
            <h1 className="font-display text-xl font-bold leading-tight sm:text-2xl lg:text-3xl host:text-5xl">
              What Your Room Learned
            </h1>
            <p className="font-body text-xs font-semibold text-ink/70 sm:text-sm host:text-3xl">
              {techniques.length} techniques identified
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onBonus && (
            <button
              type="button"
              onClick={onBonus}
              className="press-sm inline-flex h-9 items-center gap-1.5 rounded-[12px] border-chunky border-ink bg-lime px-3 font-display text-xs font-bold shadow-hard-sm sm:h-10 sm:px-3.5 sm:text-sm host:h-14 host:text-3xl"
            >
              <Repeat size={18} weight="bold" aria-hidden="true" />
              <span>Bonus Round</span>
            </button>
          )}
          <button
            type="button"
            onClick={download}
            disabled={exporting}
            className="press-sm inline-flex h-9 items-center gap-1.5 rounded-[12px] border-chunky border-ink bg-ocean px-3 font-display text-xs font-bold text-white shadow-hard-sm sm:h-10 sm:px-3.5 sm:text-sm host:h-14 host:text-3xl"
          >
            <DownloadSimple size={18} weight="bold" aria-hidden="true" />
            <span>{exporting ? 'Making PNG...' : 'Save Recap Card'}</span>
          </button>
          <button
            type="button"
            onClick={onBack}
            className="press-sm inline-flex h-9 items-center rounded-[12px] border-chunky border-ink bg-sunshine px-3 font-display text-xs font-bold shadow-hard-sm sm:h-10 sm:px-3.5 sm:text-sm host:h-14 host:text-3xl"
          >
            Back to Scores
          </button>
          <button
            type="button"
            onClick={onPlayAgain}
            className="press-sm inline-flex h-9 items-center rounded-[12px] border-chunky border-ink bg-coral px-3 font-display text-xs font-bold text-white shadow-hard-sm sm:h-10 sm:px-3.5 sm:text-sm host:h-14 host:text-3xl"
          >
            Play Again
          </button>
          <button
            type="button"
            onClick={onMenu}
            className="press-sm inline-flex h-9 items-center rounded-[12px] border-chunky border-ink bg-white px-3 font-display text-xs font-bold shadow-hard-sm sm:h-10 sm:px-3.5 sm:text-sm host:h-14 host:text-3xl"
          >
            Back to Menu
          </button>
        </div>
      </div>

      {/* Paginated Techniques Card Display - Fits cleanly in 100dvh */}
      <div className="game-screen mx-auto my-auto flex w-full max-w-5xl flex-1 flex-col justify-center py-2">
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {pageItems.map((entry, index) => {
            const overallIndex = currentPage * cardsPerPage + index
            const TechniqueIcon = techniqueIcons[overallIndex % techniqueIcons.length]
            return (
              <div
                key={`${entry.technique}-${overallIndex}`}
                className={`${overallIndex % 2 ? '-rotate-0.5' : 'rotate-0.5'} flex flex-col justify-between rounded-[18px] border-chunky border-ink bg-white p-4 shadow-hard sm:p-5 host:p-8`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-[8px] border-chunky border-ink bg-sunshine px-2.5 py-0.5 font-display text-xs font-bold uppercase tracking-[0.06em] sm:text-sm host:text-2xl">
                      <TechniqueIcon size={17} weight="fill" aria-hidden="true" />
                      Technique {overallIndex + 1}
                    </span>
                    {entry.fabricated && (
                      <span className="inline-flex items-center gap-1 rounded-[6px] border-chunky border-ink bg-paper px-2 py-0.5 font-display text-[11px] font-bold uppercase tracking-[0.04em] shadow-hard-sm sm:text-xs host:text-xl">
                        <Sparkle size={13} weight="fill" aria-hidden="true" />
                        Fabricated Teaching Example
                      </span>
                    )}
                  </div>
                  <h2 className="safe-copy mt-2.5 font-display text-xl font-bold leading-snug sm:text-2xl lg:text-3xl host:text-5xl">
                    {entry.technique}
                  </h2>
                  <p className="safe-copy mt-2 font-body text-sm font-medium leading-relaxed sm:text-base host:text-3xl">
                    {entry.explanation}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Carousel / Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-3 flex items-center justify-between rounded-[14px] border-chunky border-ink bg-paper px-4 py-2 shadow-hard-sm sm:mt-4">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              aria-label="Previous Page"
              className="press-sm inline-flex h-8 items-center gap-1 rounded-[10px] border-chunky border-ink bg-white px-2.5 font-display text-xs font-bold shadow-hard-sm disabled:opacity-35 sm:h-9 sm:px-3 sm:text-sm"
            >
              <CaretLeft size={16} weight="bold" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-1.5" aria-label={`Page ${currentPage + 1} of ${totalPages}`}>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPage(i)}
                  aria-label={`Go to Page ${i + 1}`}
                  className={`h-3 rounded-full border-2 border-ink transition-all ${
                    currentPage === i ? 'w-7 bg-ink' : 'w-3 bg-white'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              aria-label="Next Page"
              className="press-sm inline-flex h-8 items-center gap-1 rounded-[10px] border-chunky border-ink bg-white px-2.5 font-display text-xs font-bold shadow-hard-sm disabled:opacity-35 sm:h-9 sm:px-3 sm:text-sm"
            >
              <span>Next</span>
              <CaretRight size={16} weight="bold" />
            </button>
          </div>
        )}
      </div>

      {/* Footer Teaching Note */}
      <footer className="mx-auto w-full max-w-5xl border-t-chunky border-ink pt-2 text-center">
        <p className="font-body text-sm font-semibold sm:text-base host:text-3xl">
          Your family encountered these techniques tonight. Next time you see them in the wild, you'll know what to look for.
        </p>
        <p className="font-body text-xs font-bold text-ink/80 sm:text-sm host:text-2xl">
          Every headline in this game was written by the team as a teaching example. None of them are real news.
        </p>
      </footer>

      {/* Off-screen Complete Poster for High-Resolution PNG Export */}
      <div className="fixed -left-[9999px] top-0 overflow-hidden" aria-hidden="true">
        <div ref={exportCardRef} className="recap-export min-h-[1350px] bg-cream p-10 text-ink">
          <div className="rounded-[22px] border-chunky border-ink bg-paper p-8 shadow-hard">
            <div className="flex items-center gap-6 border-b-chunky border-ink pb-6">
              <BrandMark decorative className="w-24 shrink-0" />
              <div className="min-w-0">
                <p className="font-display text-[20px] font-bold uppercase tracking-[0.14em]">Pass It On</p>
                <h1 className="safe-copy font-display text-[54px] font-bold leading-[1.02]">
                  What Your Room Learned
                </h1>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-6">
              {techniques.map((entry, index) => (
                <div
                  key={`export-${entry.technique}-${index}`}
                  className={`${index % 2 ? '-rotate-1' : 'rotate-1'} rounded-[18px] border-chunky border-ink bg-cream p-6 shadow-hard`}
                >
                  <span className="inline-flex items-center border-chunky border-ink bg-sunshine px-3 py-1 font-display text-[16px] font-bold uppercase tracking-[0.08em]">
                    Technique {index + 1}
                  </span>
                  <h2 className="safe-copy mt-3 font-display text-[28px] font-bold leading-tight">{entry.technique}</h2>
                  <p className="safe-copy mt-2 font-body text-[20px] font-medium leading-[1.4]">{entry.explanation}</p>
                  {entry.fabricated && (
                    <span className="mt-4 inline-flex -rotate-1 items-center border-chunky border-ink bg-paper px-2.5 py-1 font-display text-[15px] font-bold uppercase tracking-[0.08em] shadow-hard-sm">
                      Fabricated Teaching Example
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-8 font-body text-[22px] font-semibold leading-[1.45]">
              Your family encountered these techniques tonight. Next time you see them in the wild, you'll know what to look for.
            </p>
            <p className="mt-8 border-t-chunky border-ink pt-5 font-body text-[19px] font-bold">
              Every headline in this game was written by the team as a teaching example. None of them are real news.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
