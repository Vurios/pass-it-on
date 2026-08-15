import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { Check, Crown, Fire, Pause, Play, SkipForward, Stop, X } from '@phosphor-icons/react'
import confetti from 'canvas-confetti'
import { QRCodeSVG } from 'qrcode.react'
import { AvatarBadge } from '../components/AvatarBadge.jsx'
import { BigButton } from '../components/BigButton.jsx'
import { Card } from '../components/Card.jsx'
import { CountdownBar } from '../components/CountdownBar.jsx'
import { ErrorState } from '../components/ErrorState.jsx'
import { FabricatedStamp } from '../components/FabricatedStamp.jsx'
import { LoadingState } from '../components/LoadingState.jsx'
import { RecapCard } from '../components/RecapCard.jsx'
import { SoundToggle } from '../components/SoundToggle.jsx'
import { TopRail } from '../components/TopRail.jsx'
import { ReadAloudToggle } from '../components/ReadAloudToggle.jsx'
import { createGameSession } from '../content/gameSessions.js'
import { SOUND_CUES } from '../audio/soundSystem.js'
import { useSessionSound } from '../audio/useSessionSound.js'
import { useHostReadAloud } from '../audio/useHostReadAloud.js'
import { PHASES, assignPlayerTitles, createMultiplayerGameState, gameReducer } from '../game/gameReducer.js'
import { buildPublicSnapshot } from '../game/publicSnapshot.js'
import { createHostRoom } from '../realtime/transport.js'

const hostSession = createGameSession('en')
const sourceColours = ['!bg-ocean', '!bg-coral', '!bg-lime', '!bg-sunshine']
const staleAfterMs = 7_000
const revealPhases = new Set([PHASES.ODD_REVEAL, PHASES.SPIN_REVEAL, PHASES.RENDER_REVEAL, PHASES.CHAIN_REVEAL])
const questionPhases = new Set([PHASES.ODD_QUESTION, PHASES.SPIN_QUESTION, PHASES.RENDER_QUESTION, PHASES.CHAIN_QUESTION])

function ReactionBubbles({ reactions }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden" aria-live="polite" aria-label="Player reactions">
      {reactions.map((reaction) => (
        <div
          key={reaction.id}
          className="reaction-bubble absolute bottom-24 grid h-20 w-20 place-items-center rounded-full border-chunky border-ink bg-white text-5xl shadow-hard"
          style={{ left: `${reaction.left}%` }}
        >
          <span aria-label={reaction.label}>{reaction.emoji}</span>
        </div>
      ))}
    </div>
  )
}

