import { useEffect, useRef, useState } from 'react'
import { ArrowsDownUp, Check, Hourglass, Pause, Plugs, Ticket, UsersThree, X } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { AvatarBadge, AVATAR_OPTIONS } from '../components/AvatarBadge.jsx'
import { BigButton } from '../components/BigButton.jsx'
import { BrandMark } from '../components/BrandMark.jsx'
import { Card } from '../components/Card.jsx'
import { ErrorState } from '../components/ErrorState.jsx'
import { FabricatedStamp } from '../components/FabricatedStamp.jsx'
import { LeaveConfirmModal } from '../components/LeaveConfirmModal.jsx'
import { LoadingState } from '../components/LoadingState.jsx'
import { SoundToggle } from '../components/SoundToggle.jsx'
import { TopRail } from '../components/TopRail.jsx'
import { SOUND_CUES } from '../audio/soundSystem.js'
import { useSessionSound } from '../audio/useSessionSound.js'
import { validatePlayerName } from '../content/profanity/index.js'
import { PHASES } from '../game/gameReducer.js'
import { joinPlayerRoom } from '../realtime/transport.js'
import { REACTION_COOLDOWN_MS, REALTIME_REACTIONS } from '../realtime/reactionProtocol.js'

const revealPhases = [PHASES.ODD_REVEAL, PHASES.SPIN_REVEAL, PHASES.RENDER_REVEAL, PHASES.CHAIN_REVEAL]
const questionPhases = [PHASES.ODD_QUESTION, PHASES.SPIN_QUESTION, PHASES.RENDER_QUESTION, PHASES.CHAIN_QUESTION]

function PausedOverlay() {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-ink/75 p-4">
      <Card fill="white" tilt="left" className="w-full max-w-sm p-6 text-center">
        <Pause className="mx-auto" size={54} weight="fill" />
        <p className="mt-2 font-display text-4xl font-bold">Paused</p>
        <p className="mt-2 font-body text-base font-semibold">The host froze the clock.</p>
      </Card>
    </div>
  )
}

function JoinForm({ roomCode, setRoomCode, name, setName, avatar, setAvatar, error, onSubmit }) {
  return (
    <main className="safe-player-screen dot-grid screen-min-h flex flex-col justify-center bg-cream text-ink">
      <div className="mx-auto flex h-full max-h-full w-full max-w-md flex-col justify-center py-2">
        <div className="text-center">
          <BrandMark decorative className="mx-auto w-[clamp(3.5rem,8dvh,5.5rem)] shrink-0" />
          <h1 className="mt-1 font-display text-[clamp(1.75rem,4dvh,2.5rem)] font-bold leading-tight">
            Join the Room
          </h1>
          <p className="mt-1 font-body text-base font-semibold">
            Enter the 4-letter code from the shared screen, then pick a name and avatar.
          </p>
        </div>

        <Card fill="white" tilt="left" className="mt-3 p-4 sm:p-5">
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-2.5">
            <div>
              <label htmlFor="player-name" className="font-body text-xs font-bold sm:text-sm">
                Your Name
              </label>
              <input
                id="player-name"
                value={name}
                maxLength={20}
                autoComplete="nickname"
                onChange={(event) => setName(event.target.value)}
                className="mt-1 h-10 w-full rounded-[12px] border-chunky border-ink bg-cream px-3 font-body text-base font-bold shadow-hard-sm focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ink sm:h-12 sm:text-lg"
              />
            </div>

            <div>
              <label htmlFor="room-code" className="block font-body text-xs font-bold sm:text-sm">
                Room Code
              </label>
              <input
                id="room-code"
                value={roomCode}
                maxLength={4}
                autoCapitalize="characters"
                autoComplete="off"
                onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
                className="mt-1 h-10 w-full rounded-[12px] border-chunky border-ink bg-cream px-3 text-center font-display text-xl font-bold uppercase tracking-[0.16em] shadow-hard-sm focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ink sm:h-12 sm:text-2xl"
              />
            </div>

            <fieldset className="mt-1">
              <legend className="font-body text-xs font-bold sm:text-sm">Choose an Animal</legend>
              <div className="mt-1.5 grid grid-cols-4 gap-2">
                {AVATAR_OPTIONS.map((option) => {
                  const selected = avatar === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-label={option.label}
                      aria-pressed={selected}
                      onClick={() => setAvatar(option.id)}
                      className={`${selected ? 'press-held-sm bg-sunshine' : 'press-sm bg-cream shadow-hard-sm'} grid h-11 place-items-center rounded-[12px] border-chunky border-ink sm:h-12`}
                    >
                      <option.Icon size={26} weight="fill" />
                    </button>
                  )
                })}
              </div>
            </fieldset>

            {error && (
              <p className="rounded-[10px] border-chunky border-ink bg-coral p-2 text-center font-body text-xs font-bold text-white" role="alert">
                {error}
              </p>
            )}

            <BigButton variant="ocean" type="submit" className="!h-11 !min-h-0 text-base sm:!h-13 sm:text-lg">
              Join Game
            </BigButton>
          </form>
        </Card>
      </div>
    </main>
  )
}

