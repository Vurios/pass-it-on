import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { Check, Crown, Fire, Medal, Pause, Play, SkipForward, Stop, Trophy, UsersThree, X } from '@phosphor-icons/react'
import confetti from 'canvas-confetti'
import { QRCodeSVG } from 'qrcode.react'
import { useNavigate } from 'react-router-dom'
import { AvatarBadge } from '../components/AvatarBadge.jsx'
import { BigButton } from '../components/BigButton.jsx'
import { BrandMark } from '../components/BrandMark.jsx'
import { Card } from '../components/Card.jsx'
import { CountdownBar } from '../components/CountdownBar.jsx'
import { ErrorState } from '../components/ErrorState.jsx'
import { FabricatedStamp } from '../components/FabricatedStamp.jsx'
import { LeaveConfirmModal } from '../components/LeaveConfirmModal.jsx'
import { LoadingState } from '../components/LoadingState.jsx'
import { RecapCard } from '../components/RecapCard.jsx'
import { SoundToggle } from '../components/SoundToggle.jsx'
import { TopRail } from '../components/TopRail.jsx'
import { ReadAloudToggle } from '../components/ReadAloudToggle.jsx'
import { RenderVisualClue } from '../components/RenderVisualClue.jsx'
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
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden" aria-live="polite" aria-label="Player Reactions">
      {reactions.map((reaction) => (
        <div
          key={reaction.id}
          className="reaction-bubble absolute bottom-24 grid h-16 w-16 place-items-center rounded-full border-chunky border-ink bg-white text-4xl shadow-hard sm:h-20 sm:w-20 sm:text-5xl"
          style={{ left: `${reaction.left}%` }}
        >
          <span aria-label={reaction.label}>{reaction.emoji}</span>
        </div>
      ))}
    </div>
  )
}

function HostToast({ message }) {
  if (!message) return null
  return (
    <div className="toast-callout pointer-events-none fixed right-6 top-[calc(var(--top-rail-height)+0.5rem)] z-40 rounded-[14px] border-chunky border-ink bg-sunshine px-4 py-2 font-display text-base font-bold shadow-hard sm:text-lg host:text-xl" role="status">
      {message}
    </div>
  )
}

function HostLobby({ roomCode, players, onStart }) {
  const joinUrl = useMemo(() => `${window.location.origin}/player?room=${roomCode}`, [roomCode])
  const activeCount = players.filter((player) => player.connected).length
  const canStart = activeCount >= 1 && activeCount <= 8
  return (
    <main className="host-screen ambient-dot-grid screen-min-h flex flex-col justify-center bg-cream px-4 py-3 text-ink sm:px-8 sm:py-4">
      <div className="game-screen mx-auto grid h-full max-h-full w-full max-w-[1500px] items-center gap-4 lg:grid-cols-[0.85fr_1.15fr] lg:gap-8">
        <section className="flex flex-col items-center justify-center text-center">
          <p className="font-display text-sm font-bold uppercase tracking-[0.08em] sm:text-lg host:text-4xl">
            Join at This Code
          </p>
          <h1 className="mt-1 font-display text-[clamp(3.5rem,9dvh,8rem)] font-bold leading-none tracking-[0.12em]">
            {roomCode}
          </h1>
          <Card fill="white" tilt="left" className="mt-3 hidden p-3 sm:mt-4 sm:inline-block sm:p-4">
            <QRCodeSVG
              value={joinUrl}
              size={170}
              bgColor="#FFFEFB"
              fgColor="#1A1A1A"
              level="M"
              marginSize={1}
              title={`Join room ${roomCode}`}
            />
          </Card>
          <p className="mt-3 max-w-xl font-body text-sm font-semibold sm:text-lg host:text-4xl">
            Scan with a phone. No account needed.
          </p>
        </section>

        <Card fill="white" tilt="right" className="flex max-h-[calc(100dvh-var(--top-rail-height)-2rem)] flex-col p-4 sm:p-6 lg:min-h-[60dvh]">
          <h2 className="font-display text-2xl font-bold sm:text-3xl host:text-6xl">
            {activeCount} Joined
          </h2>
          {players.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
              <p className="font-display text-[clamp(2.5rem,6dvh,5rem)] font-bold leading-none tracking-[0.12em]">
                {roomCode}
              </p>
              <p className="mt-3 max-w-md font-body text-base font-semibold sm:text-xl host:text-4xl">
                Your room is ready. First player gets the loudest welcome.
              </p>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2 pr-1 sm:mt-4 sm:gap-3">
              {players.map((player) => <LobbyTile key={player.id} player={player} />)}
            </div>
          )}
          <div className="mt-auto pt-4">
            <BigButton
              className="!min-h-12 text-lg host:text-5xl sm:!min-h-14 sm:text-xl"
              variant="coral"
              disabled={!canStart}
              onClick={onStart}
            >
              {activeCount < 1
                ? 'Waiting for Players'
                : activeCount > 8
                  ? 'Room Has More Than 8 Players'
                  : 'Start Round 1'}
            </BigButton>
            <p className="mt-2 text-center font-body text-xs font-bold sm:text-sm host:text-3xl">
              2 to 8 members. Starting alone asks for confirmation.
            </p>
          </div>
        </Card>
      </div>
    </main>
  )
}