function HostLobby({ roomCode, players, locale, onLocaleChange, onStart }) {
  const joinUrl = useMemo(() => `${window.location.origin}/player?room=${roomCode}`, [roomCode])
  const activeCount = players.filter((player) => player.connected).length
  const canStart = activeCount >= 3 && activeCount <= 8
  return (
    <main className="host-screen dot-grid screen-min-h bg-cream px-5 py-7 text-ink">
      <div className="game-screen mx-auto grid max-w-[1500px] gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="flex flex-col items-center justify-center text-center">
          <p className="font-display text-xl font-bold uppercase tracking-[0.08em] host:text-5xl">Join at this code</p>
          <h1 className="mt-2 font-display text-[clamp(5rem,13vw,11rem)] font-bold leading-none tracking-[0.12em]">{roomCode}</h1>
          <Card fill="white" tilt="left" className="mt-5 inline-block p-5">
            <QRCodeSVG value={joinUrl} size={220} bgColor="#FFFEFB" fgColor="#1A1A1A" level="M" marginSize={1} title={`Join room ${roomCode}`} />
          </Card>
          <p className="mt-5 max-w-3xl font-body text-xl font-semibold host:text-5xl">Scan with a phone. No account needed.</p>
          <div className="mt-6 grid w-full max-w-xl grid-cols-2 gap-4" aria-label="Game language">
            <BigButton className="host:text-5xl" variant={locale === 'en' ? 'sunshine' : 'ocean'} aria-pressed={locale === 'en'} onClick={() => onLocaleChange('en')}>English</BigButton>
            <BigButton className="host:text-5xl" variant={locale === 'fil' ? 'sunshine' : 'ocean'} aria-pressed={locale === 'fil'} onClick={() => onLocaleChange('fil')}>Filipino</BigButton>
          </div>
        </section>
        <Card fill="white" tilt="right" className="flex flex-col p-7 lg:min-h-[70dvh]">
          <h2 className="font-display text-4xl font-bold host:text-8xl">{activeCount} joined</h2>
          {players.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="font-display text-[clamp(4rem,9vw,9rem)] font-bold leading-none tracking-[0.12em]">{roomCode}</p>
              <p className="mt-5 font-body text-2xl font-semibold host:text-5xl">Your room is ready. First player gets the loudest welcome.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {players.map((player) => <LobbyTile key={player.id} player={player} />)}
            </div>
          )}
          <div className="mt-auto pt-8">
            <BigButton className="host:text-5xl" variant="coral" disabled={!canStart} onClick={onStart}>
              {activeCount < 3 ? 'Waiting for 3 players' : activeCount > 8 ? 'Room has more than 8 players' : 'Start Round 1'}
            </BigButton>
            <p className="mt-4 text-center font-body font-bold host:text-5xl">Three to eight players, phones in hand.</p>
          </div>
        </Card>
      </div>
    </main>
  )
}

function LobbyTile({ player }) {
  return (
    <div className={`${player.connected ? 'bg-white' : 'bg-paper opacity-45'} flex items-center gap-4 rounded-[16px] border-chunky border-ink p-3 shadow-hard-sm`}>
      <AvatarBadge avatar={player.avatar} size={38} />
      <p className="safe-copy min-w-0 flex-1 font-display text-xl font-bold host:text-5xl">{player.name}</p>
      {!player.connected && <span className="font-body text-sm font-bold host:text-3xl">Left</span>}
    </div>
  )
}

/*
 * One line rather than a tile per player: eight tiles at host reading sizes do
 * not fit a 1080p screen alongside the answer and the explanation, and each
 * phone already shows its own result.
 */
function RevealTally({ state, round, itemId }) {
  const active = state.players.filter((player) => player.connected)
  const caught = active.filter((player) => answerFor(player, round, itemId)?.correct)
  const streaks = state.players.filter((player) => {
    const recent = player.answers.filter((entry) => entry.round === 'render').slice(-3)
    return recent.length === 3 && recent.every((entry) => entry.correct)
  })
  return (
    <div className="mt-4 flex flex-wrap items-center gap-4 rounded-[16px] border-chunky border-ink bg-white px-5 py-2 shadow-hard-sm">
      <Check className="shrink-0" size={34} weight="bold" aria-hidden="true" />
      <p className="font-display text-2xl font-bold host:text-5xl">{caught.length} of {active.length} caught it</p>
      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-3">
        {caught.slice(0, 8).map((player) => (
          <span key={player.id} className="flex min-w-0 items-center gap-2">
            <AvatarBadge avatar={player.avatar} size={28} />
            <span className="max-w-40 truncate font-display text-xl font-bold host:max-w-72 host:text-5xl">{player.name}</span>
          </span>
        ))}
        {streaks.length > 0 && <Fire className="shrink-0" size={34} weight="fill" aria-label={`On a streak: ${streaks.map((player) => player.name).join(', ')}`} />}
      </div>
    </div>
  )
}

function HostFrame({ children, timer }) {
  return (
    <main className="host-screen dot-grid flex screen-min-h flex-col bg-cream px-5 pt-4 text-ink">
      <div className="game-screen host-frame mx-auto flex w-full max-w-[1800px] flex-1 flex-col">
        <div className="flex-1">{children}</div>
        {timer}
      </div>
    </main>
  )
}