function WaitingRoom({ snapshot, playerId, roomCode }) {
  const player = snapshot.players.find((entry) => entry.id === playerId)
  return (
    <main className="safe-player-screen ambient-dot-grid centre-column bg-cream text-ink">
      <div className="mx-auto w-full max-w-md">
        <Card fill="white" tilt="right" className="w-full p-6 text-center sm:p-8">
          {player ? <AvatarBadge avatar={player.avatar} size={56} className="mx-auto" /> : <Hourglass className="mx-auto" size={56} weight="fill" />}
          <p className="mt-3 font-display text-sm font-bold uppercase tracking-[0.08em] sm:text-base">Room {roomCode}</p>
          <h1 className="safe-copy mt-1 font-display text-2xl font-bold sm:text-3xl">
            {player ? `You're in, ${player.name}.` : 'Finding your seat...'}
          </h1>
          <p className="mt-3 font-body text-base font-semibold sm:text-lg">
            Look up at the host screen. The show starts there.
          </p>
        </Card>
      </div>
    </main>
  )
}

function PlayerFrame({ snapshot, children }) {
  return (
    <main className="safe-player-screen dot-grid flex screen-min-h flex-col justify-between bg-cream text-ink">
      <div className="mx-auto flex h-full w-full max-w-md flex-1 flex-col justify-between overflow-hidden py-1.5">
        <div className="flex-1 overflow-hidden">{children}</div>
        {snapshot.paused && <PausedOverlay />}
      </div>
    </main>
  )
}

function OddQuestion({ snapshot, playerId, clockOffset, pending, submit, onSecondChange }) {
  const player = snapshot.players.find((entry) => entry.id === playerId)
  const locked = Boolean(player?.hasAnswered || pending)

  return (
    <PlayerFrame snapshot={snapshot}>
      <div className="flex h-full flex-col justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Pick a Source</h1>
          <p className="mt-1 font-body text-xs font-semibold sm:text-sm">Read the four headlines on the host screen.</p>
        </div>
        <div className="my-auto grid grid-cols-2 gap-3 sm:gap-4">
          {snapshot.publicQuestion.choices.map((choice) => (
            <BigButton
              key={choice.id}
              variant={choice.colour}
              disabled={locked || snapshot.paused}
              onClick={() => submit('odd', { answerId: choice.id }, choice.id)}
              className="!h-[clamp(4.5rem,14dvh,6.5rem)] !min-h-0 flex-col gap-1 text-3xl sm:text-4xl"
            >
              <span>{choice.label}</span>
              {pending === choice.id && <Check size={28} weight="bold" />}
            </BigButton>
          ))}
        </div>
        <p className="text-center font-body text-xs font-bold">
          {pending ? 'Submitting...' : locked ? 'Answer locked. Look up.' : 'Tap your pick.'}
        </p>
      </div>
    </PlayerFrame>
  )
}

