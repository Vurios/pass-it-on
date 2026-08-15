import { useEffect, useRef, useState } from 'react'
import { ArrowsDownUp, Check, Hourglass, Pause, Plugs, Ticket, UsersThree, X } from '@phosphor-icons/react'
import { AvatarBadge, AVATAR_OPTIONS } from '../components/AvatarBadge.jsx'
import { BigButton } from '../components/BigButton.jsx'
import { Card } from '../components/Card.jsx'
import { CarnivalTent } from '../components/CarnivalTent.jsx'
import { CountdownBar } from '../components/CountdownBar.jsx'
import { ErrorState } from '../components/ErrorState.jsx'
import { FabricatedStamp } from '../components/FabricatedStamp.jsx'
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

function PausedOverlay() {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-ink/75 p-6">
      <Card fill="white" tilt="left" className="w-full max-w-sm p-9 text-center">
        <Pause className="mx-auto" size={64} weight="fill" />
        <p className="mt-3 font-display text-5xl font-bold">Paused</p>
        <p className="mt-2 font-body text-lg font-semibold">The host froze the clock.</p>
      </Card>
    </div>
  )
}

function JoinForm({ roomCode, setRoomCode, name, setName, avatar, setAvatar, error, onSubmit }) {
  return <main className="safe-player-screen dot-grid screen-min-h bg-cream text-ink"><div className="mx-auto w-full max-w-lg">
    <CarnivalTent className="mx-auto w-44" /><h1 className="mt-1 text-center font-display text-5xl font-bold">Join the room</h1><p className="mt-3 text-center font-body text-lg font-semibold">Pick your game-show name and animal.</p>
    <Card fill="white" tilt="left" className="mt-7 p-6"><form onSubmit={onSubmit} noValidate>
      <label htmlFor="player-name" className="font-body font-bold">Your name</label><input id="player-name" value={name} maxLength={20} autoComplete="nickname" onChange={(event) => setName(event.target.value)} className="mt-2 min-h-16 w-full rounded-[14px] border-chunky border-ink bg-cream px-4 font-body text-xl font-bold shadow-hard-sm focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ink" />
      <label htmlFor="room-code" className="mt-6 block font-body font-bold">Room code</label><input id="room-code" value={roomCode} maxLength={4} autoCapitalize="characters" autoComplete="off" onChange={(event) => setRoomCode(event.target.value.toUpperCase())} className="mt-2 min-h-16 w-full rounded-[14px] border-chunky border-ink bg-cream px-4 text-center font-display text-3xl font-bold uppercase tracking-[0.16em] shadow-hard-sm focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ink" />
      <fieldset className="mt-6"><legend className="font-body font-bold">Choose an animal</legend><div className="mt-3 grid grid-cols-4 gap-3">{AVATAR_OPTIONS.map((option) => { const selected = avatar === option.id; return <button key={option.id} type="button" aria-label={option.label} aria-pressed={selected} onClick={() => setAvatar(option.id)} className={`${selected ? 'press-held-sm bg-sunshine' : 'press-sm bg-cream shadow-hard-sm'} grid min-h-20 place-items-center rounded-[16px] border-chunky border-ink focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ink`}><option.Icon size={42} weight="fill" /></button> })}</div></fieldset>
      {error && <p className="mt-5 rounded-[12px] border-chunky border-ink bg-coral p-3 font-body font-bold" role="alert">{error}</p>}<BigButton variant="ocean" type="submit" className="mt-7">Join game</BigButton>
    </form></Card>
  </div></main>
}

function WaitingRoom({ snapshot, playerId, roomCode }) {
  const player = snapshot.players.find((entry) => entry.id === playerId)
  return <main className="safe-player-screen dot-grid centre-column bg-cream text-ink"><div className="mx-auto max-w-lg"><Card fill="white" tilt="right" className="w-full p-7 text-center">
    {player ? <AvatarBadge avatar={player.avatar} size={70} className="mx-auto" /> : <Hourglass className="mx-auto" size={72} weight="fill" />}<p className="mt-5 font-display text-xl font-bold uppercase">Room {roomCode}</p><h1 className="safe-copy mt-2 font-display text-4xl font-bold">{player ? `You're in, ${player.name}.` : 'Finding your seat...'}</h1><p className="mt-4 font-body text-xl font-semibold">Look up at the host screen. The show starts there.</p>
  </Card></div></main>
}