function RoundHeader({ eyebrow, title, state, action }) {
  const active = state.players.filter((player) => player.connected)
  const answered = active.filter((player) => {
    if (state.phase === PHASES.ODD_QUESTION) return state.oddAnswers[player.id]
    if (state.phase === PHASES.SPIN_QUESTION) return state.spinAnswers[player.id]
    if (state.phase === PHASES.CHAIN_QUESTION) return state.chainAnswers?.[player.id]
    return state.renderAnswers[player.id]
  }).length
  return (
    <header className="border-b-chunky border-ink pb-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {eyebrow
          ? <p className="min-w-0 flex-1 font-display text-lg font-bold uppercase tracking-[0.08em] host:text-4xl">{eyebrow}</p>
          : <span className="flex-1" />}
        {questionPhases.has(state.phase) && (
          <div className="shrink-0 rounded-[14px] border-chunky border-ink bg-sunshine px-4 py-2 font-display text-2xl font-bold shadow-hard-sm host:text-4xl">
            {answered} of {active.length} locked
          </div>
        )}
        {action}
      </div>
      <h1 className="safe-copy mt-1 font-display text-5xl font-bold leading-[1.02] lg:text-7xl host:text-8xl">{title}</h1>
    </header>
  )
}

function HostQuestion({ state, onTimeExpired, onChainTimeExpired, onSecondChange }) {
  let body
  let header
  if (state.phase === PHASES.ODD_QUESTION) {
    const item = state.session.oddItem
    header = <RoundHeader eyebrow="Round 1: Odd Source Out" title={item.material.event} state={state} />
    body = (
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {item.material.sources.map((source, index) => (
          <Card key={source.id} fill="white" className={`${sourceColours[index]} min-h-44 p-6`} tilt={index % 2 ? 'right' : 'left'}>
            <p className="safe-copy font-display text-3xl font-bold host:text-5xl">{source.label}: {source.source}</p>
            <p className="safe-copy mt-4 font-display text-3xl font-semibold leading-tight host:text-5xl">{source.headline}</p>
          </Card>
        ))}
      </div>
    )
  } else if (state.phase === PHASES.SPIN_QUESTION) {
    const item = state.session.spinItem
    header = <RoundHeader eyebrow="Round 2: Spin Doctor" title="Spot the spin" state={state} />
    body = (
      <Card fill="white" tilt="left" className="mt-8 p-8">
        <p className="font-display text-3xl font-bold leading-relaxed lg:text-5xl host:text-7xl">
          {item.material.phrases.map((phrase, index) => (
            <span key={phrase} className="safe-copy m-2 inline-block max-w-full rounded-[14px] border-chunky border-ink bg-paper px-4 py-2 shadow-hard-sm">
              <span className="mr-2 text-coral">{index + 1}</span>{phrase}
            </span>
          ))}
        </p>
      </Card>
    )
  } else if (state.phase === PHASES.CHAIN_QUESTION) {
    const item = state.session.chainItem
    header = <RoundHeader eyebrow="Bonus: order these oldest first" title={item.material.claim} state={state} />
    body = (
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {item.material.retellings.map((retelling, index) => (
          <Card key={retelling.id} fill="white" className={`${sourceColours[index]} p-5`} tilt={index % 2 ? 'right' : 'left'}>
            <p className="safe-copy font-display text-3xl font-semibold leading-tight host:text-5xl">
              <span className="font-bold">{retelling.label}. </span>{retelling.text}
            </p>
          </Card>
        ))}
      </div>
    )
  } else {
    const item = state.session.renderItems[state.renderIndex]
    header = <RoundHeader eyebrow={`Round 3: Real or Rendered · ${state.renderIndex + 1}/${state.session.renderItems.length}`} title="Real or rendered?" state={state} />
    body = (
      <Card fill="white" tilt="right" className="mx-auto mt-6 max-w-7xl p-8 text-center">
        <p className="safe-copy font-display text-4xl font-bold leading-tight lg:text-6xl host:text-8xl">{item.material.prompt}</p>
      </Card>
    )
  }

  const timer = state.paused ? null : (
    <div className="countdown-dock">
      <CountdownBar
        key={`${state.phase}-${state.renderIndex}`}
        startTimestamp={state.phaseStartedAt}
        endTimestamp={state.timerEndsAt}
        clockOffset={0}
        onComplete={state.phase === PHASES.CHAIN_QUESTION ? onChainTimeExpired : onTimeExpired}
        onSecondChange={onSecondChange}
      />
    </div>
  )

  return <HostFrame timer={timer}>{header}{body}</HostFrame>
}

