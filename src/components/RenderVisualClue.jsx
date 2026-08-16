import { useState } from 'react'
import { MagnifyingGlassPlus, ShieldCheck, Sparkle, WarningCircle } from '@phosphor-icons/react'

export function RenderVisualClue({ item, onInspect, className = '' }) {
  const [zoomed, setZoomed] = useState(false)
  const id = item?.id

  const toggleZoom = () => {
    setZoomed((current) => !current)
    if (onInspect) onInspect(!zoomed)
  }

  return (
    <div className={`relative overflow-hidden rounded-[16px] border-chunky border-ink bg-white shadow-hard-sm ${className}`}>
      {/* Top Clue Header Bar */}
      <div className="flex items-center justify-between border-b-2 border-ink bg-cream px-3 py-1.5 font-display text-xs font-bold text-ink">
        <span className="flex items-center gap-1.5 uppercase tracking-[0.06em]">
          {item?.material?.kind === 'text' ? (
            <>
              <ShieldCheck size={16} weight="fill" className="text-ocean" />
              Document Evidence
            </>
          ) : (
            <>
              <Sparkle size={16} weight="fill" className="text-coral" />
              Visual Evidence Snapshot
            </>
          )}
        </span>
        <button
          type="button"
          onClick={toggleZoom}
          className="press-sm flex items-center gap-1 rounded-[6px] border border-ink bg-white px-2 py-0.5 text-[11px] font-bold text-ink shadow-hard-sm"
          aria-label="Toggle clue inspection magnifier"
        >
          <MagnifyingGlassPlus size={14} weight="bold" />
          <span>{zoomed ? 'Standard View' : 'Inspect Detail'}</span>
        </button>
      </div>

      {/* Clue Graphic Area */}
      <div className={`relative flex items-center justify-center p-3 sm:p-4 transition-all duration-300 ${zoomed ? 'bg-amber-50/50 scale-105' : 'bg-paper'}`}>
        
        {/* Market Sign Glitch */}
        {id === 'render-market-01' && (
          <div className="flex w-full max-w-sm flex-col items-center gap-2">
            <div className="relative flex w-full flex-col items-center rounded-[12px] border-2 border-ink bg-amber-100 p-3 shadow-hard-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Fresh Produce Market · Stall 14</div>
              {/* Garbled Sign Board */}
              <div className={`relative mt-2 rounded-[8px] border-2 border-ink bg-amber-700 px-4 py-2 text-center text-amber-100 shadow-inner ${zoomed ? 'ring-4 ring-coral ring-offset-2' : ''}`}>
                <span className="font-mono text-xl sm:text-2xl font-black tracking-widest text-amber-200 select-none">
                  Ж§⟁∯ ꙰꙱ℵ ƍ∿
                </span>
                {zoomed && (
                  <div className="absolute -top-3 -right-2 rounded-full border-2 border-ink bg-coral px-1.5 py-0.5 text-[9px] font-bold text-white shadow-hard-sm">
                    Garbled Glyph
                  </div>
                )}
              </div>
              <div className="mt-2 flex gap-4 text-xs font-semibold text-amber-950">
                <span>🍎 Organic Apples</span>
                <span>🥖 Fresh Loaves</span>
              </div>
            </div>
          </div>
        )}

        {/* Council Notice with Reference Number */}
        {id === 'render-notice-02' && (
          <div className="flex w-full max-w-md flex-col rounded-[12px] border-2 border-ink bg-white p-3 shadow-hard-sm text-left">
            <div className="flex items-center justify-between border-b border-ink/20 pb-1.5">
              <div className="font-display text-xs font-bold uppercase tracking-wider text-ocean">
                Metro City District Council
              </div>
              <span className="rounded border border-ink bg-cream px-1.5 py-0.5 font-mono text-[10px] font-bold text-ink">
                REF #CC-2026-88B
              </span>
            </div>
            <div className="mt-2 font-body text-xs font-medium text-ink/90">
              <p className="font-bold text-ink">Public Notice: Road Maintenance & Cycle Lane Extension</p>
              <p className="mt-1 text-[11px] text-ink/75">Published: 14 May 2026 · Infrastructure Planning Division</p>
              <p className="mt-1 text-[11px] text-ink/75">Enquiries: info@metrocity.gov / (02) 8800-4411</p>
            </div>
            {zoomed && (
              <div className="mt-2 inline-flex items-center gap-1 rounded-[6px] border border-lime-700 bg-lime/20 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                <ShieldCheck size={14} weight="fill" className="text-emerald-700" />
                <span>Verifiable reference number, date, and contact department</span>
              </div>
            )}
          </div>
        )}

        {/* Station Crowd Repeating Scarf Pattern */}
        {id === 'render-station-03' && (
          <div className="flex w-full max-w-sm flex-col items-center gap-2">
            <div className="relative flex w-full flex-col rounded-[12px] border-2 border-ink bg-slate-100 p-3 shadow-hard-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Morning Metro Commute · Platform 3</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[1, 2, 3].map((personIndex) => (
                  <div key={personIndex} className={`flex flex-col items-center rounded-[8px] border-2 border-ink bg-white p-2 text-center ${zoomed ? 'ring-2 ring-coral' : ''}`}>
                    <div className="h-7 w-7 rounded-full border-2 border-ink bg-amber-200 text-center font-display text-[10px] font-bold leading-6">
                      P{personIndex}
                    </div>
                    {/* Exact identical synthetic zigzag scarf */}
                    <div className="mt-1.5 w-full rounded border border-ink bg-gradient-to-r from-coral via-sunshine to-ocean py-0.5 text-[9px] font-black tracking-tighter text-white">
                      ▲▼▲▼▲
                    </div>
                  </div>
                ))}
              </div>
              {zoomed && (
                <div className="mt-2 inline-flex items-center justify-center gap-1 rounded-[6px] border border-coral bg-coral/10 px-2 py-0.5 text-[10px] font-bold text-coral">
                  <WarningCircle size={14} weight="fill" />
                  <span>Identical scarf pattern cloned across unrelated commuters</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Anatomy Glitch: 6 Fingers & Merging Jewelry */}
        {id === 'render-portrait-04' && (
          <div className="flex w-full max-w-sm flex-col items-center gap-2">
            <div className="relative flex w-full flex-col items-center rounded-[12px] border-2 border-ink bg-orange-50 p-3 shadow-hard-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-orange-800">Studio Portrait Close-up</div>
              <div className="mt-2 flex items-center justify-center gap-4">
                <div className="relative flex h-20 w-28 items-center justify-center rounded-[10px] border-2 border-ink bg-amber-100 p-2 shadow-inner">
                  {/* Hand representation with 6 distinct finger pegs */}
                  <div className="flex items-end gap-1">
                    {[1, 2, 3, 4, 5, 6].map((finger) => (
                      <div
                        key={finger}
                        className={`w-2.5 rounded-t-full border border-ink bg-amber-200 ${finger === 6 ? 'h-9 bg-coral/30' : 'h-8'}`}
                        title={`Finger ${finger}`}
                      />
                    ))}
                  </div>
                  {/* Melted bracelet artifact */}
                  <div className="absolute -bottom-1 h-3 w-16 rounded border-2 border-ink bg-gradient-to-r from-sunshine via-amber-200 to-transparent" />
                </div>
              </div>
              {zoomed && (
                <div className="mt-2 inline-flex items-center justify-center gap-1 rounded-[6px] border border-coral bg-coral/10 px-2 py-0.5 text-[10px] font-bold text-coral">
                  <WarningCircle size={14} weight="fill" />
                  <span>6 fingers detected + bracelet gradient melts directly into skin</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Verified Dataset Report */}
        {id === 'render-report-05' && (
          <div className="flex w-full max-w-md flex-col rounded-[12px] border-2 border-ink bg-white p-3 shadow-hard-sm text-left">
            <div className="flex items-center justify-between border-b border-ink/20 pb-1.5">
              <div className="font-display text-xs font-bold uppercase tracking-wider text-ocean">
                Journal of Urban Analytics · Vol 12
              </div>
              <span className="rounded border border-ink bg-cream px-1.5 py-0.5 font-mono text-[10px] font-bold text-ink">
                DOI: 10.1042/urb.2026
              </span>
            </div>
            <div className="mt-2 space-y-1 font-mono text-[11px] text-ink">
              <div className="flex justify-between border-b border-ink/10 pb-0.5 font-bold">
                <span>Sample (n=2,480)</span>
                <span>Variance: ±1.8%</span>
              </div>
              <p className="font-body text-[11px] text-ink/80 pt-1">
                Data Source: Open Transit API (Jan–Mar 2026). Limitation: Excludes holiday weekends.
              </p>
            </div>
            {zoomed && (
              <div className="mt-2 inline-flex items-center gap-1 rounded-[6px] border border-lime-700 bg-lime/20 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                <ShieldCheck size={14} weight="fill" className="text-emerald-700" />
                <span>Includes dataset link, sample size, and explicitly declared study limitations</span>
              </div>
            )}
          </div>
        )}

        {/* Fallback for other items */}
        {!['render-market-01', 'render-notice-02', 'render-station-03', 'render-portrait-04', 'render-report-05'].includes(id) && (
          <div className="p-3 text-center font-body text-xs font-medium text-ink/75">
            {item?.material?.prompt}
          </div>
        )}

      </div>
    </div>
  )
}