function PlayerFrame({ snapshot, playerId, clockOffset, onSecondChange, children }) {
  const player = snapshot.players.find((entry) => entry.id === playerId)
  return <main className="safe-player-screen dot-grid flex screen-min-h flex-col bg-cream text-ink"><div className="mx-auto flex w-full max-w-lg flex-1 flex-col">
    <div className="flex items-center justify-between gap-3"><p className="font-display text-lg font-bold uppercase tracking-[0.08em]">Pass It On</p><AvatarBadge avatar={player?.avatar} size={34} /></div>
    <div className="flex-1">{children}</div>
    {snapshot.timerEndsAt !== null && !snapshot.paused && <div className="countdown-dock"><CountdownBar startTimestamp={snapshot.timerStartedAt} endTimestamp={snapshot.timerEndsAt} clockOffset={clockOffset} onSecondChange={onSecondChange} /></div>}
    {snapshot.paused && <PausedOverlay />}
  </div></main>
}

function OddQuestion({ snapshot, playerId, clockOffset, pending, submit, onSecondChange }) {
  const player = snapshot.players.find((entry) => entry.id === playerId); const locked = Boolean(player?.hasAnswered || pending)
  return <PlayerFrame snapshot={snapshot} playerId={playerId} clockOffset={clockOffset} onSecondChange={onSecondChange}><h1 className="mt-4 font-display text-4xl font-bold">Pick a source</h1><p className="mt-3 font-body text-lg font-semibold">Read the four headlines on the host screen.</p>
    <div className="mt-7 grid grid-cols-2 gap-5">{snapshot.publicQuestion.choices.map((choice) => <BigButton key={choice.id} variant={choice.colour} disabled={locked || snapshot.paused} onClick={() => submit('odd', { answerId: choice.id }, choice.id)} className="min-h-32 flex-col gap-2 text-5xl">{choice.label}{pending === choice.id && <Check size={38} weight="bold" />}</BigButton>)}</div>
  </PlayerFrame>
}

function SpinQuestion({ snapshot, playerId, clockOffset, selections, setSelections, pending, submit, onSecondChange }) {
  const player = snapshot.players.find((entry) => entry.id === playerId); const locked = Boolean(player?.hasAnswered || pending)
  const toggle = (index) => {
    if (locked || snapshot.paused) return
    const next = selections.includes(index) ? selections.filter((entry) => entry !== index) : [...selections, index]
    if (next.length > 3) return
    setSelections(next)
    if (next.length === 3) submit('spin', { selections: next }, 'spin')
  }
  return <PlayerFrame snapshot={snapshot} playerId={playerId} clockOffset={clockOffset} onSecondChange={onSecondChange}><p className="mt-4 font-display text-lg font-bold uppercase">Round 2: choose up to 3</p><h1 className="font-display text-4xl font-bold">Spot the spin</h1>
    <div className="mt-6 flex flex-wrap gap-3">{snapshot.publicQuestion.phrases.map((phrase, index) => <button key={`${phrase}-${index}`} type="button" disabled={locked} aria-pressed={selections.includes(index)} onClick={() => toggle(index)} className={`${selections.includes(index) ? 'press-held-sm bg-coral' : 'press-sm bg-white shadow-hard-sm'} safe-copy min-h-16 max-w-full rounded-[14px] border-chunky border-ink px-4 py-3 text-left font-display text-xl font-bold focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ink`}>{phrase}</button>)}</div>
    <BigButton variant="coral" className="mt-7" disabled={locked || selections.length === 0 || snapshot.paused} onClick={() => submit('spin', { selections }, 'spin')}>{locked ? 'Answer locked' : `Submit ${selections.length}/3`}</BigButton>
  </PlayerFrame>
}

