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
      <div className="flex items-center justify-between border-b-2 border-ink bg-cream px-3.5 py-2 font-display text-xs font-bold text-ink host:px-5 host:py-3 host:text-lg">
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
          className="press-sm flex items-center gap-1 rounded-[6px] border border-ink bg-white px-2.5 py-1 text-xs sm:text-sm host:text-base font-bold text-ink shadow-hard-sm host:px-4 host:py-1.5 host:text-sm"
          aria-label="Toggle clue inspection magnifier"
        >
          <MagnifyingGlassPlus size={14} weight="bold" />
          <span>{zoomed ? 'Standard View' : 'Inspect Detail'}</span>
        </button>
      </div>

      {/* Clue Graphic Area */}
      <div className={`relative flex items-center justify-center p-3.5 sm:p-5 host:p-7 transition-all duration-300 ${zoomed ? 'bg-amber-50/50 scale-105' : 'bg-paper'}`}>
        
        {/* 1. Market Sign Glitch */}
        {id === 'render-market-01' && (
          <div className="flex w-full max-w-md sm:max-w-xl host:max-w-2xl sm:max-w-lg host:max-w-2xl flex-col items-center gap-2">
            <div className="relative flex w-full flex-col items-center rounded-[12px] border-2 border-ink bg-amber-100 p-3 shadow-hard-sm">
              <div className="text-xs sm:text-sm host:text-base sm:text-xs host:text-base font-bold uppercase tracking-wider text-amber-800">Fresh Produce Market · Stall 14</div>
              <div className={`relative mt-2 rounded-[8px] border-2 border-ink bg-amber-700 px-4 py-2 text-center text-amber-100 shadow-inner ${zoomed ? 'ring-4 ring-coral ring-offset-2' : ''}`}>
                <span className="font-mono text-xl sm:text-2xl font-black tracking-widest text-amber-200 select-none">
                  Ж§⟁∯ ꙰꙱ℵ ƍ∿
                </span>
                {zoomed && (
                  <div className="absolute -top-3 -right-2 rounded-full border-2 border-ink bg-coral px-1.5 py-0.5 text-[10px] sm:text-xs host:text-sm font-bold text-white shadow-hard-sm">
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

        {/* 2. Council Notice with Reference Number */}
        {id === 'render-notice-02' && (
          <div className="flex w-full max-w-md sm:max-w-xl host:max-w-2xl flex-col rounded-[12px] border-2 border-ink bg-white p-3 shadow-hard-sm text-left">
            <div className="flex items-center justify-between border-b border-ink/20 pb-1.5">
              <div className="font-display text-xs font-bold uppercase tracking-wider text-ocean">
                Metro City District Council
              </div>
              <span className="rounded border border-ink bg-cream px-1.5 py-0.5 font-mono text-xs sm:text-sm host:text-base sm:text-xs host:text-base font-bold text-ink">
                REF #CC-2026-88B
              </span>
            </div>
            <div className="mt-2 font-body text-xs font-medium text-ink/90">
              <p className="font-bold text-ink">Public Notice: Road Maintenance & Cycle Lane Extension</p>
              <p className="mt-1 text-xs sm:text-sm host:text-base text-ink/75">Published: 14 May 2026 · Infrastructure Planning Division</p>
              <p className="mt-1 text-xs sm:text-sm host:text-base text-ink/75">Enquiries: info@metrocity.gov / (02) 8800-4411</p>
            </div>
            {zoomed && (
              <div className="mt-2 inline-flex items-center gap-1 rounded-[6px] border border-lime-700 bg-lime/20 px-2 py-0.5 text-xs sm:text-sm host:text-base sm:text-xs host:text-base font-bold text-emerald-900">
                <ShieldCheck size={14} weight="fill" className="text-emerald-700" />
                <span>Verifiable reference number, date, and contact department</span>
              </div>
            )}
          </div>
        )}

        {/* 3. Station Crowd Repeating Scarf Pattern */}
        {id === 'render-station-03' && (
          <div className="flex w-full max-w-md sm:max-w-xl host:max-w-2xl sm:max-w-lg host:max-w-2xl flex-col items-center gap-2">
            <div className="relative flex w-full flex-col rounded-[12px] border-2 border-ink bg-slate-100 p-3 shadow-hard-sm">
              <div className="text-xs sm:text-sm host:text-base sm:text-xs host:text-base font-bold uppercase tracking-wider text-slate-600">Morning Metro Commute · Platform 3</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[1, 2, 3].map((personIndex) => (
                  <div key={personIndex} className={`flex flex-col items-center rounded-[8px] border-2 border-ink bg-white p-2 text-center ${zoomed ? 'ring-2 ring-coral' : ''}`}>
                    <div className="h-7 w-7 rounded-full border-2 border-ink bg-amber-200 text-center font-display text-xs sm:text-sm host:text-base sm:text-xs host:text-base font-bold leading-6">
                      P{personIndex}
                    </div>
                    <div className="mt-1.5 w-full rounded border border-ink bg-gradient-to-r from-coral via-sunshine to-ocean py-0.5 text-[10px] sm:text-xs host:text-sm font-black tracking-tighter text-white">
                      ▲▼▲▼▲
                    </div>
                  </div>
                ))}
              </div>
              {zoomed && (
                <div className="mt-2 inline-flex items-center justify-center gap-1 rounded-[6px] border border-coral bg-coral/10 px-2 py-0.5 text-xs sm:text-sm host:text-base sm:text-xs host:text-base font-bold text-coral">
                  <WarningCircle size={14} weight="fill" />
                  <span>Identical scarf pattern cloned across unrelated commuters</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. Anatomy Glitch: 6 Fingers & Merging Jewelry */}
        {id === 'render-portrait-04' && (
          <div className="flex w-full max-w-md sm:max-w-xl host:max-w-2xl sm:max-w-lg host:max-w-2xl flex-col items-center gap-2">
            <div className="relative flex w-full flex-col items-center rounded-[12px] border-2 border-ink bg-orange-50 p-3 shadow-hard-sm">
              <div className="text-xs sm:text-sm host:text-base sm:text-xs host:text-base font-bold uppercase tracking-wider text-orange-800">Studio Portrait Close-up</div>
              <div className="mt-2 flex items-center justify-center gap-4">
                <div className="relative flex h-24 w-32 sm:h-28 sm:w-40 host:h-36 host:w-52 items-center justify-center rounded-[10px] border-2 border-ink bg-amber-100 p-2 shadow-inner">
                  <div className="flex items-end gap-1">
                    {[1, 2, 3, 4, 5, 6].map((finger) => (
                      <div
                        key={finger}
                        className={`w-2.5 rounded-t-full border border-ink bg-amber-200 ${finger === 6 ? 'h-9 bg-coral/30' : 'h-8'}`}
                        title={`Finger ${finger}`}
                      />
                    ))}
                  </div>
                  <div className="absolute -bottom-1 h-3 w-16 rounded border-2 border-ink bg-gradient-to-r from-sunshine via-amber-200 to-transparent" />
                </div>
              </div>
              {zoomed && (
                <div className="mt-2 inline-flex items-center justify-center gap-1 rounded-[6px] border border-coral bg-coral/10 px-2 py-0.5 text-xs sm:text-sm host:text-base sm:text-xs host:text-base font-bold text-coral">
                  <WarningCircle size={14} weight="fill" />
                  <span>6 fingers detected + bracelet gradient melts directly into skin</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. Verified Dataset Report */}
        {id === 'render-report-05' && (
          <div className="flex w-full max-w-md sm:max-w-xl host:max-w-2xl flex-col rounded-[12px] border-2 border-ink bg-white p-3 shadow-hard-sm text-left">
            <div className="flex items-center justify-between border-b border-ink/20 pb-1.5">
              <div className="font-display text-xs font-bold uppercase tracking-wider text-ocean">
                Journal of Urban Analytics · Vol 12
              </div>
              <span className="rounded border border-ink bg-cream px-1.5 py-0.5 font-mono text-xs sm:text-sm host:text-base sm:text-xs host:text-base font-bold text-ink">
                DOI: 10.1042/urb.2026
              </span>
            </div>
            <div className="mt-2 space-y-1 font-mono text-xs sm:text-sm host:text-base text-ink">
              <div className="flex justify-between border-b border-ink/10 pb-0.5 font-bold">
                <span>Sample (n=2,480)</span>
                <span>Variance: ±1.8%</span>
              </div>
              <p className="font-body text-xs sm:text-sm host:text-base text-ink/80 pt-1">
                Data Source: Open Transit API (Jan–Mar 2026). Limitation: Excludes holiday weekends.
              </p>
            </div>
            {zoomed && (
              <div className="mt-2 inline-flex items-center gap-1 rounded-[6px] border border-lime-700 bg-lime/20 px-2 py-0.5 text-xs sm:text-sm host:text-base sm:text-xs host:text-base font-bold text-emerald-900">
                <ShieldCheck size={14} weight="fill" className="text-emerald-700" />
                <span>Includes dataset link, sample size, and explicitly declared study limitations</span>
              </div>
            )}
          </div>
        )}

        {/* 6. Academic Press Release */}
        {id === 'render-press-06' && (
          <div className="flex w-full max-w-md sm:max-w-xl host:max-w-2xl flex-col rounded-[12px] border-2 border-ink bg-white p-3 shadow-hard-sm text-left">
            <div className="flex items-center justify-between border-b border-ink/20 pb-1.5">
              <div className="font-display text-xs font-bold uppercase tracking-wider text-ocean">
                Stanford Materials Lab · Press Release
              </div>
              <span className="rounded border border-ink bg-cream px-1.5 py-0.5 font-mono text-xs sm:text-sm host:text-base sm:text-xs host:text-base font-bold text-ink">
                GRANT #NSF-4819
              </span>
            </div>
            <div className="mt-2 font-body text-xs font-medium text-ink/90">
              <p className="font-bold text-ink">Lead Authors: Dr. Elena Vance & Prof. Marcus Chen</p>
              <p className="mt-1 text-xs sm:text-sm host:text-base text-ink/75">Published in Nature Materials (Vol 31, pp. 104-118)</p>
              <p className="mt-1 text-xs sm:text-sm host:text-base text-ink/75">Funding: National Science Foundation / Open Data Repository</p>
            </div>
            {zoomed && (
              <div className="mt-2 inline-flex items-center gap-1 rounded-[6px] border border-lime-700 bg-lime/20 px-2 py-0.5 text-xs sm:text-sm host:text-base sm:text-xs host:text-base font-bold text-emerald-900">
                <ShieldCheck size={14} weight="fill" className="text-emerald-700" />
                <span>Named researchers, specific volume citation, and verified funding grant</span>
              </div>
            )}
          </div>
        )}

        {/* 7. Scrambled Clock Tower Dial */}
        {id === 'render-clock-07' && (
          <div className="flex w-full max-w-md sm:max-w-xl host:max-w-2xl sm:max-w-lg host:max-w-2xl flex-col items-center gap-2">
            <div className="relative flex w-full flex-col items-center rounded-[12px] border-2 border-ink bg-slate-100 p-3 shadow-hard-sm">
              <div className="text-xs sm:text-sm host:text-base sm:text-xs host:text-base font-bold uppercase tracking-wider text-slate-700">Town Square Clock Tower</div>
              <div className={`relative mt-2 grid h-28 w-28 sm:h-32 sm:w-32 host:h-44 host:w-44 place-items-center rounded-full border-4 border-ink bg-amber-100 shadow-inner ${zoomed ? 'ring-4 ring-coral' : ''}`}>
                <div className="grid grid-cols-3 gap-1 font-mono text-xs sm:text-sm host:text-base sm:text-xs host:text-base font-black text-amber-950">
                  <span>1</span><span>14</span><span>3</span>
                  <span>15</span><span>⏱</span><span>9</span>
                  <span>2</span><span>8</span><span>7</span>
                </div>
              </div>
              {zoomed && (
                <div className="mt-2 inline-flex items-center justify-center gap-1 rounded-[6px] border border-coral bg-coral/10 px-2 py-0.5 text-xs sm:text-sm host:text-base sm:text-xs host:text-base font-bold text-coral">
                  <WarningCircle size={14} weight="fill" />
                  <span>Clock dial numbers 14 and 15 scrambled out of order</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 8. Verified Register Receipt */}
        {id === 'render-receipt-08' && (
          <div className="flex w-full max-w-xs flex-col rounded-[12px] border-2 border-ink bg-white p-3 font-mono text-xs shadow-hard-sm text-left">
            <div className="border-b border-dashed border-ink pb-1 text-center font-bold">
              VALLEY MARKET #104
            </div>
            <div className="mt-1.5 space-y-0.5 text-xs sm:text-sm host:text-base">
              <div className="flex justify-between"><span>OAT MILK 1L</span><span>$4.50</span></div>
              <div className="flex justify-between"><span>SOURDOUGH</span><span>$3.20</span></div>
              <div className="flex justify-between"><span>OLIVE OIL</span><span>$12.00</span></div>
              <div className="border-t border-ink pt-1 flex justify-between font-bold"><span>SUBTOTAL</span><span>$19.70</span></div>
              <div className="flex justify-between text-ink/75"><span>TAX 6%</span><span>$1.18</span></div>
              <div className="flex justify-between font-bold text-ocean"><span>TOTAL</span><span>$20.88</span></div>
            </div>
            <div className="mt-1.5 text-xs sm:text-sm host:text-base sm:text-xs host:text-base text-ink/60 text-center">CASHIER #44 · 12:44 PM</div>
            {zoomed && (
              <div className="mt-2 inline-flex items-center gap-1 rounded-[6px] border border-lime-700 bg-lime/20 px-2 py-0.5 text-xs sm:text-sm host:text-base sm:text-xs host:text-base font-bold text-emerald-900">
                <ShieldCheck size={14} weight="fill" className="text-emerald-700" />
                <span>Exact 6% tax arithmetic and POS cashier metadata audit trail</span>
              </div>
            )}
          </div>
        )}

        {/* 9. Inconsistent Reflection Physics */}
        {id === 'render-reflection-09' && (
          <div className="flex w-full max-w-md sm:max-w-xl host:max-w-2xl sm:max-w-lg host:max-w-2xl flex-col items-center gap-2">
            <div className="relative flex w-full flex-col items-center rounded-[12px] border-2 border-ink bg-slate-200 p-3 shadow-hard-sm">
              <div className="text-xs sm:text-sm host:text-base sm:text-xs host:text-base font-bold uppercase tracking-wider text-slate-700">Urban Street Puddle Reflection</div>
              <div className="mt-2 flex w-full justify-around gap-2">
                <div className="flex flex-col items-center rounded border border-ink bg-white p-2 text-xs sm:text-sm host:text-base sm:text-xs host:text-base font-bold">
                  <span>🏢 Building</span>
                  <div className="h-10 w-8 border border-ink bg-blue-100 mt-1" />
                </div>
                <div className={`flex flex-col items-center rounded border border-ink bg-blue-200 p-2 text-xs sm:text-sm host:text-base sm:text-xs host:text-base font-bold ${zoomed ? 'ring-2 ring-coral' : ''}`}>
                  <span>💧 Reflection</span>
                  <div className="h-10 w-8 border border-ink bg-amber-800 text-white mt-1 text-center leading-10">⛪</div>
                </div>
              </div>
              {zoomed && (
                <div className="mt-2 inline-flex items-center justify-center gap-1 rounded-[6px] border border-coral bg-coral/10 px-2 py-0.5 text-xs sm:text-sm host:text-base sm:text-xs host:text-base font-bold text-coral">
                  <WarningCircle size={14} weight="fill" />
                  <span>Glass office tower reflects as a Gothic church spire</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 10. Meteorological Scientific Radar */}
        {id === 'render-weather-10' && (
          <div className="flex w-full max-w-md sm:max-w-xl host:max-w-2xl flex-col rounded-[12px] border-2 border-ink bg-white p-3 shadow-hard-sm text-left">
            <div className="flex items-center justify-between border-b border-ink/20 pb-1.5">
              <div className="font-display text-xs font-bold uppercase tracking-wider text-ocean">
                National Weather Service · Doppler Radar
              </div>
              <span className="rounded border border-ink bg-cream px-1.5 py-0.5 font-mono text-xs sm:text-sm host:text-base sm:text-xs host:text-base font-bold text-ink">
                BUOY #41002
              </span>
            </div>
            <div className="mt-2 space-y-1 font-mono text-xs sm:text-sm host:text-base text-ink">
              <div className="flex justify-between border-b border-ink/10 pb-0.5 font-bold">
                <span>Barometric: 1016.4 hPa</span>
                <span>UTC: 14:30Z</span>
              </div>
              <p className="font-body text-xs sm:text-sm host:text-base text-ink/80 pt-1">
                Radar Beam Elev: 0.5° · Dual-Polarization Refl (Z_DR = 1.2 dB)
              </p>
            </div>
            {zoomed && (
              <div className="mt-2 inline-flex items-center gap-1 rounded-[6px] border border-lime-700 bg-lime/20 px-2 py-0.5 text-xs sm:text-sm host:text-base sm:text-xs host:text-base font-bold text-emerald-900">
                <ShieldCheck size={14} weight="fill" className="text-emerald-700" />
                <span>Standardized scientific coordinate notation, buoy ID, and UTC timestamp</span>
              </div>
            )}
          </div>
        )}

        {/* 11. Floating Ring & Two Thumbs */}
        {id === 'render-hands-11' && (
          <div className="flex w-full max-w-md sm:max-w-xl host:max-w-2xl sm:max-w-lg host:max-w-2xl flex-col items-center gap-2">
            <div className="relative flex w-full flex-col items-center rounded-[12px] border-2 border-ink bg-orange-50 p-3 shadow-hard-sm">
              <div className="text-xs sm:text-sm host:text-base sm:text-xs host:text-base font-bold uppercase tracking-wider text-orange-800">Ceremony Photo Macro</div>
              <div className="mt-2 flex items-center justify-center gap-3">
                <div className="relative flex h-20 w-32 sm:h-24 sm:w-36 host:h-32 host:w-48 items-center justify-center rounded border-2 border-ink bg-amber-100">
                  <div className="flex gap-1 items-end">
                    <span className="text-xs font-bold">👍👍</span>
                    <span className="text-xs">✋</span>
                  </div>
                  <div className={`absolute -top-3 h-4 w-4 rounded-full border-2 border-ink bg-sunshine ${zoomed ? 'ring-2 ring-coral' : ''}`} title="Floating Ring" />
                </div>
              </div>
              {zoomed && (
                <div className="mt-2 inline-flex items-center justify-center gap-1 rounded-[6px] border border-coral bg-coral/10 px-2 py-0.5 text-xs sm:text-sm host:text-base sm:text-xs host:text-base font-bold text-coral">
                  <WarningCircle size={14} weight="fill" />
                  <span>Two thumbs on left hand + wedding ring levitating in air</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 12. Museum Archival Accession Record */}
        {id === 'render-museum-12' && (
          <div className="flex w-full max-w-md sm:max-w-xl host:max-w-2xl flex-col rounded-[12px] border-2 border-ink bg-white p-3 shadow-hard-sm text-left">
            <div className="flex items-center justify-between border-b border-ink/20 pb-1.5">
              <div className="font-display text-xs font-bold uppercase tracking-wider text-ocean">
                National Gallery · Accession Catalog
              </div>
              <span className="rounded border border-ink bg-cream px-1.5 py-0.5 font-mono text-xs sm:text-sm host:text-base sm:text-xs host:text-base font-bold text-ink">
                CAT #MET-2026-1049
              </span>
            </div>
            <div className="mt-2 font-body text-xs font-medium text-ink/90">
              <p className="font-bold text-ink">Provenance: Gift of Evelyn Wright (1984)</p>
              <p className="mt-1 text-xs sm:text-sm host:text-base text-ink/75">Medium: Glazed Terracotta · Dimensions: 24.5 × 12.0 cm</p>
              <p className="mt-1 text-xs sm:text-sm host:text-base text-ink/75">Conservation: Restored 2004, Dept of Antiquities</p>
            </div>
            {zoomed && (
              <div className="mt-2 inline-flex items-center gap-1 rounded-[6px] border border-lime-700 bg-lime/20 px-2 py-0.5 text-xs sm:text-sm host:text-base sm:text-xs host:text-base font-bold text-emerald-900">
                <ShieldCheck size={14} weight="fill" className="text-emerald-700" />
                <span>Physical dimensions in cm, donor provenance history, and accession ID</span>
              </div>
            )}
          </div>
        )}

        {/* Fallback for other items */}
        {!['render-market-01', 'render-notice-02', 'render-station-03', 'render-portrait-04', 'render-report-05', 'render-press-06', 'render-clock-07', 'render-receipt-08', 'render-reflection-09', 'render-weather-10', 'render-hands-11', 'render-museum-12'].includes(id) && (
          <div className="p-3 text-center font-body text-xs font-medium text-ink/75">
            {item?.material?.prompt}
          </div>
        )}

      </div>
    </div>
  )
}