function SpinQuestion({ snapshot, playerId, clockOffset, selections, setSelections, pending, submit, onSecondChange }) {
  const player = snapshot.players.find((entry) => entry.id === playerId)
  const locked = Boolean(player?.hasAnswered || pending)
  const toggle = (index) => {
    if (locked || snapshot.paused) return
    const next = selections.includes(index) ? selections.filter((entry) => entry !== index) : [...selections, index]
    if (next.length > 3) return
    setSelections(next)
    if (next.length === 3) submit('spin', { selections: next }, 'spin')
  }

  return (
    <PlayerFrame snapshot={snapshot}>
      <div className="flex h-full flex-col justify-between">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.06em]">Round 2: Choose Up to 3</p>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Spot the Spin</h1>
        </div>
        <div className="my-auto flex flex-wrap justify-center gap-2 py-1">
          {snapshot.publicQuestion.phrases.map((phrase, index) => (
            <button
              key={`${phrase}-${index}`}
              type="button"
              disabled={locked}
              aria-pressed={selections.includes(index)}
              onClick={() => toggle(index)}
              className={`${selections.includes(index) ? 'press-held-sm bg-coral text-white' : 'press-sm bg-white shadow-hard-sm'} safe-copy rounded-[12px] border-chunky border-ink px-3 py-2 text-left font-display text-sm font-bold sm:text-base`}
            >
              {phrase}
            </button>
          ))}
        </div>
        <BigButton
          variant="sunshine"
          className="!h-12 !min-h-0 text-base font-bold text-ink shadow-hard sm:!h-13 sm:text-lg"
          disabled={locked || selections.length === 0 || snapshot.paused}
          onClick={() => submit('spin', { selections }, 'spin')}
        >
          {pending ? 'Submitting...' : locked ? 'Answer Locked' : `Submit ${selections.length}/3`}
        </BigButton>
      </div>
    </PlayerFrame>
  )
}

function RenderQuestion({ snapshot, playerId, clockOffset, pending, submit, onSecondChange }) {
  const player = snapshot.players.find((entry) => entry.id === playerId)
  const locked = Boolean(player?.hasAnswered || pending)

  return (
    <PlayerFrame snapshot={snapshot}>
      <div className="flex h-full flex-col justify-between">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.06em]">
            Round 3: {snapshot.publicQuestion.itemNumber}/{snapshot.publicQuestion.itemTotal}
          </p>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Real or Rendered?</h1>
          <p className="safe-copy mt-1.5 line-clamp-3 rounded-[12px] border-chunky border-ink bg-white p-2.5 font-body text-xs font-semibold sm:text-sm">
            {snapshot.publicQuestion.material.prompt}
          </p>
        </div>
        <div className="my-auto grid grid-rows-2 gap-2.5 sm:gap-3">
          <BigButton
            variant="lime"
            className="!h-[clamp(3.75rem,13dvh,5.5rem)] !min-h-0 text-3xl sm:text-4xl"
            disabled={locked || snapshot.paused}
            onClick={() => submit('render', { answer: 'real' }, 'real')}
          >
            <span>Real</span>
            {pending === 'real' && <Check size={28} />}
          </BigButton>
          <BigButton
            variant="coral"
            className="!h-[clamp(3.75rem,13dvh,5.5rem)] !min-h-0 text-3xl sm:text-4xl"
            disabled={locked || snapshot.paused}
            onClick={() => submit('render', { answer: 'rendered' }, 'rendered')}
          >
            <span>Rendered</span>
            {pending === 'rendered' && <Check size={28} />}
          </BigButton>
        </div>
        <p className="text-center font-body text-xs font-bold">
          {pending ? 'Submitting...' : locked ? 'Pick locked. Look up.' : 'Choose one.'}
        </p>
      </div>
    </PlayerFrame>
  )
}