function LobbyTile({ player }) {
  return (
    <div className={`${player.connected ? 'bg-white' : 'bg-paper opacity-45'} lobby-avatar-in flex items-center gap-3 rounded-[14px] border-chunky border-ink p-2.5 shadow-hard-sm`}>
      <AvatarBadge avatar={player.avatar} size={32} />
      <p className="safe-copy min-w-0 flex-1 font-display text-base font-bold sm:text-lg host:text-4xl">{player.name}</p>
      {!player.connected && <span className="font-body text-xs font-bold text-coral host:text-2xl">Left</span>}
    </div>
  )
}

function RevealTally({ state, round, itemId }) {
  const active = state.players.filter((player) => player.connected)
  const caught = active.filter((player) => answerFor(player, round, itemId)?.correct)
  const streaks = state.players.filter((player) => (player.streak ?? 0) >= 2)

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-[14px] border-chunky border-ink bg-white px-4 py-2 shadow-hard-sm sm:mt-3.5">
      <div className="flex shrink-0 items-center gap-2">
        <Check className="shrink-0 text-lime" size={26} weight="bold" aria-hidden="true" />
        <p className="font-display text-base font-bold sm:text-lg host:text-4xl">
          {caught.length} of {active.length} caught it
        </p>
      </div>
      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2.5">
        {caught.slice(0, 8).map((player) => (
          <span key={player.id} className="flex min-w-0 shrink-0 items-center gap-1.5">
            <AvatarBadge avatar={player.avatar} size={24} />
            <span className="max-w-32 truncate font-display text-sm font-bold host:max-w-64 host:text-3xl">{player.name}</span>
          </span>
        ))}
        {streaks.length > 0 && (
          <span className="streak-pop inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-ink bg-sunshine px-2.5 py-0.5 font-display text-xs font-bold shadow-hard-sm">
            <Fire size={18} weight="fill" className="text-coral" aria-hidden="true" />
            <span>Streak: {streaks.map((p) => `${p.name} (${p.streak})`).join(', ')}</span>
          </span>
        )}
      </div>
    </div>
  )
}