function RenderQuestion({ snapshot, playerId, clockOffset, pending, submit, onSecondChange }) {
  const player = snapshot.players.find((entry) => entry.id === playerId); const locked = Boolean(player?.hasAnswered || pending)
  return <PlayerFrame snapshot={snapshot} playerId={playerId} clockOffset={clockOffset} onSecondChange={onSecondChange}><p className="mt-4 font-display text-lg font-bold uppercase">Round 3: {snapshot.publicQuestion.itemNumber}/{snapshot.publicQuestion.itemTotal}</p><h1 className="font-display text-4xl font-bold">Real or rendered?</h1><p className="safe-copy mt-4 rounded-[14px] border-chunky border-ink bg-white p-4 font-body text-lg font-semibold">{snapshot.publicQuestion.material.prompt}</p>
    <div className="mt-6 grid min-h-[42dvh] grid-rows-2 gap-5"><BigButton variant="lime" className="h-full text-5xl" disabled={locked || snapshot.paused} onClick={() => submit('render', { answer: 'real' }, 'real')}>REAL{pending === 'real' && <Check size={40} />}</BigButton><BigButton variant="coral" className="h-full text-5xl" disabled={locked || snapshot.paused} onClick={() => submit('render', { answer: 'rendered' }, 'rendered')}>RENDERED{pending === 'rendered' && <Check size={40} />}</BigButton></div>
  </PlayerFrame>
}

function ChainQuestion({ snapshot, playerId, clockOffset, selections, setSelections, pending, submit, onSecondChange }) {
  const player = snapshot.players.find((entry) => entry.id === playerId); const locked = Boolean(player?.hasAnswered || pending)
  const choices = snapshot.publicQuestion.choices
  const tap = (choiceId) => {
    if (locked || snapshot.paused) return
    const next = selections.includes(choiceId) ? selections.filter((entry) => entry !== choiceId) : [...selections, choiceId]
    if (next.length > choices.length) return
    setSelections(next)
    if (next.length === choices.length) submit('chain', { order: next }, 'chain')
  }
  return <PlayerFrame snapshot={snapshot} playerId={playerId} clockOffset={clockOffset} onSecondChange={onSecondChange}>
    <p className="mt-4 font-display text-lg font-bold uppercase">Bonus round</p>
    <h1 className="font-display text-4xl font-bold">Order the chain</h1>
    <p className="mt-3 font-body text-lg font-semibold">Read the four retellings on the host screen, then tap them oldest first.</p>
    <div className="mt-6 grid grid-cols-2 gap-5">{choices.map((choice) => { const position = selections.indexOf(choice.id); const chosen = position >= 0; return <BigButton key={choice.id} variant={choice.colour} disabled={locked || snapshot.paused} aria-pressed={chosen} onClick={() => tap(choice.id)} className={`${chosen ? 'press-held' : ''} min-h-32 flex-col gap-2 text-5xl`}>{choice.label}<span className="grid h-10 w-10 place-items-center rounded-full border-chunky border-ink bg-paper font-display text-2xl">{chosen ? position + 1 : '·'}</span></BigButton> })}</div>
    <div className="mt-6 grid gap-4"><BigButton variant="sunshine" className="gap-2" disabled={locked || selections.length === 0} onClick={() => setSelections([])}><ArrowsDownUp size={26} weight="bold" aria-hidden="true" />Start over</BigButton><p className="text-center font-body text-lg font-bold">{locked ? 'Chain locked. Look up.' : `${selections.length} of ${choices.length} placed`}</p></div>
  </PlayerFrame>
}

function ReactionBar({ disabled, onReact }) {
  return (
    <Card fill="white" tilt="right" className="mt-5 p-4 text-center">
      <p className="font-display text-lg font-bold">React to the reveal</p>
      <div className="mt-3 grid grid-cols-4 gap-3">
        {REALTIME_REACTIONS.map((reaction) => (
          <button
            key={reaction}
            type="button"
            disabled={disabled}
            onClick={() => onReact(reaction)}
            aria-label={`React ${reaction}`}
            className="press-sm grid min-h-16 place-items-center rounded-[14px] border-chunky border-ink bg-cream text-3xl shadow-hard-sm focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:opacity-40"
          >
            <span aria-hidden="true">{reaction}</span>
          </button>
        ))}
      </div>
      {disabled && <p className="mt-3 font-body text-sm font-bold">Reaction sent. More in a moment.</p>}
    </Card>
  )
}