function answerFor(player, round, itemId) {
  return player.answers.findLast((answer) => answer.round === round && answer.itemId === itemId)
}

function HostReveal({ state, onNext, onEndBonus }) {
  let item
  let round
  let content
  if (state.phase === PHASES.ODD_REVEAL) {
    item = state.session.oddItem; round = 'odd'
    /* The named card stands alone; per Part 1.3 the other three fade back. */
    const winner = item.material.sources.find((source) => source.id === item.correctAnswer)
    const winnerIndex = item.material.sources.indexOf(winner)
    content = (
      <>
        <Card fill="white" className={`${sourceColours[winnerIndex]} mt-4 p-5 outline-8 outline-sunshine`} tilt="left">
          <p className="safe-copy font-display text-3xl font-bold host:text-5xl">{winner.label}: {winner.source}</p>
          <p className="safe-copy mt-3 font-display text-3xl font-semibold leading-tight host:text-5xl">{winner.headline}</p>
        </Card>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {item.material.sources.filter((source) => source.id !== item.correctAnswer).map((source, index) => (
            <div key={source.id} className={`${sourceColours[index >= winnerIndex ? index + 1 : index]} truncate rounded-[16px] border-chunky border-ink px-4 py-3 font-display text-xl font-bold opacity-45 shadow-hard-sm host:text-5xl`}>
              {source.label}: {source.source}
            </div>
          ))}
        </div>
      </>
    )
  } else if (state.phase === PHASES.SPIN_REVEAL) {
    item = state.session.spinItem; round = 'spin'
    content = (
      <Card fill="white" className="mt-4 p-5">
        <div className="flex flex-wrap gap-3">
          {item.material.phrases.map((phrase, index) => (
            <span key={phrase} className={`${item.correctAnswer.includes(index) ? 'bg-coral' : 'bg-paper opacity-55'} safe-copy max-w-full rounded-[14px] border-chunky border-ink px-4 py-3 font-display text-2xl font-bold host:text-5xl`}>
              {phrase}
            </span>
          ))}
        </div>
      </Card>
    )
  } else if (state.phase === PHASES.CHAIN_REVEAL) {
    item = state.session.chainItem; round = 'chain'
    const ordered = item.correctAnswer.map((id) => item.material.retellings.find((retelling) => retelling.id === id))
    content = (
      <ol className="mt-4 grid gap-3 lg:grid-cols-2 host:grid-cols-4">
        {ordered.map((retelling, index) => (
          <li key={retelling.id}>
            <Card fill="white" className={`${index === 0 ? '!bg-lime' : index === ordered.length - 1 ? '!bg-coral' : ''} p-4`} tilt={index % 2 ? 'right' : 'left'}>
              <p className="safe-copy font-display text-2xl font-bold leading-tight host:text-5xl">
                <span className="text-ink/55">{index + 1}. </span>{retelling.text}
              </p>
              <p className="safe-copy mt-2 font-body text-lg font-semibold leading-snug host:text-4xl">{retelling.note}</p>
            </Card>
          </li>
        ))}
      </ol>
    )
  } else {
    item = state.session.renderItems[state.renderIndex]; round = 'render'
    content = (
      <Card fill="white" className="mx-auto mt-6 max-w-7xl p-8 text-center">
        <p className="font-display text-5xl font-bold uppercase host:text-8xl">{item.correctAnswer}</p>
        <p className="safe-copy mt-4 font-body text-2xl font-semibold host:text-5xl">{item.material.prompt}</p>
      </Card>
    )
  }

  const action = state.phase === PHASES.CHAIN_REVEAL
    ? <BigButton variant="ocean" className="!w-auto shrink-0 host:text-4xl" onClick={onEndBonus}>Back to the scores</BigButton>
    : state.phase !== PHASES.RENDER_REVEAL
      ? <BigButton variant="sunshine" className="!w-auto shrink-0 host:text-4xl" onClick={onNext}>Next round</BigButton>
      : null

  return (
    <HostFrame>
      <RoundHeader eyebrow={null} title={item.technique} state={state} action={action} />
      {content}
      <Card fill="white" tilt="left" className="reveal-banner mt-4 p-4 host:flex host:flex-wrap host:items-center host:gap-4">
        <p className="safe-copy min-w-0 flex-1 font-body text-2xl font-semibold host:text-5xl">{item.explanation}</p>
        {item.fabricated && <FabricatedStamp className="mt-3 host:mt-0" />}
      </Card>
      {state.phase !== PHASES.CHAIN_REVEAL && <RevealTally state={state} round={round} itemId={item.id} />}
    </HostFrame>
  )
}