function HostFrame({ children, timer }) {
  return (
    <main className="host-screen dot-grid screen-min-h flex flex-col justify-between bg-cream px-3 pt-2 text-ink sm:px-6 sm:pt-3">
      <div className="game-screen host-frame mx-auto flex h-full w-full max-w-[1700px] flex-1 flex-col justify-between">
        <div className="flex-1 overflow-hidden pb-2">{children}</div>
        {timer && <div className="mt-auto shrink-0 pb-1">{timer}</div>}
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
    <header className="border-b-chunky border-ink pb-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {eyebrow ? (
          <p className="min-w-0 flex-1 font-display text-sm font-bold uppercase tracking-[0.08em] sm:text-base host:text-3xl">
            {eyebrow}
          </p>
        ) : (
          <span className="flex-1" />
        )}
        {questionPhases.has(state.phase) && (
          <div className="shrink-0 rounded-[12px] border-chunky border-ink bg-sunshine px-3 py-1 font-display text-sm font-bold shadow-hard-sm sm:text-base host:text-3xl">
            {answered} of {active.length} Locked
          </div>
        )}
        {action}
      </div>
      <h1 className="safe-copy mt-1 font-display text-2xl font-bold leading-tight sm:text-4xl lg:text-5xl host:text-7xl">
        {title}
      </h1>
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
      <div className="mt-3 grid gap-3 sm:mt-4 md:grid-cols-2 md:gap-4">
        {item.material.sources.map((source, index) => (
          <Card key={source.id} fill="white" className={`${sourceColours[index]} min-h-28 p-3.5 sm:min-h-36 sm:p-5`} tilt={index % 2 ? 'right' : 'left'}>
            <p className="safe-copy font-display text-xl font-bold sm:text-2xl host:text-3xl">{source.label}: {source.source}</p>
            <p className="safe-copy mt-2 line-clamp-3 font-display text-base font-semibold leading-snug sm:text-xl host:text-3xl">{source.headline}</p>
          </Card>
        ))}
      </div>
    )
  } else if (state.phase === PHASES.SPIN_QUESTION) {
    const item = state.session.spinItem
    header = <RoundHeader eyebrow="Round 2: Spin Doctor" title="Spot the Spin" state={state} />
    body = (
      <Card fill="white" tilt="left" className="mt-4 p-4 sm:mt-6 sm:p-6">
        <p className="font-display text-xl font-bold leading-relaxed sm:text-2xl lg:text-3xl host:text-4xl">
          {item.material.phrases.map((phrase, index) => (
            <span key={phrase} className="safe-copy m-1.5 inline-block max-w-full rounded-[12px] border-chunky border-ink bg-paper px-3 py-1.5 shadow-hard-sm sm:m-2 sm:px-4 sm:py-2">
              <span className="mr-1.5 text-coral sm:mr-2">{index + 1}</span>{phrase}
            </span>
          ))}
        </p>
      </Card>
    )
  } else if (state.phase === PHASES.CHAIN_QUESTION) {
    const item = state.session.chainItem
    header = <RoundHeader eyebrow="Bonus Round: Order These Oldest First" title={item.material.claim} state={state} />
    body = (
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {item.material.retellings.map((retelling, index) => (
          <Card key={retelling.id} fill="white" className={`${sourceColours[index]} p-3.5 sm:p-4`} tilt={index % 2 ? 'right' : 'left'}>
            <p className="safe-copy font-display text-lg font-semibold leading-snug sm:text-2xl host:text-4xl">
              <span className="font-bold">{retelling.label}. </span>{retelling.text}
            </p>
          </Card>
        ))}
      </div>
    )
  } else {
    const item = state.session.renderItems[state.renderIndex]
    header = <RoundHeader eyebrow={`Round 3: Real or Rendered · ${state.renderIndex + 1}/${state.session.renderItems.length}`} title="Real or Rendered?" state={state} />
    body = (
      <div className="mx-auto mt-2 flex max-w-4xl flex-col items-center justify-between gap-2.5 pb-2 sm:mt-3 sm:gap-3.5">
        <RenderVisualClue item={item} className="w-full max-w-2xl mx-auto shrink-0" />
        <Card fill="white" tilt="right" className="w-full shrink-0 p-3.5 text-center sm:p-5 host:p-6">
          <p className="safe-copy font-display text-lg font-bold leading-snug sm:text-2xl host:text-3xl host:leading-normal">
            {item.material.prompt}
          </p>
        </Card>
      </div>
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
  const answerMap = state.phase === PHASES.ODD_REVEAL
    ? state.oddAnswers
    : state.phase === PHASES.SPIN_REVEAL
      ? state.spinAnswers
      : state.phase === PHASES.CHAIN_REVEAL
        ? state.chainAnswers
        : state.renderAnswers
  const nobodyAnswered = Object.keys(answerMap ?? {}).length === 0
  if (state.phase === PHASES.ODD_REVEAL) {
    item = state.session.oddItem; round = 'odd'
    const winner = item.material.sources.find((source) => source.id === item.correctAnswer)
    const winnerIndex = item.material.sources.indexOf(winner)
    content = (
      <>
        <Card fill="white" className={`${sourceColours[winnerIndex]} mt-3 p-3.5 outline-6 outline-sunshine sm:mt-4 sm:p-4`} tilt="left">
          <p className="safe-copy font-display text-xl font-bold sm:text-2xl host:text-4xl">{winner.label}: {winner.source}</p>
          <p className="safe-copy mt-1.5 font-display text-lg font-semibold leading-tight sm:text-xl host:text-2xl">{winner.headline}</p>
        </Card>
        <div className="mt-3 grid gap-2.5 sm:mt-3.5 sm:grid-cols-3">
          {item.material.sources.filter((source) => source.id !== item.correctAnswer).map((source, index) => (
            <div key={source.id} className={`${sourceColours[index >= winnerIndex ? index + 1 : index]} truncate rounded-[12px] border-chunky border-ink px-3 py-2 font-display text-sm font-bold opacity-45 shadow-hard-sm sm:text-base host:text-lg`}>
              {source.label}: {source.source}
            </div>
          ))}
        </div>
      </>
    )
  } else if (state.phase === PHASES.SPIN_REVEAL) {
    item = state.session.spinItem; round = 'spin'
    content = (
      <Card fill="white" className="mt-3 p-3.5 sm:mt-4 sm:p-4">
        <div className="flex flex-wrap gap-2">
          {item.material.phrases.map((phrase, index) => (
            <span key={phrase} className={`${item.correctAnswer.includes(index) ? 'bg-coral text-white' : 'bg-paper opacity-55'} safe-copy max-w-full rounded-[12px] border-chunky border-ink px-3 py-1.5 font-display text-base font-bold sm:text-lg host:text-2xl`}>
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
      <ol className="mt-3 grid gap-2.5 sm:mt-4 lg:grid-cols-2 host:grid-cols-4">
        {ordered.map((retelling, index) => (
          <li key={retelling.id}>
            <Card fill="white" className={`${index === 0 ? '!bg-lime' : index === ordered.length - 1 ? '!bg-coral' : ''} p-3.5 sm:p-4`} tilt={index % 2 ? 'right' : 'left'}>
              <p className="safe-copy font-display text-base font-bold leading-tight sm:text-xl host:text-3xl">
                <span className="text-ink/55">{index + 1}. </span>{retelling.text}
              </p>
              <p className="safe-copy mt-1.5 font-body text-xs font-semibold leading-snug sm:text-sm host:text-2xl">{retelling.note}</p>
            </Card>
          </li>
        ))}
      </ol>
    )
  } else {
    item = state.session.renderItems[state.renderIndex]; round = 'render'
    content = (
      <div className="mx-auto mt-2 max-w-4xl space-y-2.5 sm:mt-3 sm:space-y-3.5">
        <RenderVisualClue item={item} className="w-full max-w-2xl mx-auto shrink-0" />
        <Card fill="white" className="p-3.5 text-center sm:p-4.5 host:p-6">
          <p className="font-display text-2xl font-bold capitalize sm:text-3xl host:text-5xl">{item.correctAnswer}</p>
          <p className="safe-copy mt-2 font-body text-sm font-semibold leading-relaxed sm:text-base host:text-2xl">{item.material.prompt}</p>
        </Card>
      </div>
    )
  }

  const action = state.phase === PHASES.CHAIN_REVEAL ? (
    <BigButton variant="ocean" className="!h-10 !min-h-0 !w-auto shrink-0 px-4 text-sm host:text-3xl" onClick={onEndBonus}>
      Back to Scores
    </BigButton>
  ) : state.phase !== PHASES.RENDER_REVEAL ? (
    <BigButton variant="sunshine" className="!h-10 !min-h-0 !w-auto shrink-0 px-4 text-sm host:text-3xl" onClick={onNext}>
      Next Round
    </BigButton>
  ) : null

  return (
    <HostFrame>
      <RoundHeader eyebrow={null} title={item.technique} state={state} action={action} />
      {nobodyAnswered && (
        <p className="mt-2 rounded-[12px] border-chunky border-ink bg-sunshine px-4 py-2 text-center font-display text-xl font-bold shadow-hard-sm sm:text-2xl host:text-4xl">
          Time's up! Here is the answer.
        </p>
      )}
      {content}
      <Card fill="white" tilt="left" className="reveal-banner mt-3.5 p-3.5 sm:mt-4 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 host:gap-6">
          <div className="flex shrink-0 items-center justify-center w-12 sm:w-14 host:w-20 max-w-[3.5rem] sm:max-w-[4rem] host:max-w-[5rem]">
            <BrandMark decorative className="w-full h-auto" />
          </div>
          <p className="safe-copy min-w-0 flex-1 font-body text-base font-semibold leading-relaxed sm:text-lg host:text-2xl">
            {item.explanation}
          </p>
          {item.fabricated && (
            <div className="shrink-0 self-start sm:self-center">
              <FabricatedStamp className="mt-0" />
            </div>
          )}
        </div>
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
    <div className="host-control fixed inset-x-0 bottom-0 z-40 flex items-center border-t-chunky border-ink bg-white px-3 py-1.5 sm:px-6">
      <div className="mx-auto flex w-full max-w-4xl gap-2.5">
        <BigButton
          variant="ocean"
          className="!h-11 !min-h-0 flex-1 gap-1.5 text-xs sm:!h-12 sm:text-sm"
          disabled={!question}
          onClick={() => dispatch({ type: state.paused ? 'RESUME_GAME' : 'PAUSE_GAME', now: Date.now() })}
        >
          {state.paused ? <Play size={18} weight="fill" /> : <Pause size={18} weight="fill" />}
          <span>{state.paused ? 'Resume' : 'Pause'}</span>
        </BigButton>
        <BigButton
          variant="sunshine"
          className="!h-11 !min-h-0 flex-1 gap-1.5 text-xs sm:!h-12 sm:text-sm"
          disabled={!question}
          onClick={skip}
        >
          <SkipForward size={18} weight="fill" />
          <span>{bonus ? 'Skip Bonus' : 'Skip Round'}</span>
        </BigButton>
        <BigButton
          variant="coral"
          className="!h-11 !min-h-0 flex-1 gap-1.5 text-xs sm:!h-12 sm:text-sm"
          onClick={() => dispatch({ type: 'END_EARLY' })}
        >
          <Stop size={18} weight="fill" />
          <span>{bonus ? 'Back to Scores' : 'End Early'}</span>
        </BigButton>
      </div>
    </div>
  )
}

function Scoreboard({ state, onRecap, onPlayAgain }) {
  const ranked = [...state.players].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
  const titles = assignPlayerTitles(state.players)
  const podium = [ranked[2], ranked[1], ranked[0]].filter(Boolean)
  const bonusPlayed = state.players.some((player) => (player.bonusScore ?? 0) > 0)
  const [revealed, setRevealed] = useState(0)

  useEffect(() => {
    const timers = podium.map((player, index) => window.setTimeout(() => {
      setRevealed(index + 1)
      if (player.id === ranked[0]?.id) {
        confetti({ particleCount: 180, spread: 84, origin: { y: 0.6 }, colors: ['#FF5A5F', '#FFC53D', '#2E86AB', '#8BC34A'], disableForReducedMotion: true })
      }
    }, index * 1_500))
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [])

  return (
    <HostFrame>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-chunky border-ink pb-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Crown className="shrink-0 text-sunshine" size={38} weight="fill" />
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-4xl lg:text-5xl">Pass It On!</h1>
            <p className="font-display text-xs font-bold uppercase tracking-[0.08em] sm:text-sm host:text-3xl">Final Scoreboard</p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <BigButton variant="ocean" className="!h-10 !min-h-0 !w-auto px-4 text-xs sm:text-sm host:text-3xl" onClick={onRecap}>
            Room Recap
          </BigButton>
          <BigButton variant="coral" className="!h-10 !min-h-0 !w-auto px-4 text-xs sm:text-sm host:text-3xl" onClick={onPlayAgain}>
            Play Again
          </BigButton>
        </div>
      </header>

      <div className="mx-auto mt-3 grid w-full max-w-3xl gap-2 sm:mt-4">
        {podium.slice(0, revealed).map((player) => {
          const place = ranked.indexOf(player) + 1
          return (
            <Card
              key={player.id}
              fill={place === 1 ? 'cream' : 'white'}
              className={`${place === 1 ? 'bg-sunshine' : 'bg-white'} podium-reveal flex items-center gap-3 !p-2.5 sm:gap-4 sm:!p-3`}
            >
              <div className={`${place === 1 ? 'bg-sunshine' : place === 2 ? 'bg-paper' : 'bg-coral'} grid h-11 w-11 shrink-0 place-items-center rounded-[12px] border-chunky border-ink shadow-hard-sm`}>
                <Medal size={26} weight="fill" aria-label={`${place === 1 ? 'Gold' : place === 2 ? 'Silver' : 'Bronze'} Medal`} />
              </div>
              <span className="font-display text-xl font-bold sm:text-2xl host:text-4xl">#{place}</span>
              <AvatarBadge avatar={player.avatar} size={30} />
              <h2 className="safe-copy min-w-0 flex-1 truncate font-display text-lg font-bold sm:text-xl host:text-3xl">{player.name}</h2>
              <p className="shrink-0 font-display text-xl font-bold sm:text-2xl host:text-4xl">{player.score} pts</p>
            </Card>
          )
        })}
        {revealed < podium.length && <p className="py-2 text-center font-display text-lg font-bold text-ink/65">Next place...</p>}
      </div>

      <div className="mx-auto mt-3 grid max-w-5xl grid-cols-2 gap-2 pr-1 sm:mt-4 sm:gap-2.5">
        {ranked.map((player, index) => (
          <div key={player.id} className={`${player.connected ? 'bg-white' : 'bg-paper opacity-50'} flex items-center gap-3 rounded-[12px] border-chunky border-ink px-3 py-1.5 shadow-hard-sm`}>
            <span className="font-display text-lg font-bold sm:text-xl host:text-3xl">{index + 1}</span>
            <AvatarBadge avatar={player.avatar} size={28} />
            <div className="flex min-w-0 flex-1 items-baseline gap-2">
              <p className="min-w-0 flex-1 truncate font-display text-sm font-bold sm:text-base host:text-3xl">{player.name}</p>
              <p className="min-w-0 shrink truncate font-body text-xs font-bold text-ink/70 host:text-2xl">{titles[player.id]}</p>
            </div>
            {bonusPlayed && (player.bonusScore ?? 0) > 0 && (
              <span className="shrink-0 rounded-[8px] border-chunky border-ink bg-sunshine px-1.5 py-0.5 font-body text-xs font-bold">
                +{player.bonusScore} bonus
              </span>
            )}
            <strong className="font-display text-base sm:text-xl host:text-3xl">{player.score}</strong>
          </div>
        ))}
      </div>
    </HostFrame>
  )
}

function MidGameLeaderboardFlash({ title, players, onComplete }) {
  const ranked = [...players].sort((a, b) => b.score - a.score)
  const streakPlayer = ranked.find((player) => (player.streak ?? 0) >= 2)
  const biggestGain = [...players].sort((a, b) => (b.answers.at(-1)?.score ?? 0) - (a.answers.at(-1)?.score ?? 0))[0]
  const callout = streakPlayer
    ? `${streakPlayer.name} is on a ${streakPlayer.streak}-answer streak.`
    : biggestGain?.answers.at(-1)?.score > 0
      ? `Biggest jump: ${biggestGain.name} +${biggestGain.answers.at(-1).score}.`
      : 'Scores are still wide open.'
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    const timer = window.setTimeout(() => onCompleteRef.current?.(), 3500)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-ink/75 p-4" role="dialog" aria-label="Current Standings">
      <div className="game-screen w-full max-w-md">
        <Card fill="white" tilt="left" className="p-6 text-center">
          <Trophy size={42} weight="fill" className="mx-auto text-sunshine" />
          <h2 className="mt-2 font-display text-3xl font-bold">{title}</h2>
          <p className="mt-1 font-body text-sm font-semibold">Current room standings</p>
          <div className="mt-4 grid gap-2">
            {ranked.slice(0, 5).map((player, idx) => (
              <div key={player.id} className="leaderboard-entry flex items-center gap-3 rounded-[12px] border-chunky border-ink bg-paper p-2.5" style={{ animationDelay: `${idx * 90}ms` }}>
                <span className="font-display text-xl font-bold">#{idx + 1}</span>
                <AvatarBadge avatar={player.avatar} size={28} />
                <span className="flex-1 truncate text-left font-display text-base font-bold">{player.name}</span>
                {(player.streak ?? 0) >= 2 && <Fire size={20} weight="fill" className="text-coral" />}
                <strong className="font-display text-lg">{player.score} pts</strong>
              </div>
            ))}
          </div>
          <p className="mt-3 rounded-[10px] border-2 border-ink bg-sunshine px-3 py-1.5 font-body text-sm font-bold">{callout}</p>
          <p className="mt-4 font-body text-xs font-bold text-ink/70">Next round starting in a moment...</p>
        </Card>
      </div>
    </div>
  )
}

export function HostScreen() {
  const navigate = useNavigate()
  const sound = useSessionSound()
  const [state, dispatch] = useReducer(gameReducer, hostSession, createMultiplayerGameState)
  const readAloud = useHostReadAloud(state)
  const [connection, setConnection] = useState(null)
  const [roomCode, setRoomCode] = useState('')
  const [networkError, setNetworkError] = useState('')
  const [showRecap, setShowRecap] = useState(false)
  const [reactionBubbles, setReactionBubbles] = useState([])
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [showSmallLobbyConfirm, setShowSmallLobbyConfirm] = useState(false)
  const [hostToast, setHostToast] = useState('')
  const [flashStandings, setFlashStandings] = useState(null)
  const sendQueue = useRef(Promise.resolve())
  const stateRef = useRef(state)
  const celebrationKey = useRef('')
  const knownPlayers = useRef(new Set())
  const reactionSequence = useRef(0)
  const reactionTimers = useRef(new Set())
  const toastTimer = useRef(null)
  const previousConnections = useRef(new Map())
  const firstRoundHintShown = useRef(false)

  const showHostToast = useCallback((message, duration = 2_000) => {
    window.clearTimeout(toastTimer.current)
    setHostToast(message)
    toastTimer.current = window.setTimeout(() => setHostToast(''), duration)
  }, [])

  const showReaction = useCallback((message) => {
    const player = stateRef.current.players.find((entry) => entry.id === message.playerId && entry.connected)
    if (!player) return
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
    }, 2_200)
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
    window.clearTimeout(toastTimer.current)
  }, [])

  useEffect(() => {
    for (const player of state.players) {
      const wasConnected = previousConnections.current.get(player.id)
      if (wasConnected === true && !player.connected) showHostToast(`${player.name} left. Their score is saved.`)
      previousConnections.current.set(player.id, player.connected)
    }
  }, [state.players, showHostToast])

  useEffect(() => {
    if (state.phase !== PHASES.ODD_QUESTION || firstRoundHintShown.current) return
    firstRoundHintShown.current = true
    showHostToast('Players answer on their phones.', 5_000)
  }, [state.phase, showHostToast])

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
    if (state.phase === PHASES.SCOREBOARD) return
    const correct = state.players
      .map((player) => ({ player, answer: player.answers.find((answer) => answer.itemId === itemId && answer.correct) }))
      .filter((entry) => entry.answer)
      .sort((a, b) => a.answer.elapsedMs - b.answer.elapsedMs)
    if (correct.length === 0) return
    showHostToast(`First correct answer: ${correct[0].player.name}.`)
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.65 }, colors: ['#FF5A5F', '#FFC53D', '#2E86AB', '#8BC34A'], disableForReducedMotion: true })
  }, [state.phase, state.players, state.renderIndex, showHostToast])

  useEffect(() => {
    if (state.phase !== PHASES.RENDER_REVEAL) return undefined
    const timer = window.setTimeout(() => dispatch({ type: 'NEXT_PHASE', now: Date.now() }), 2_500)
    return () => window.clearTimeout(timer)
  }, [state.phase, state.renderIndex])

  const onTimeExpired = useCallback(() => dispatch({ type: 'TIME_EXPIRED', now: Date.now() }), [])
  const onChainTimeExpired = useCallback(() => dispatch({ type: 'CHAIN_TIME_EXPIRED', now: Date.now() }), [])
  const playAgain = () => { setShowRecap(false); celebrationKey.current = ''; dispatch({ type: 'PLAY_AGAIN' }) }
  const startBonus = () => { setShowRecap(false); celebrationKey.current = ''; dispatch({ type: 'START_BONUS', now: Date.now() }) }

  const handleNextWithFlash = () => {
    if (state.phase === PHASES.ODD_REVEAL) {
      setFlashStandings('Round 1 Standings')
    } else if (state.phase === PHASES.SPIN_REVEAL) {
      setFlashStandings('Round 2 Standings')
    } else {
      dispatch({ type: 'NEXT_PHASE', now: Date.now() })
    }
  }

  const handleBackClick = () => {
    if (state.phase === PHASES.LOBBY && state.players.length === 0) {
      navigate('/')
    } else {
      setShowLeaveConfirm(true)
    }
  }

  const handleConfirmLeave = () => {
    setShowLeaveConfirm(false)
    navigate('/')
  }

  const startFromLobby = () => {
    const activeCount = state.players.filter((player) => player.connected).length
    if (activeCount === 1) {
      setShowSmallLobbyConfirm(true)
      return
    }
    dispatch({ type: 'START_GAME', now: Date.now() })
  }

  const hostToggles = (
    <TopRail onBack={handleBackClick} backAriaLabel="Leave Host Room">
      <ReadAloudToggle enabled={readAloud.enabled} supported={readAloud.supported} onToggle={readAloud.toggle} />
      <SoundToggle muted={sound.muted} onToggle={sound.toggleMuted} />
    </TopRail>
  )

  const bonusPlayed = state.players.some((player) => player.answers.some((answer) => answer.round === 'chain'))
  if (networkError) return <>{hostToggles}<ErrorState host message="The room connection stopped. Check your Supabase settings and try again." actionLabel="Try Again" onAction={() => window.location.reload()} /></>
  if (!connection || !roomCode) return <>{hostToggles}<LoadingState host message="Claiming a room code..." /></>
  if (showRecap) return <>{hostToggles}<RecapCard state={state} onBack={() => setShowRecap(false)} onPlayAgain={playAgain} onMenu={() => navigate('/')} onBonus={bonusPlayed ? undefined : startBonus} /></>
  if (state.phase === PHASES.LOBBY) return <>{hostToggles}<HostLobby roomCode={roomCode} players={state.players} onStart={startFromLobby} /><LeaveConfirmModal open={showLeaveConfirm} onConfirm={handleConfirmLeave} onCancel={() => setShowLeaveConfirm(false)} title="Close Host Room?" message="Are you sure you want to close this game lobby and return to the main menu?" /><LeaveConfirmModal open={showSmallLobbyConfirm} onConfirm={() => { setShowSmallLobbyConfirm(false); dispatch({ type: 'START_GAME', now: Date.now() }) }} onCancel={() => setShowSmallLobbyConfirm(false)} title="Only 1 Player Joined" message="Only 1 player joined. Start anyway?" confirmLabel="Start Anyway" cancelLabel="Wait for More" confirmVariant="sunshine" icon={UsersThree} /></>
  if (state.phase === PHASES.SCOREBOARD) return <>{hostToggles}<Scoreboard state={state} onRecap={() => setShowRecap(true)} onPlayAgain={playAgain} /><LeaveConfirmModal open={showLeaveConfirm} onConfirm={handleConfirmLeave} onCancel={() => setShowLeaveConfirm(false)} title="Leave Game?" message="Are you sure you want to return to the main menu?" /></>

  const screen = questionPhases.has(state.phase)
    ? <HostQuestion state={state} onTimeExpired={onTimeExpired} onChainTimeExpired={onChainTimeExpired} onSecondChange={sound.onCountdownSecond} />
    : <HostReveal state={state} onNext={handleNextWithFlash} onEndBonus={() => dispatch({ type: 'END_BONUS' })} />

  return (
    <>
      {hostToggles}
      {screen}
      <HostControls state={state} dispatch={dispatch} />
      <ReactionBubbles reactions={reactionBubbles} />
      <HostToast message={hostToast} />
      {flashStandings && (
        <MidGameLeaderboardFlash
          title={flashStandings}
          players={state.players}
          onComplete={() => {
            setFlashStandings(null)
            dispatch({ type: 'NEXT_PHASE', now: Date.now() })
          }}
        />
      )}
      {state.paused && (
        <div className="fixed inset-x-0 z-30 grid place-items-center bg-ink/75" style={{ top: 'var(--top-rail-height)', bottom: 'var(--host-control-height)' }}>
          <Card fill="white" tilt="left" className="p-8 text-center">
            <Pause className="mx-auto" size={54} weight="fill" />
            <p className="mt-2 font-display text-4xl font-bold sm:text-5xl">Paused</p>
            <p className="mt-2 font-body text-lg font-semibold host:text-3xl">Resume from the bar below.</p>
          </Card>
        </div>
      )}
      <LeaveConfirmModal
        open={showLeaveConfirm}
        onConfirm={handleConfirmLeave}
        onCancel={() => setShowLeaveConfirm(false)}
        title="Leave Active Game?"
        message="Are you sure you want to exit to the main menu? The ongoing room session will end."
      />
    </>
  )
}