function ChainQuestion({ snapshot, playerId, clockOffset, selections, setSelections, pending, submit, onSecondChange }) {
  const player = snapshot.players.find((entry) => entry.id === playerId)
  const locked = Boolean(player?.hasAnswered || pending)
  const choices = snapshot.publicQuestion.choices
  const tap = (choiceId) => {
    if (locked || snapshot.paused) return
    const next = selections.includes(choiceId) ? selections.filter((entry) => entry !== choiceId) : [...selections, choiceId]
    if (next.length > choices.length) return
    setSelections(next)
    if (next.length === choices.length) submit('chain', { order: next }, 'chain')
  }

  return (
    <PlayerFrame snapshot={snapshot}>
      <div className="flex h-full flex-col justify-between">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.06em]">Bonus Round</p>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Order the Chain</h1>
          <p className="mt-1 font-body text-xs font-semibold">Tap oldest first.</p>
        </div>
        <div className="my-auto grid grid-cols-2 gap-2.5">
          {choices.map((choice) => {
            const position = selections.indexOf(choice.id)
            const chosen = position >= 0
            return (
              <BigButton
                key={choice.id}
                variant={choice.colour}
                disabled={locked || snapshot.paused}
                aria-pressed={chosen}
                onClick={() => tap(choice.id)}
                className={`${chosen ? 'press-held' : ''} !h-[clamp(3.75rem,12dvh,5rem)] !min-h-0 flex-col gap-1 text-2xl sm:text-3xl`}
              >
                <span>{choice.label}</span>
                <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-ink bg-paper font-display text-xs font-bold sm:h-7 sm:w-7 sm:text-sm">
                  {chosen ? position + 1 : '·'}
                </span>
              </BigButton>
            )
          })}
        </div>
        <div className="grid gap-2">
          <BigButton
            variant="sunshine"
            className="!h-9 !min-h-0 gap-1 text-xs sm:!h-11 sm:text-sm"
            disabled={locked || selections.length === 0}
            onClick={() => setSelections([])}
          >
            <ArrowsDownUp size={16} weight="bold" aria-hidden="true" />
            Start Over
          </BigButton>
          <p className="text-center font-body text-xs font-bold">
            {pending ? 'Submitting...' : locked ? 'Chain locked. Look up.' : `${selections.length} of ${choices.length} placed`}
          </p>
        </div>
      </div>
    </PlayerFrame>
  )
}

function ReactionBar({ disabled, onReact }) {
  return (
    <Card fill="white" tilt="right" className="mt-3 p-2.5 text-center sm:p-3">
      <p className="font-display text-xs font-bold uppercase tracking-[0.06em]">React to the Reveal</p>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {REALTIME_REACTIONS.map((reaction) => (
          <button
            key={reaction}
            type="button"
            disabled={disabled}
            onClick={() => onReact(reaction)}
            aria-label={`React ${reaction}`}
            className="press-sm grid h-10 place-items-center rounded-[10px] border-chunky border-ink bg-cream text-2xl shadow-hard-sm disabled:opacity-40 sm:h-12"
          >
            <span aria-hidden="true">{reaction}</span>
          </button>
        ))}
      </div>
    </Card>
  )
}

function PlayerReveal({ snapshot, playerId, reactionCooling, onReact }) {
  const result = snapshot.reveal.results.find((entry) => entry.playerId === playerId)

  return (
    <main className="safe-player-screen dot-grid centre-column bg-cream text-ink">
      <div className="mx-auto flex h-full max-h-full w-full max-w-md flex-col justify-center py-2">
        <Card fill="white" tilt="left" className={`${result?.correct ? '!bg-lime' : '!bg-sunshine'} w-full p-4 text-center sm:p-6`}>
          {result?.correct ? <Check className="mx-auto" size={44} weight="bold" /> : <X className="mx-auto" size={44} weight="bold" />}
          <p className="mt-1 font-display text-2xl font-bold sm:text-3xl">
            {result?.correct ? 'Good catch.' : result?.answered ? 'Not this time.' : 'No answer recorded.'}
          </p>
          <p className="mt-1 font-display text-lg font-bold sm:text-xl">+{result?.score ?? 0} points</p>
          <p className="mt-3 border-t-chunky border-ink pt-2 font-body text-base font-semibold">Look up for the room explanation.</p>
        </Card>
        <ReactionBar disabled={reactionCooling} onReact={onReact} />
      </div>
    </main>
  )
}

