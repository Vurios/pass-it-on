import { useEffect, useMemo, useRef, useState } from 'react'
import { DownloadSimple, Repeat } from '@phosphor-icons/react'
import { toPng } from 'html-to-image'
import { BigButton } from './BigButton.jsx'
import { CarnivalTent } from './CarnivalTent.jsx'
import { ErrorState } from './ErrorState.jsx'

const EXPORT_WIDTH = 1080

export function RecapCard({ state, onBack, onPlayAgain, onBonus }) {
  const frameRef = useRef(null)
  const cardRef = useRef(null)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')
  const [preview, setPreview] = useState({ scale: 1, height: 0 })
  const techniques = useMemo(() => {
    const seen = new Set()
    return state.encountered.filter((entry) => {
      const key = `${entry.technique}|${entry.explanation}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [state.encountered])

  /* The card is composed once at export width so the PNG is identical whether
     it was made on a phone or a 1080p host, then scaled down for the preview. */
  useEffect(() => {
    const frame = frameRef.current
    const card = cardRef.current
    if (!frame || !card) return undefined

    const measure = () => {
      const scale = Math.min(1, frame.clientWidth / EXPORT_WIDTH)
      setPreview({ scale, height: card.offsetHeight * scale })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(frame)
    observer.observe(card)
    return () => observer.disconnect()
  }, [techniques])

  const download = async () => {
    if (!cardRef.current || exporting) return
    setExporting(true)
    setExportError('')
    try {
      const dataUrl = await toPng(cardRef.current, {
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
    return <ErrorState host message={exportError} actionLabel="Back to recap" onAction={() => setExportError('')} />
  }

  return (
    <main className="host-screen dot-grid screen-min-h bg-cream px-4 py-8 text-ink sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 grid gap-5 sm:grid-cols-3">
          <BigButton variant="ocean" onClick={download} disabled={exporting} className="gap-3 host:text-4xl">
            <DownloadSimple size={28} weight="bold" aria-hidden="true" />
            {exporting ? 'Making PNG...' : 'Download PNG'}
          </BigButton>
          <BigButton variant="sunshine" className="host:text-4xl" onClick={onBack}>Back to scores</BigButton>
          <BigButton variant="coral" className="host:text-4xl" onClick={onPlayAgain}>Play again</BigButton>
        </div>

        {onBonus && (
          <div className="mb-8 rounded-[18px] border-chunky border-ink bg-paper p-6 shadow-hard sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div className="min-w-0 flex-1">
                <h2 className="safe-copy font-display text-3xl font-bold host:text-6xl">One more round?</h2>
                <p className="safe-copy mt-2 font-body text-lg font-semibold host:text-5xl">
                  Chain of Custody is a bonus. One claim, four retellings, put them back in order. About a minute.
                </p>
              </div>
              <BigButton variant="lime" className="gap-3 sm:w-auto host:text-5xl" onClick={onBonus}>
                <Repeat size={28} weight="bold" aria-hidden="true" />
                Play the bonus round
              </BigButton>
            </div>
          </div>
        )}

        <div ref={frameRef} className="overflow-hidden" style={{ height: preview.height || undefined }}>
          <div style={{ width: EXPORT_WIDTH, transform: `scale(${preview.scale})`, transformOrigin: 'top left' }}>
            <div ref={cardRef} className="recap-export bg-cream p-12 text-ink">
              <div className="rounded-[22px] border-chunky border-ink bg-paper p-10 shadow-hard">
                <div className="flex items-center gap-6 border-b-chunky border-ink pb-7">
                  <CarnivalTent className="w-24 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-display text-[22px] font-bold uppercase tracking-[0.14em]">Pass It On</p>
                    <h1 className="safe-copy font-display text-[64px] font-bold leading-[1.02]">What your room learned</h1>
                  </div>
                </div>
                <div className="mt-9 grid grid-cols-2 gap-7">
                  {techniques.map((entry, index) => (
                    <div
                      key={`${entry.technique}-${index}`}
                      className={`${index % 2 ? '-rotate-1' : 'rotate-1'} rounded-[18px] border-chunky border-ink bg-cream p-7 shadow-hard`}
                    >
                      <span className="inline-flex items-center border-chunky border-ink bg-sunshine px-3 py-1 font-display text-[18px] font-bold uppercase tracking-[0.08em]">
                        Technique {index + 1}
                      </span>
                      <h2 className="safe-copy mt-4 font-display text-[34px] font-bold leading-tight">{entry.technique}</h2>
                      <p className="safe-copy mt-3 font-body text-[24px] font-medium leading-[1.45]">{entry.explanation}</p>
                      {entry.fabricated && (
                        <span className="mt-5 inline-flex -rotate-2 items-center border-chunky border-ink bg-paper px-3 py-1 font-display text-[17px] font-bold uppercase tracking-[0.08em] shadow-hard-sm">
                          Fabricated teaching example
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="mt-9 border-t-chunky border-ink pt-6 font-body text-[22px] font-bold">
                  Every headline in this game was written by the team as a teaching example. None of them are real news.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}