function PlayerReveal({ snapshot, playerId, reactionCooling, onReact }) {
  const player = snapshot.players.find((entry) => entry.id === playerId); const result = snapshot.reveal.results.find((entry) => entry.playerId === playerId); const isSpin = snapshot.currentPhase === PHASES.SPIN_REVEAL; const chainOrder = snapshot.reveal.chainOrder
  return <main className="safe-player-screen dot-grid centre-column bg-cream text-ink"><div className="mx-auto max-w-lg"><Card fill="white" tilt="left" className={`${result?.correct ? '!bg-lime' : '!bg-sunshine'} w-full p-7 text-center`}>
    {result?.correct ? <Check className="mx-auto" size={68} weight="bold" /> : <X className="mx-auto" size={68} weight="bold" />}<p className="mt-3 font-display text-4xl font-bold">{result?.correct ? 'Good catch.' : result?.answered ? 'Not this time.' : 'No answer recorded.'}</p><p className="mt-2 font-display text-2xl font-bold">+{result?.score ?? 0} points</p>
    {isSpin && <div className="mt-6 flex flex-wrap gap-2 text-left">{snapshot.reveal.correctAnswer.map((index) => <span key={index} className={`${result?.selected?.includes(index) ? 'bg-lime' : 'bg-paper'} rounded-[10px] border-chunky border-ink px-3 py-2 font-body text-sm font-bold`}>{result?.selected?.includes(index) ? snapshot.reveal.technique : 'Missed flag'} · phrase {index + 1}</span>)}{(result?.selected ?? []).filter((index) => !snapshot.reveal.correctAnswer.includes(index)).map((index) => <span key={`wrong-${index}`} className="rounded-[10px] border-chunky border-ink bg-coral px-3 py-2 font-body text-sm font-bold">Wrong flag · phrase {index + 1}</span>)}</div>}
    {chainOrder && <ol className="mt-6 grid gap-3 text-left">{chainOrder.map((retelling, index) => <li key={retelling.id} className={`${result?.selected?.[index] === retelling.id ? 'bg-lime' : 'bg-paper'} rounded-[12px] border-chunky border-ink p-3`}><p className="font-display text-lg font-bold">{index + 1}. {retelling.label}</p><p className="safe-copy font-body text-sm font-semibold">{retelling.text}</p></li>)}</ol>}
    <div className="mt-6 border-t-chunky border-ink pt-5 text-left"><h2 className="safe-copy font-display text-3xl font-bold">{snapshot.reveal.technique}</h2><p className="safe-copy mt-3 font-body text-lg font-semibold">{snapshot.reveal.explanation}</p>{snapshot.reveal.fabricated && <FabricatedStamp className="mt-5" />}</div><p className="mt-6 font-display text-2xl font-bold">Total: {player?.score ?? 0}</p>
  </Card><ReactionBar disabled={reactionCooling} onReact={onReact} /></div></main>
}

function PhoneScoreboard({ snapshot, playerId }) {
  const ranked = [...snapshot.players].sort((a, b) => b.score - a.score); const player = ranked.find((entry) => entry.id === playerId); const place = ranked.findIndex((entry) => entry.id === playerId) + 1
  return <main className="safe-player-screen dot-grid centre-column bg-cream text-ink"><div className="mx-auto max-w-lg"><Card fill="white" tilt="right" className="w-full p-8 text-center"><Ticket className="mx-auto" size={70} weight="fill" /><p className="mt-4 font-display text-lg font-bold uppercase">Final scoreboard</p><h1 className="font-display text-6xl font-bold">#{place}</h1><AvatarBadge avatar={player?.avatar} size={64} className="mx-auto mt-4" /><p className="safe-copy mt-3 font-display text-3xl font-bold">{player?.name}</p><p className="font-display text-5xl font-bold">{player?.score} pts</p><p className="mt-3 font-body text-xl font-bold">{snapshot.titles?.[playerId]}</p><p className="mt-7 font-body text-lg font-semibold">The host can show the room recap, add the bonus round, or play again. Stay connected.</p></Card></div></main>
}