function PhoneScoreboard({ snapshot, playerId }) {
  const ranked = [...snapshot.players].sort((a, b) => b.score - a.score)
  const player = ranked.find((entry) => entry.id === playerId)
  const place = ranked.findIndex((entry) => entry.id === playerId) + 1

  return (
    <main className="safe-player-screen dot-grid centre-column bg-cream text-ink">
      <div className="mx-auto w-full max-w-md">
        <Card fill="white" tilt="right" className="w-full p-6 text-center sm:p-8">
          <Ticket className="mx-auto" size={48} weight="fill" />
          <p className="mt-2 font-display text-xs font-bold uppercase tracking-[0.08em]">Final Scoreboard</p>
          <h1 className="font-display text-4xl font-bold sm:text-5xl">#{place}</h1>
          <AvatarBadge avatar={player?.avatar} size={48} className="mx-auto mt-2" />
          <p className="safe-copy mt-2 font-display text-2xl font-bold">{player?.name}</p>
          <p className="font-display text-3xl font-bold">{player?.score} pts</p>
          <p className="mt-2 font-body text-sm font-bold text-ink/80">{snapshot.titles?.[playerId]}</p>
          <p className="mt-4 font-body text-xs font-semibold text-ink/70">
            The host can show the room recap, add the bonus round, or play again. Stay connected.
          </p>
        </Card>
      </div>
    </main>
  )
}