function HostControls({ state, dispatch }) {
  if (state.phase === PHASES.LOBBY || state.phase === PHASES.SCOREBOARD) return null
  const question = questionPhases.has(state.phase)
  const bonus = state.phase === PHASES.CHAIN_QUESTION || state.phase === PHASES.CHAIN_REVEAL
  const skip = () => dispatch(state.phase === PHASES.CHAIN_QUESTION
    ? { type: 'CHAIN_TIME_EXPIRED', now: Date.now() }
    : { type: 'SKIP_ROUND' })
  return (
    <div className="host-control fixed inset-x-0 bottom-0 z-40 flex items-center border-t-chunky border-ink bg-white px-3 py-2">
      <div className="mx-auto flex w-full max-w-5xl gap-3">
        <BigButton variant="ocean" className="!min-h-20 flex-1 gap-2 text-base" disabled={!question} onClick={() => dispatch({ type: state.paused ? 'RESUME_GAME' : 'PAUSE_GAME', now: Date.now() })}>
          {state.paused ? <Play size={22} weight="fill" /> : <Pause size={22} weight="fill" />}
          {state.paused ? 'Resume' : 'Pause'}
        </BigButton>
        <BigButton variant="sunshine" className="!min-h-20 flex-1 gap-2 text-base" disabled={!question} onClick={skip}>
          <SkipForward size={22} weight="fill" />
          {bonus ? 'Skip bonus' : 'Skip round'}
        </BigButton>
        <BigButton variant="coral" className="!min-h-20 flex-1 gap-2 text-base" onClick={() => dispatch({ type: 'END_EARLY' })}>
          <Stop size={22} weight="fill" />
          {bonus ? 'Back to scores' : 'End early'}
        </BigButton>
      </div>
    </div>
  )
}