export function PlayerScreen() {
  const sound = useSessionSound()
  const queryCode = new URLSearchParams(window.location.search).get('room') ?? ''
  const [roomCode, setRoomCode] = useState(queryCode.toUpperCase()); const [name, setName] = useState(''); const [avatar, setAvatar] = useState('cat'); const [status, setStatus] = useState('join'); const [formError, setFormError] = useState(''); const [snapshot, setSnapshot] = useState(null); const [clockOffset, setClockOffset] = useState(0); const [pending, setPending] = useState(''); const [selections, setSelections] = useState([])
  const [reactionCooling, setReactionCooling] = useState(false)
  const connectionRef = useRef(null); const unsubscribeRef = useRef(null); const snapshotTimeoutRef = useRef(null); const hasSnapshotRef = useRef(false); const roundIdRef = useRef(null); const lastSnapshotAtRef = useRef(0); const lastSoundPhaseRef = useRef(''); const reactionTimerRef = useRef(null)
  const disconnect = async () => { window.clearTimeout(snapshotTimeoutRef.current); unsubscribeRef.current?.(); unsubscribeRef.current = null; await connectionRef.current?.leave(); connectionRef.current = null }
  useEffect(() => () => { window.clearTimeout(snapshotTimeoutRef.current); window.clearTimeout(reactionTimerRef.current); unsubscribeRef.current?.(); connectionRef.current?.leave() }, [])
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
    event.preventDefault(); const validation = validatePlayerName(name, 'en'); if (!validation.valid) { setFormError(validation.error); return } if (!/^[ABCDEFGHJKMNPQRSTUVWXYZ]{4}$/.test(roomCode)) { setFormError('Enter the four-letter code shown on the host screen.'); return }
    setStatus('connecting'); setFormError(''); hasSnapshotRef.current = false
    try { const connection = await joinPlayerRoom({ roomCode, name, avatar }); connectionRef.current = connection; snapshotTimeoutRef.current = window.setTimeout(() => { if (!hasSnapshotRef.current) disconnect().finally(() => setStatus('not-found')) }, 5_000); unsubscribeRef.current = connection.subscribe((message, metadata) => { if (message.type !== 'state') return; hasSnapshotRef.current = true; lastSnapshotAtRef.current = Date.now(); window.clearTimeout(snapshotTimeoutRef.current); const ownId = connection.playerId; const ownPlayer = message.snapshot.players.find((entry) => entry.id === ownId); if (!ownPlayer && message.snapshot.players.filter((entry) => entry.connected).length >= 8) { setSnapshot(message.snapshot); setStatus('room-full'); return } if (roundIdRef.current !== message.snapshot.currentRoundId || message.snapshot.currentPhase === PHASES.LOBBY) { setPending(''); setSelections([]); roundIdRef.current = message.snapshot.currentRoundId } if (lastSoundPhaseRef.current !== message.snapshot.currentPhase) { lastSoundPhaseRef.current = message.snapshot.currentPhase; if (revealPhases.includes(message.snapshot.currentPhase)) { const result = message.snapshot.reveal?.results.find((entry) => entry.playerId === ownId); sound.play(result?.correct ? SOUND_CUES.CORRECT : SOUND_CUES.INCORRECT) } else if (message.snapshot.currentPhase === PHASES.SCOREBOARD) sound.play(SOUND_CUES.SCOREBOARD); else if (message.snapshot.currentPhase === PHASES.LOBBY && ownPlayer) sound.play(SOUND_CUES.BLIP) } setClockOffset(metadata.clockOffset); setSnapshot(message.snapshot); setStatus('connected') }) } catch { setStatus('connection-lost') }
  }
  const submitAnswer = async (round, intent, marker) => { if (pending) return; setPending(marker); sound.play(SOUND_CUES.LOCK); try { await connectionRef.current.send({ type: 'answer', round, intent }) } catch { setPending(''); setStatus('connection-lost') } }
  const sendReaction = async (reaction) => {
    if (reactionCooling) return
    setReactionCooling(true)
    window.clearTimeout(reactionTimerRef.current)
    reactionTimerRef.current = window.setTimeout(() => setReactionCooling(false), REACTION_COOLDOWN_MS)
    try { await connectionRef.current.send({ type: 'react', reaction }) } catch { setStatus('connection-lost') }
  }
  const soundToggle = <TopRail><SoundToggle muted={sound.muted} onToggle={sound.toggleMuted} /></TopRail>
  if (status === 'connecting') return <>{soundToggle}<LoadingState message="Looking for the room..." /></>
  if (status === 'not-found') return <>{soundToggle}<ErrorState icon={Ticket} message="We could not find that room. Check the code with the host." actionLabel="Try another code" onAction={() => { setSnapshot(null); setPending(''); setStatus('join') }} /></>
  if (status === 'room-full') return <>{soundToggle}<ErrorState icon={UsersThree} message="That room already has eight players." actionLabel="Try another room" onAction={() => disconnect().finally(() => setStatus('join'))} /></>
  if (status === 'connection-lost') return <>{soundToggle}<ErrorState icon={Plugs} message="The connection was lost. Your seat is still saved on this phone." actionLabel="Reconnect" onAction={() => { disconnect().finally(() => setStatus('join')) }} /></>
  if (status === 'join') return <>{soundToggle}<JoinForm roomCode={roomCode} setRoomCode={setRoomCode} name={name} setName={setName} avatar={avatar} setAvatar={setAvatar} error={formError} onSubmit={submitJoin} /></>
  if (!snapshot) return <>{soundToggle}<LoadingState message="Waiting for the host..." /></>
  const playerId = connectionRef.current.playerId
  if (snapshot.currentPhase === PHASES.LOBBY) return <>{soundToggle}<WaitingRoom snapshot={snapshot} playerId={playerId} roomCode={roomCode} /></>
  if (snapshot.currentPhase === PHASES.ODD_QUESTION) return <>{soundToggle}<OddQuestion snapshot={snapshot} playerId={playerId} clockOffset={clockOffset} pending={pending} submit={submitAnswer} onSecondChange={sound.onCountdownSecond} /></>
  if (snapshot.currentPhase === PHASES.SPIN_QUESTION) return <>{soundToggle}<SpinQuestion snapshot={snapshot} playerId={playerId} clockOffset={clockOffset} selections={selections} setSelections={setSelections} pending={pending} submit={submitAnswer} onSecondChange={sound.onCountdownSecond} /></>
  if (snapshot.currentPhase === PHASES.RENDER_QUESTION) return <>{soundToggle}<RenderQuestion snapshot={snapshot} playerId={playerId} clockOffset={clockOffset} pending={pending} submit={submitAnswer} onSecondChange={sound.onCountdownSecond} /></>
  if (snapshot.currentPhase === PHASES.CHAIN_QUESTION) return <>{soundToggle}<ChainQuestion snapshot={snapshot} playerId={playerId} clockOffset={clockOffset} selections={selections} setSelections={setSelections} pending={pending} submit={submitAnswer} onSecondChange={sound.onCountdownSecond} /></>
  if (revealPhases.includes(snapshot.currentPhase)) return <>{soundToggle}<PlayerReveal snapshot={snapshot} playerId={playerId} reactionCooling={reactionCooling} onReact={sendReaction} /></>
  if (snapshot.currentPhase === PHASES.SCOREBOARD) return <>{soundToggle}<PhoneScoreboard snapshot={snapshot} playerId={playerId} /></>
  return <>{soundToggle}<WaitingRoom snapshot={snapshot} playerId={playerId} roomCode={roomCode} /></>
}