export function PlayerScreen() {
  const navigate = useNavigate()
  const sound = useSessionSound()
  const queryCode = new URLSearchParams(window.location.search).get('room') ?? ''
  const [roomCode, setRoomCode] = useState(queryCode.toUpperCase())
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('cat')
  const [status, setStatus] = useState('join')
  const [formError, setFormError] = useState('')
  const [snapshot, setSnapshot] = useState(null)
  const [clockOffset, setClockOffset] = useState(0)
  const [pending, setPending] = useState('')
  const [selections, setSelections] = useState([])
  const [reactionCooling, setReactionCooling] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const connectionRef = useRef(null)
  const unsubscribeRef = useRef(null)
  const snapshotTimeoutRef = useRef(null)
  const hasSnapshotRef = useRef(false)
  const roundIdRef = useRef(null)
  const lastSnapshotAtRef = useRef(0)
  const lastSoundPhaseRef = useRef('')
  const reactionTimerRef = useRef(null)
  const retrySubmissionRef = useRef(null)

  const disconnect = async () => {
    window.clearTimeout(snapshotTimeoutRef.current)
    unsubscribeRef.current?.()
    unsubscribeRef.current = null
    await connectionRef.current?.leave()
    connectionRef.current = null
  }

  useEffect(() => () => {
    window.clearTimeout(snapshotTimeoutRef.current)
    window.clearTimeout(reactionTimerRef.current)
    unsubscribeRef.current?.()
    connectionRef.current?.leave()
  }, [])

  useEffect(() => {
    const grantWakeGrace = () => {
      if (document.visibilityState === 'visible') lastSnapshotAtRef.current = Date.now()
    }
    document.addEventListener('visibilitychange', grantWakeGrace)
    return () => document.removeEventListener('visibilitychange', grantWakeGrace)
  }, [])

  useEffect(() => {
    if (status !== 'connected') return undefined
    const watchdog = window.setInterval(() => {
      if (Date.now() - lastSnapshotAtRef.current > 12_000) setStatus('connection-lost')
    }, 1_000)
    return () => window.clearInterval(watchdog)
  }, [status])

  const submitJoin = async (event) => {
    event.preventDefault()
    const validation = validatePlayerName(name, 'en')
    if (!validation.valid) { setFormError(validation.error); return }
    if (!/^[ABCDEFGHJKMNPQRSTUVWXYZ]{4}$/.test(roomCode)) { setFormError('Enter the four-letter code shown on the host screen.'); return }

    setStatus('connecting')
    setFormError('')
    hasSnapshotRef.current = false

    try {
      const connection = await joinPlayerRoom({ roomCode, name, avatar })
      connectionRef.current = connection
      snapshotTimeoutRef.current = window.setTimeout(() => {
        if (!hasSnapshotRef.current) disconnect().finally(() => setStatus('not-found'))
      }, 5_000)

      unsubscribeRef.current = connection.subscribe((message, metadata) => {
        if (message.type !== 'state') return
        hasSnapshotRef.current = true
        lastSnapshotAtRef.current = Date.now()
        window.clearTimeout(snapshotTimeoutRef.current)

        const ownId = connection.playerId
        const ownPlayer = message.snapshot.players.find((entry) => entry.id === ownId)

        if (!ownPlayer && message.snapshot.players.filter((entry) => entry.connected).length >= 8) {
          setSnapshot(message.snapshot)
          setStatus('room-full')
          return
        }

        if (roundIdRef.current !== message.snapshot.currentRoundId || message.snapshot.currentPhase === PHASES.LOBBY) {
          setPending('')
          setSelections([])
          roundIdRef.current = message.snapshot.currentRoundId
        }

        if (lastSoundPhaseRef.current !== message.snapshot.currentPhase) {
          lastSoundPhaseRef.current = message.snapshot.currentPhase
          if (revealPhases.includes(message.snapshot.currentPhase)) {
            const result = message.snapshot.reveal?.results.find((entry) => entry.playerId === ownId)
            sound.play(result?.correct ? SOUND_CUES.CORRECT : SOUND_CUES.INCORRECT)
          } else if (message.snapshot.currentPhase === PHASES.SCOREBOARD) {
            sound.play(SOUND_CUES.SCOREBOARD)
          } else if (message.snapshot.currentPhase === PHASES.LOBBY && ownPlayer) {
            sound.play(SOUND_CUES.BLIP)
          }
        }

        setClockOffset(metadata.clockOffset)
        setSnapshot(message.snapshot)
        setStatus('connected')
      })
    } catch {
      setStatus('connection-lost')
    }
  }

  const submitAnswer = async (round, intent, marker, retrying = false) => {
    if (pending) return
    setPending(marker)
    setSubmitError('')
    sound.play(SOUND_CUES.LOCK)
    try {
      await connectionRef.current.send({ type: 'answer', round, intent })
    } catch {
      setPending('')
      if (retrying) {
        setStatus('connection-lost')
      } else {
        retrySubmissionRef.current = { round, intent, marker }
        setSubmitError('Your answer did not send. Check the connection and retry once.')
      }
    }
  }

  const retryAnswer = () => {
    const retry = retrySubmissionRef.current
    if (!retry) return
    retrySubmissionRef.current = null
    submitAnswer(retry.round, retry.intent, retry.marker, true)
  }

  const sendReaction = async (reaction) => {
    if (reactionCooling) return
    setReactionCooling(true)
    window.clearTimeout(reactionTimerRef.current)
    reactionTimerRef.current = window.setTimeout(() => setReactionCooling(false), REACTION_COOLDOWN_MS)
    try {
      await connectionRef.current.send({ type: 'react', reaction })
    } catch {
      setStatus('connection-lost')
    }
  }

  const handleBackClick = () => {
    if (status === 'join') {
      navigate('/')
    } else {
      setShowLeaveConfirm(true)
    }
  }

  const handleConfirmLeave = () => {
    setShowLeaveConfirm(false)
    disconnect().finally(() => navigate('/'))
  }

  const soundToggle = (
    <TopRail onBack={handleBackClick} backAriaLabel="Leave Game">
      <SoundToggle muted={sound.muted} onToggle={sound.toggleMuted} />
    </TopRail>
  )

  if (status === 'connecting') return <>{soundToggle}<LoadingState message="Looking for the room..." /></>
  if (status === 'not-found') return <>{soundToggle}<ErrorState icon={Ticket} message="We could not find that room. Check the code with the host." actionLabel="Try Another Code" onAction={() => { setSnapshot(null); setPending(''); setStatus('join') }} /></>
  if (status === 'room-full') return <>{soundToggle}<ErrorState icon={UsersThree} message="That room already has eight players." actionLabel="Try Another Room" onAction={() => disconnect().finally(() => setStatus('join'))} /></>
  if (status === 'connection-lost') return <>{soundToggle}<ErrorState icon={Plugs} message="The host left. Head back to the menu to start a new game." actionLabel="Back to Menu" onAction={() => { disconnect().finally(() => navigate('/')) }} /></>
  if (status === 'join') return <>{soundToggle}<JoinForm roomCode={roomCode} setRoomCode={setRoomCode} name={name} setName={setName} avatar={avatar} setAvatar={setAvatar} error={formError} onSubmit={submitJoin} /></>
  if (!snapshot) return <>{soundToggle}<LoadingState message="Waiting for the host..." /></>

  const playerId = connectionRef.current?.playerId
  let currentContent

  if (snapshot.currentPhase === PHASES.LOBBY) {
    currentContent = <WaitingRoom snapshot={snapshot} playerId={playerId} roomCode={roomCode} />
  } else if (snapshot.currentPhase === PHASES.ODD_QUESTION) {
    currentContent = <OddQuestion snapshot={snapshot} playerId={playerId} clockOffset={clockOffset} pending={pending} submit={submitAnswer} onSecondChange={sound.onCountdownSecond} />
  } else if (snapshot.currentPhase === PHASES.SPIN_QUESTION) {
    currentContent = <SpinQuestion snapshot={snapshot} playerId={playerId} clockOffset={clockOffset} selections={selections} setSelections={setSelections} pending={pending} submit={submitAnswer} onSecondChange={sound.onCountdownSecond} />
  } else if (snapshot.currentPhase === PHASES.RENDER_QUESTION) {
    currentContent = <RenderQuestion snapshot={snapshot} playerId={playerId} clockOffset={clockOffset} pending={pending} submit={submitAnswer} onSecondChange={sound.onCountdownSecond} />
  } else if (snapshot.currentPhase === PHASES.CHAIN_QUESTION) {
    currentContent = <ChainQuestion snapshot={snapshot} playerId={playerId} clockOffset={clockOffset} selections={selections} setSelections={setSelections} pending={pending} submit={submitAnswer} onSecondChange={sound.onCountdownSecond} />
  } else if (revealPhases.includes(snapshot.currentPhase)) {
    currentContent = <PlayerReveal snapshot={snapshot} playerId={playerId} reactionCooling={reactionCooling} onReact={sendReaction} />
  } else if (snapshot.currentPhase === PHASES.SCOREBOARD) {
    currentContent = <PhoneScoreboard snapshot={snapshot} playerId={playerId} />
  } else {
    currentContent = <WaitingRoom snapshot={snapshot} playerId={playerId} roomCode={roomCode} />
  }

  return (
    <>
      {!questionPhases.includes(snapshot.currentPhase) && !revealPhases.includes(snapshot.currentPhase) && soundToggle}
      {currentContent}
      {submitError && (
        <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-[16px] border-chunky border-ink bg-white p-3 shadow-hard" role="alert">
          <p className="font-body text-base font-semibold">{submitError}</p>
          <button type="button" onClick={retryAnswer} className="press-sm mt-2 min-h-12 w-full rounded-[12px] border-chunky border-ink bg-sunshine px-4 font-display text-base font-bold shadow-hard-sm">
            Retry Answer
          </button>
        </div>
      )}
      <LeaveConfirmModal
        open={showLeaveConfirm}
        onConfirm={handleConfirmLeave}
        onCancel={() => setShowLeaveConfirm(false)}
        title="Leave Room?"
        message="Are you sure you want to leave this game room and return to the main menu?"
      />
    </>
  )
}