function Scoreboard({ state, onRecap, onPlayAgain }) {
  const ranked = [...state.players].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
  const titles = assignPlayerTitles(state.players)
  const podium = [ranked[1], ranked[0], ranked[2]].filter(Boolean)
  const bonusPlayed = state.players.some((player) => (player.bonusScore ?? 0) > 0)
  return (
    <HostFrame>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b-chunky border-ink pb-4">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Crown className="shrink-0" size={56} weight="fill" />
          <h1 className="font-display text-5xl font-bold lg:text-7xl">Pass it on!</h1>
          <p className="font-display text-xl font-bold uppercase tracking-[0.08em] host:text-5xl">Final scoreboard</p>
        </div>
        <div className="flex shrink-0 gap-3">
          <BigButton variant="ocean" className="!w-auto host:text-4xl" onClick={onRecap}>Room recap</BigButton>
          <BigButton variant="coral" className="!w-auto host:text-4xl" onClick={onPlayAgain}>Play again</BigButton>
        </div>
      </header>
      <div className="mx-auto mt-5 flex max-w-7xl items-end justify-center gap-4">
        {podium.map((player) => {
          const place = ranked.indexOf(player) + 1
          return (
            <Card key={player.id} fill={place === 1 ? 'cream' : 'white'} className={`${place === 1 ? 'bg-sunshine py-5' : 'py-3'} flex w-1/3 flex-col items-center justify-center p-4 text-center`}>
              <span className="font-display text-4xl font-bold host:text-5xl">#{place}</span>
              <AvatarBadge avatar={player.avatar} size={44} />
              <h2 className="safe-copy mt-1 truncate font-display text-2xl font-bold host:text-5xl">{player.name}</h2>
              <p className="font-display text-3xl font-bold host:text-6xl">{player.score}</p>
            </Card>
          )
        })}
      </div>
      <div className="mx-auto mt-5 grid max-w-7xl gap-3 sm:grid-cols-2">
        {ranked.map((player, index) => (
          <div key={player.id} className={`${player.connected ? 'bg-white' : 'bg-paper opacity-50'} flex items-center gap-4 rounded-[16px] border-chunky border-ink px-4 py-2 shadow-hard-sm`}>
            <span className="font-display text-3xl font-bold host:text-5xl">{index + 1}</span>
            <AvatarBadge avatar={player.avatar} size={38} />
            <div className="flex min-w-0 flex-1 items-baseline gap-4">
              <p className="min-w-0 flex-1 truncate font-display text-xl font-bold host:text-5xl">{player.name}</p>
              <p className="min-w-0 shrink truncate font-body text-sm font-bold host:text-5xl">{titles[player.id]}</p>
            </div>
            {bonusPlayed && (player.bonusScore ?? 0) > 0 && (
              <span className="shrink-0 rounded-[10px] border-chunky border-ink bg-sunshine px-2 py-1 font-body text-sm font-bold host:text-3xl">
                +{player.bonusScore} bonus
              </span>
            )}
            <strong className="font-display text-3xl host:text-5xl">{player.score}</strong>
          </div>
        ))}
      </div>
    </HostFrame>
  )
}

