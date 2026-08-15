import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { getCountdownFrame } from './countdownClock.js'

export function CountdownBar({
  endTimestamp,
  clockOffset = 0,
  startTimestamp,
  className,
  onComplete,
  onSecondChange,
  label = 'Time remaining',
}) {
  const fillRef = useRef(null)
  const completedRef = useRef(false)
  const [seconds, setSeconds] = useState(() => getCountdownFrame({ endTimestamp, startTimestamp, clockOffset }).seconds)

  useEffect(() => {
    completedRef.current = false
    let frameId
    let lastSecond = null

    const update = () => {
      const { remaining, seconds: nextSecond, progress } = getCountdownFrame({ endTimestamp, startTimestamp, clockOffset })

      if (fillRef.current) fillRef.current.style.transform = `scaleX(${progress})`
      if (nextSecond !== lastSecond) {
        lastSecond = nextSecond
        setSeconds(nextSecond)
        onSecondChange?.(nextSecond)
      }

      if (remaining <= 0) {
        if (!completedRef.current) {
          completedRef.current = true
          onComplete?.()
        }
        return
      }

      frameId = requestAnimationFrame(update)
    }

    update()
    return () => cancelAnimationFrame(frameId)
  }, [clockOffset, endTimestamp, onComplete, onSecondChange, startTimestamp])

  return (
    <div className={clsx('w-full', className)} aria-label={`${label}: ${seconds} seconds`} role="timer">
      <div className="relative h-10 overflow-hidden rounded-full border-chunky border-ink bg-paper host:h-14">
        <div ref={fillRef} className="h-full origin-left bg-coral motion-reduce:transition-none" />
        <span className="pointer-events-none absolute inset-y-0 right-5 flex items-center font-display text-xl font-bold tabular-nums text-ink host:text-4xl">
          {seconds}s
        </span>
      </div>
    </div>
  )
}