export function HostScreen() {
  const sound = useSessionSound()
  const [state, dispatch] = useReducer(gameReducer, hostSession, createMultiplayerGameState)
  const readAloud = useHostReadAloud(state)
  const [connection, setConnection] = useState(null)
  const [roomCode, setRoomCode] = useState('')
  const [networkError, setNetworkError] = useState('')
  const [showRecap, setShowRecap] = useState(false)
  const [locale, setLocale] = useState('en')
  const [reactionBubbles, setReactionBubbles] = useState([])
  const sendQueue = useRef(Promise.resolve())
  const stateRef = useRef(state)
  const celebrationKey = useRef('')
  const knownPlayers = useRef(new Set())
  const reactionSequence = useRef(0)
  const reactionTimers = useRef(new Set())

  const showReaction = useCallback((message) => {
    const player = stateRef.current.players.find((entry) => entry.id === message.playerId && entry.connected)
    if (!player || !revealPhases.has(stateRef.current.phase)) return
    reactionSequence.current += 1
    const id = crypto.randomUUID()
    setReactionBubbles((current) => [...current, {
      id,
      emoji: message.reaction,
      label: `${player.name} reacted ${message.reaction}`,
      left: 8 + (reactionSequence.current % 6) * 15,
    }])
    const timer = window.setTimeout(() => {
      setReactionBubbles((current) => current.filter((reaction) => reaction.id !== id))
      reactionTimers.current.delete(timer)
    }, 2_000)
    reactionTimers.current.add(timer)
  }, [])

  useEffect(() => {
    let disposed = false; let roomConnection; let unsubscribe
    createHostRoom().then((created) => {
      if (disposed) { created.leave(); return }
      roomConnection = created
      unsubscribe = created.subscribe((message) => {
        const now = Date.now()
        if (message.type === 'hello') {
          if (!knownPlayers.current.has(message.playerId)) {
            knownPlayers.current.add(message.playerId)
            sound.play(SOUND_CUES.BLIP)
          }
          dispatch({ type: 'ADD_PLAYER', player: { id: message.playerId, name: message.name, avatar: message.avatar }, now })
        }
        if (message.type === 'answer' && message.round === 'odd') dispatch({ type: 'ANSWER_ODD_PLAYER', playerId: message.playerId, answerId: message.intent?.answerId, now })
        if (message.type === 'answer' && message.round === 'spin') dispatch({ type: 'ANSWER_SPIN_PLAYER', playerId: message.playerId, selections: message.intent?.selections ?? [], now })
        if (message.type === 'answer' && message.round === 'render') dispatch({ type: 'ANSWER_RENDER_PLAYER', playerId: message.playerId, answer: message.intent?.answer, now })
        if (message.type === 'answer' && message.round === 'chain') dispatch({ type: 'ANSWER_CHAIN_PLAYER', playerId: message.playerId, order: message.intent?.order ?? [], now })
        if (message.type === 'react') showReaction(message)
      })
      setRoomCode(created.roomCode); setConnection(created); sound.play(SOUND_CUES.BLIP)
    }).catch((error) => { if (!disposed) setNetworkError(error.message) })
    return () => { disposed = true; unsubscribe?.(); roomConnection?.leave() }
  }, [])

  useEffect(() => () => {
    for (const timer of reactionTimers.current) window.clearTimeout(timer)
    reactionTimers.current.clear()
  }, [])

  useEffect(() => { const timer = window.setInterval(() => dispatch({ type: 'MARK_STALE_PLAYERS', now: Date.now(), staleAfterMs }), 1_000); return () => window.clearInterval(timer) }, [])
  useEffect(() => { stateRef.current = state }, [state])
  useEffect(() => {
    if (!connection) return
    sendQueue.current = sendQueue.current.then(() => connection.send({ type: 'state', snapshot: buildPublicSnapshot(state) })).catch((error) => setNetworkError(error.message))
  }, [connection, state])
  useEffect(() => {
    if (!connection) return undefined
    const keepalive = window.setInterval(() => {
      sendQueue.current = sendQueue.current
        .then(() => connection.send({ type: 'state', snapshot: buildPublicSnapshot(stateRef.current) }))
        .catch(() => setNetworkError('Connection lost'))
    }, 5_000)
    return () => window.clearInterval(keepalive)
  }, [connection])
  useEffect(() => {
    const key = `${state.phase}:${state.renderIndex}`
    if (![...revealPhases, PHASES.SCOREBOARD].includes(state.phase) || celebrationKey.current === key) return
    celebrationKey.current = key
    sound.play(state.phase === PHASES.SCOREBOARD ? SOUND_CUES.SCOREBOARD : SOUND_CUES.REVEAL)
    const itemId = state.phase === PHASES.ODD_REVEAL
      ? state.session.oddItem.id
      : state.phase === PHASES.SPIN_REVEAL
        ? state.session.spinItem.id
        : state.phase === PHASES.CHAIN_REVEAL
          ? state.session.chainItem.id
          : state.session.renderItems[state.renderIndex]?.id
    if (state.phase !== PHASES.SCOREBOARD && !state.players.some((player) => player.answers.some((answer) => answer.itemId === itemId && answer.correct))) return
    confetti({ particleCount: state.phase === PHASES.SCOREBOARD ? 180 : 90, spread: 80, origin: { y: 0.65 }, colors: ['#FF5A5F', '#FFC53D', '#2E86AB', '#8BC34A'], disableForReducedMotion: true })
  }, [state.phase, state.players, state.renderIndex])
  useEffect(() => {
    if (state.phase !== PHASES.RENDER_REVEAL) return undefined
    const timer = window.setTimeout(() => dispatch({ type: 'NEXT_PHASE', now: Date.now() }), 2_500)
    return () => window.clearTimeout(timer)
  }, [state.phase, state.renderIndex])

  const onTimeExpired = useCallback(() => dispatch({ type: 'TIME_EXPIRED', now: Date.now() }), [])
  const onChainTimeExpired = useCallback(() => dispatch({ type: 'CHAIN_TIME_EXPIRED', now: Date.now() }), [])
  const playAgain = () => { setShowRecap(false); celebrationKey.current = ''; dispatch({ type: 'PLAY_AGAIN' }) }
  const startBonus = () => { setShowRecap(false); celebrationKey.current = ''; dispatch({ type: 'START_BONUS', now: Date.now() }) }
  const selectLocale = (nextLocale) => {
    setLocale(nextLocale)
    dispatch({ type: 'SET_SESSION', session: createGameSession(nextLocale) })
  }
  const hostToggles = (
    <TopRail>
      <ReadAloudToggle enabled={readAloud.enabled} supported={readAloud.supported} onToggle={readAloud.toggle} />
      <SoundToggle muted={sound.muted} onToggle={sound.toggleMuted} />
    </TopRail>
  )
  const bonusPlayed = state.players.some((player) => player.answers.some((answer) => answer.round === 'chain'))
  if (networkError) return <>{hostToggles}<ErrorState host message="The room connection stopped. Check your Supabase settings and try again." actionLabel="Try again" onAction={() => window.location.reload()} /></>
  if (!connection || !roomCode) return <>{hostToggles}<LoadingState host message="Claiming a room code..." /></>
  if (showRecap) return <>{hostToggles}<RecapCard state={state} onBack={() => setShowRecap(false)} onPlayAgain={playAgain} onBonus={bonusPlayed ? undefined : startBonus} /></>
  if (state.phase === PHASES.LOBBY) return <>{hostToggles}<HostLobby roomCode={roomCode} players={state.players} locale={locale} onLocaleChange={selectLocale} onStart={() => dispatch({ type: 'START_GAME', now: Date.now() })} /></>
  if (state.phase === PHASES.SCOREBOARD) return <>{hostToggles}<Scoreboard state={state} onRecap={() => setShowRecap(true)} onPlayAgain={playAgain} /></>
  const screen = questionPhases.has(state.phase)
    ? <HostQuestion state={state} onTimeExpired={onTimeExpired} onChainTimeExpired={onChainTimeExpired} onSecondChange={sound.onCountdownSecond} />
    : <HostReveal state={state} onNext={() => dispatch({ type: 'NEXT_PHASE', now: Date.now() })} onEndBonus={() => dispatch({ type: 'END_BONUS' })} />
  return (
    <>{hostToggles}
      {screen}
      <HostControls state={state} dispatch={dispatch} />
      {revealPhases.has(state.phase) && <ReactionBubbles reactions={reactionBubbles} />}
      {state.paused && (
        <div className="fixed inset-x-0 z-30 grid place-items-center bg-ink/75" style={{ top: 'calc(var(--top-rail-height) + 3px)', bottom: 'var(--host-control-height)' }}>
          <Card fill="white" tilt="left" className="p-10 text-center">
            <Pause className="mx-auto" size={64} weight="fill" />
            <p className="mt-3 font-display text-6xl font-bold">Paused</p>
            <p className="mt-2 font-body text-2xl font-semibold host:text-4xl">Resume from the bar below.</p>
          </Card>
        </div>
      )}
      
    </>
  )
}
