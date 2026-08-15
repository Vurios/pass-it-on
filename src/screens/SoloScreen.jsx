import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowsDownUp,
  Article,
  Check,
  ImageSquare,
  Play,
  SealCheck,
  Star,
  UsersThree,
  X,
} from '@phosphor-icons/react'
import confetti from 'canvas-confetti'
import { Link } from 'react-router-dom'
import { BigButton } from '../components/BigButton.jsx'
import { Card } from '../components/Card.jsx'
import { CountdownBar } from '../components/CountdownBar.jsx'
import { FabricatedStamp } from '../components/FabricatedStamp.jsx'
import { RecapCard } from '../components/RecapCard.jsx'
import { SoundToggle } from '../components/SoundToggle.jsx'
import { TopRail } from '../components/TopRail.jsx'
import { SOUND_CUES } from '../audio/soundSystem.js'
import { useSessionSound } from '../audio/useSessionSound.js'
import { createGameSession } from '../content/gameSessions.js'
import {
  PHASES,
  assignPlayerTitles,
  createInitialGameState,
  gameReducer,
} from '../game/gameReducer.js'

const sourceColours = ['bg-ocean', 'bg-coral', 'bg-lime', 'bg-sunshine']
const sourceRevealColours = ['!bg-ocean', '!bg-coral', '!bg-lime', '!bg-sunshine']

const soloSession = createGameSession('en')

function useRevealConfetti(state) {
  const firedFor = useRef(null)

  useEffect(() => {
    let revealKey = null
    let correct = false

    if (state.phase === PHASES.ODD_REVEAL) {
      revealKey = `odd-${state.session.oddItem.id}`
      correct = state.currentAnswer === state.session.oddItem.correctAnswer
    }
    if (state.phase === PHASES.RENDER_REVEAL) {
      const item = state.session.renderItems[state.renderIndex]
      revealKey = `render-${item.id}`
      correct = state.currentAnswer === item.correctAnswer
    }
    if (state.phase === PHASES.SPIN_REVEAL) {
      const correctAnswers = state.session.spinItem.correctAnswer
      revealKey = `spin-${state.session.spinItem.id}`
      correct = state.currentAnswer.some((index) => correctAnswers.includes(index))
    }
    if (state.phase === PHASES.CHAIN_REVEAL) {
      revealKey = `chain-${state.session.chainItem.id}`
      correct = (state.player.answers.at(-1)?.score ?? 0) > 0
    }

    if (!correct || !revealKey || firedFor.current === revealKey) return
    firedFor.current = revealKey
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#FF5A5F', '#FFC53D', '#2E86AB', '#8BC34A'],
      disableForReducedMotion: true,
    })
  }, [state])
}

function GameHeader({ round, score, detail }) {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b-chunky border-ink pb-4">
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg font-bold uppercase tracking-[0.08em] host:text-5xl">{round}</p>
        {detail && <p className="safe-copy font-body text-base font-semibold host:text-5xl">{detail}</p>}
      </div>
      <div className="shrink-0 rounded-[14px] border-chunky border-ink bg-sunshine px-4 py-2 font-display text-2xl font-bold shadow-hard-sm host:text-5xl">
        {score} points
      </div>
    </header>
  )
}

function QuestionTimer({ state, onComplete, onSecondChange }) {
  return (
    <div className="countdown-dock">
      <CountdownBar
        key={`${state.phase}-${state.renderIndex}`}
        startTimestamp={state.phaseStartedAt}
        endTimestamp={state.timerEndsAt}
        clockOffset={0}
        onComplete={onComplete}
        onSecondChange={onSecondChange}
      />
    </div>
  )
}

function Lobby({ onStart }) {
  return (
    <main className="solo-host dot-grid centre-column bg-cream px-5 py-10 text-ink">
      <div className="mx-auto w-full max-w-3xl">
        <Card fill="white" tilt="left" className="game-screen p-7 text-center sm:p-10">
          <UsersThree className="mx-auto" size={74} weight="fill" aria-hidden="true" />
          <p className="mt-3 font-display text-lg font-bold uppercase tracking-[0.08em] host:text-5xl">One screen mode</p>
          <h1 className="mx-auto mt-2 max-w-2xl font-display text-5xl font-bold leading-none tracking-[-0.04em] sm:text-7xl host:text-8xl">
            Gather round. Read together.
          </h1>
          <p className="mx-auto mt-5 max-w-xl font-body text-xl font-medium leading-relaxed sm:text-2xl host:text-5xl">
            One person taps for the room. Three rounds, about four minutes, everyone answers out loud.
          </p>
          <div className="mx-auto mt-8 grid max-w-xl gap-4 sm:grid-cols-[1fr_auto]">
            <BigButton variant="coral" onClick={onStart} className="gap-3">
              <Play size={28} weight="fill" aria-hidden="true" />
              Start the game
            </BigButton>
            <BigButton as={Link} to="/" variant="sunshine" className="gap-2 sm:w-auto">
              <ArrowLeft size={25} weight="bold" aria-hidden="true" />
              Back
            </BigButton>
          </div>
        </Card>
      </div>
    </main>
  )
}

function OddQuestion({ state, dispatch, onTimeExpired, onSecondChange, onLock }) {
  const item = state.session.oddItem

  return (
    <GameLayout timer={<QuestionTimer state={state} onComplete={onTimeExpired} onSecondChange={onSecondChange} />}>
      <GameHeader round="Round 1: Odd Source Out" score={state.player.score} detail="Which source is least credible for checking this event?" />
      <h1 className="safe-copy text-center font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl host:text-8xl">{item.material.event}</h1>
      <div className="mt-7 grid gap-5 md:grid-cols-2">
        {item.material.sources.map((source, index) => (
          <button
            key={source.id}
            type="button"
            onClick={() => { onLock(); dispatch({ type: 'ANSWER_ODD', answerId: source.id, now: Date.now() }) }}
            className={`${sourceColours[index]} press min-h-44 rounded-[18px] border-chunky border-ink p-5 text-left text-ink shadow-hard focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ink`}
          >
            <span className="font-display text-4xl font-bold host:text-6xl">{source.label}</span>
            <span className="safe-copy ml-3 font-body text-base font-bold uppercase tracking-[0.06em] host:text-5xl">{source.source}</span>
            <span className="safe-copy mt-4 block font-display text-2xl font-semibold leading-tight sm:text-3xl host:text-5xl">{source.headline}</span>
          </button>
        ))}
      </div>
    </GameLayout>
  )
}

function OddReveal({ state, dispatch }) {
  const item = state.session.oddItem
  const isRight = state.currentAnswer === item.correctAnswer
  const answer = item.material.sources.find((source) => source.id === item.correctAnswer)

  return (
    <GameLayout>
      <GameHeader round="Round 1 reveal" score={state.player.score} detail={isRight ? 'Good catch.' : 'Here is the strongest warning sign.'} />
      <div className="grid gap-4 md:grid-cols-2 host:grid-cols-4">
        {item.material.sources.map((source, index) => {
          const correct = source.id === item.correctAnswer
          return (
            <Card
              key={source.id}
              fill="white"
              className={`${sourceRevealColours[index]} ${correct ? 'outline-8 outline-sunshine' : 'opacity-45'}`}
            >
              <p className="safe-copy font-display text-3xl font-bold host:text-5xl">{source.label}: {source.source}</p>
              <p className="safe-copy mt-3 font-body text-xl font-semibold leading-snug host:text-5xl">{source.headline}</p>
            </Card>
          )
        })}
      </div>
      <Card className="reveal-banner mt-6 bg-paper p-6" tilt="right">
        <div className="flex flex-wrap items-center gap-3">
          <SealCheck size={42} weight="fill" aria-hidden="true" />
          <h2 className="safe-copy font-display text-3xl font-bold host:text-6xl">{answer.source}: {item.technique}</h2>
          {item.fabricated && <FabricatedStamp />}
        </div>
        <p className="safe-copy mt-3 font-body text-xl font-medium leading-relaxed sm:text-2xl host:text-5xl">{item.explanation}</p>
      </Card>
      <BigButton variant="ocean" className="mx-auto mt-6 max-w-xl host:text-5xl" onClick={() => dispatch({ type: 'NEXT_PHASE', now: Date.now() })}>
        Next: Spin Doctor
      </BigButton>
    </GameLayout>
  )
}

function SpinQuestion({ state, dispatch, onTimeExpired, onSecondChange, onLock }) {
  const item = state.session.spinItem

  return (
    <GameLayout timer={<QuestionTimer state={state} onComplete={onTimeExpired} onSecondChange={onSecondChange} />}>
      <GameHeader round="Round 2: Spin Doctor" score={state.player.score} detail="Flag up to three phrases doing persuasive work." />
      <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-4 py-8">
        {item.material.phrases.map((phrase, index) => {
          const selected = state.spinSelections.includes(index)
          return (
            <button
              type="button"
              key={phrase}
              aria-pressed={selected}
              onClick={() => dispatch({ type: 'TOGGLE_SPIN', phraseIndex: index })}
              className={`${selected ? 'press-held bg-coral' : 'press bg-paper shadow-hard'} safe-copy min-h-16 max-w-full rounded-full border-chunky border-ink px-6 py-4 font-display text-2xl font-bold leading-tight focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ink sm:text-3xl host:text-6xl`}
            >
              {phrase}
            </button>
          )
        })}
      </div>
      <p className="text-center font-display text-xl font-bold host:text-5xl">{state.spinSelections.length} of 3 flagged</p>
      <BigButton
        variant="coral"
        className="mx-auto mt-5 max-w-xl host:text-5xl"
        disabled={state.spinSelections.length === 0}
        onClick={() => { onLock(); dispatch({ type: 'SUBMIT_SPIN', now: Date.now() }) }}
      >
        Lock these phrases
      </BigButton>
    </GameLayout>
  )
}

function SpinReveal({ state, dispatch }) {
  const item = state.session.spinItem
  const selected = new Set(state.currentAnswer)
  const correct = new Set(item.correctAnswer)

  return (
    <GameLayout>
      <GameHeader round="Round 2 reveal" score={state.player.score} detail="Scepticism needs evidence, not suspicion of everything." />
      <div className="mx-auto grid max-w-6xl gap-4 py-3 sm:grid-cols-2 host:grid-cols-4">
        {item.material.phrases.map((phrase, index) => {
          const isCorrectPhrase = correct.has(index)
          const isWrongFlag = selected.has(index) && !isCorrectPhrase
          return (
            <Card key={phrase} fill="white" className={isCorrectPhrase ? '!bg-coral' : ''}>
              <div className="flex items-start gap-3">
                {isCorrectPhrase && <Check size={32} weight="bold" aria-label="Manipulative phrase" />}
                {isWrongFlag && <X size={32} weight="bold" aria-label="Incorrect flag" />}
                <p className="safe-copy font-display text-2xl font-bold sm:text-3xl host:text-5xl">{phrase}</p>
              </div>
              {isCorrectPhrase && <p className="safe-copy mt-3 font-body text-lg font-bold host:text-5xl">{item.technique}</p>}
              {isWrongFlag && <p className="safe-copy mt-3 font-body text-lg font-bold host:text-5xl">This phrase was not one of the manipulation signals.</p>}
            </Card>
          )
        })}
      </div>
      <Card className="reveal-banner mt-5 bg-paper p-6" tilt="left">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="safe-copy font-display text-3xl font-bold host:text-6xl">{item.technique}</h2>
          {item.fabricated && <FabricatedStamp />}
        </div>
        <p className="safe-copy mt-3 font-body text-xl font-medium leading-relaxed sm:text-2xl host:text-5xl">{item.explanation}</p>
      </Card>
      <BigButton variant="lime" className="mx-auto mt-6 max-w-xl host:text-5xl" onClick={() => dispatch({ type: 'NEXT_PHASE', now: Date.now() })}>
        Next: Real or Rendered
      </BigButton>
    </GameLayout>
  )
}

function RenderQuestion({ state, dispatch, onTimeExpired, onSecondChange, onLock }) {
  const item = state.session.renderItems[state.renderIndex]
  const ItemIcon = item.material.kind === 'text' ? Article : ImageSquare

  return (
    <GameLayout timer={<QuestionTimer state={state} onComplete={onTimeExpired} onSecondChange={onSecondChange} />}>
      <GameHeader
        round="Round 3: Real or Rendered"
        score={state.player.score}
        detail={`Item ${state.renderIndex + 1} of ${state.session.renderItems.length}`}
      />
      <Card fill="white" tilt={state.renderIndex % 2 ? 'right' : 'left'} className="mx-auto flex min-h-64 max-w-5xl flex-col items-center justify-center p-8 text-center">
        <ItemIcon size={72} weight="fill" aria-hidden="true" />
        <p className="safe-copy mt-5 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl host:text-8xl">{item.material.prompt}</p>
      </Card>
      <div className="mx-auto mt-8 grid max-w-5xl gap-5 sm:grid-cols-2">
        <BigButton variant="ocean" className="min-h-28 text-4xl host:text-7xl" onClick={() => { onLock(); dispatch({ type: 'ANSWER_RENDER', answer: 'real', now: Date.now() }) }}>
          REAL
        </BigButton>
        <BigButton variant="coral" className="min-h-28 text-4xl host:text-7xl" onClick={() => { onLock(); dispatch({ type: 'ANSWER_RENDER', answer: 'rendered', now: Date.now() }) }}>
          RENDERED
        </BigButton>
      </div>
    </GameLayout>
  )
}

function RenderReveal({ state }) {
  const item = state.session.renderItems[state.renderIndex]
  const correct = state.currentAnswer === item.correctAnswer

  return (
    <GameLayout>
      <GameHeader
        round="Round 3 reveal"
        score={state.player.score}
        detail={`Item ${state.renderIndex + 1} of ${state.session.renderItems.length}`}
      />
      <Card fill="white" tilt="right" className={`${correct ? '!bg-lime' : '!bg-sunshine'} mx-auto max-w-5xl p-8 text-center`}>
        {correct ? <Check className="mx-auto" size={78} weight="bold" aria-hidden="true" /> : <X className="mx-auto" size={78} weight="bold" aria-hidden="true" />}
        <p className="mt-3 font-display text-5xl font-bold host:text-8xl">{item.correctAnswer.toUpperCase()}</p>
        <h2 className="safe-copy mt-6 font-display text-3xl font-bold sm:text-4xl host:text-6xl">The tell: {item.technique}</h2>
        <p className="safe-copy mt-4 font-body text-xl font-medium leading-relaxed sm:text-2xl host:text-5xl">{item.explanation}</p>
        {item.fabricated && <FabricatedStamp className="mt-6" />}
      </Card>
      <p className="mt-7 text-center font-display text-xl font-bold host:text-5xl">Next one, coming right up.</p>
    </GameLayout>
  )
}

function ChainQuestion({ state, dispatch, onTimeExpired, onSecondChange, onLock }) {
  const item = state.session.chainItem
  const selections = state.chainSelections ?? []
  const full = selections.length === item.material.retellings.length

  return (
    <GameLayout timer={<QuestionTimer state={state} onComplete={onTimeExpired} onSecondChange={onSecondChange} />}>
      <GameHeader round="Bonus round: Chain of Custody" score={state.player.score} detail="Tap the retellings in the order they most likely happened, first to last." />
      <h1 className="safe-copy text-center font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl host:text-8xl">{item.material.claim}</h1>
      <div className="mt-7 grid gap-5 md:grid-cols-2">
        {item.material.retellings.map((retelling, index) => {
          const position = selections.indexOf(retelling.id)
          const chosen = position >= 0
          return (
            <button
              key={retelling.id}
              type="button"
              aria-pressed={chosen}
              onClick={() => { onLock(); dispatch({ type: 'TOGGLE_CHAIN', retellingId: retelling.id }) }}
              className={`${sourceColours[index]} ${chosen ? 'press-held' : 'press shadow-hard'} min-h-40 rounded-[18px] border-chunky border-ink p-5 text-left text-ink focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ink`}
            >
              <span className="flex items-center gap-4">
                <span className="font-display text-4xl font-bold host:text-6xl">{retelling.label}</span>
                <span className={`${chosen ? 'bg-paper' : 'bg-cream opacity-60'} grid h-12 w-12 shrink-0 place-items-center rounded-full border-chunky border-ink font-display text-2xl font-bold host:h-20 host:w-20 host:text-5xl`}>
                  {chosen ? position + 1 : '?'}
                </span>
              </span>
              <span className="safe-copy mt-4 block font-display text-2xl font-semibold leading-tight sm:text-3xl host:text-5xl">{retelling.text}</span>
            </button>
          )
        })}
      </div>
      <div className="mx-auto mt-7 grid max-w-3xl gap-4 sm:grid-cols-[1fr_auto]">
        <BigButton
          variant="coral"
          className="host:text-5xl"
          disabled={!full}
          onClick={() => { onLock(); dispatch({ type: 'SUBMIT_CHAIN', now: Date.now() }) }}
        >
          {full ? 'Lock the chain' : `Ordered ${selections.length} of ${item.material.retellings.length}`}
        </BigButton>
        <BigButton variant="sunshine" className="gap-2 sm:w-auto host:text-5xl" disabled={selections.length === 0} onClick={() => dispatch({ type: 'RESET_CHAIN' })}>
          <ArrowsDownUp size={26} weight="bold" aria-hidden="true" />
          Start over
        </BigButton>
      </div>
    </GameLayout>
  )
}

function ChainReveal({ state, dispatch }) {
  const item = state.session.chainItem
  const answer = state.player.answers.at(-1)
  const ordered = item.correctAnswer.map((id) => item.material.retellings.find((retelling) => retelling.id === id))

  return (
    <GameLayout>
      <GameHeader round="Bonus reveal" score={state.player.score} detail={`You scored ${answer?.score ?? 0} on the chain.`} />
      <ol className="grid gap-4 lg:grid-cols-2 host:grid-cols-4">
        {ordered.map((retelling, index) => (
          <li key={retelling.id}>
            <Card fill="white" tilt={index % 2 ? 'right' : 'left'} className={index === 0 ? '!bg-lime' : index === ordered.length - 1 ? '!bg-coral' : ''}>
              <p className="safe-copy font-display text-2xl font-bold sm:text-3xl host:text-5xl">
                <span className="text-ink/55">{index + 1}. </span>{retelling.text}
              </p>
              <p className="safe-copy mt-3 font-body text-lg font-semibold host:text-4xl">{retelling.note}</p>
            </Card>
          </li>
        ))}
      </ol>
      <Card className="reveal-banner mt-7 bg-paper p-6" tilt="left">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="safe-copy font-display text-3xl font-bold host:text-6xl">{item.technique}</h2>
          {item.fabricated && <FabricatedStamp />}
        </div>
        <p className="safe-copy mt-3 font-body text-xl font-medium leading-relaxed sm:text-2xl host:text-5xl">{item.explanation}</p>
      </Card>
      <BigButton variant="ocean" className="mx-auto mt-7 max-w-xl host:text-5xl" onClick={() => dispatch({ type: 'END_BONUS' })}>
        Back to the scores
      </BigButton>
    </GameLayout>
  )
}

function Scoreboard({ state, onRecap, onPlayAgain }) {
  const title = assignPlayerTitles([state.player])[state.player.id]
  const bonus = state.player.bonusScore ?? 0

  return (
    <GameLayout>
      <GameHeader round="Final scoreboard" score={state.player.score} detail="You made it through every round." />
      <Card fill="white" tilt="left" className="mx-auto max-w-5xl p-8 text-center">
        <Star className="mx-auto" size={82} weight="fill" aria-hidden="true" />
        <p className="mt-3 font-body text-xl font-bold host:text-5xl">House Team</p>
        <h1 className="mt-2 font-display text-6xl font-bold leading-none sm:text-8xl">{state.player.score}</h1>
        <p className="mt-4 font-display text-3xl font-bold text-ocean sm:text-4xl host:text-6xl">{title}</p>
        <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
          <ScoreTile label="Odd Source Out" score={state.player.roundScores.odd} colour="bg-ocean" />
          <ScoreTile label="Spin Doctor" score={state.player.roundScores.spin} colour="bg-coral" />
          <ScoreTile label="Real or Rendered" score={state.player.roundScores.render} colour="bg-lime" />
        </div>
        {bonus > 0 && (
          <div className="mx-auto mt-4 max-w-3xl">
            <ScoreTile label="Bonus: Chain of Custody" score={bonus} colour="bg-sunshine" />
          </div>
        )}
      </Card>
      <div className="mx-auto mt-8 grid max-w-4xl gap-5 sm:grid-cols-2">
        <BigButton variant="sunshine" className="host:text-5xl" onClick={onRecap}>See what you learned</BigButton>
        <BigButton variant="coral" className="host:text-5xl" onClick={onPlayAgain}>Play again</BigButton>
      </div>
    </GameLayout>
  )
}

function ScoreTile({ label, score, colour }) {
  return (
    <div className={`${colour} rounded-[16px] border-chunky border-ink p-4 shadow-hard-sm`}>
      <p className="safe-copy font-body text-sm font-bold uppercase tracking-[0.05em] host:text-5xl">{label}</p>
      <p className="mt-2 font-display text-4xl font-bold host:text-6xl">{score}</p>
    </div>
  )
}

function GameLayout({ children, timer }) {
  return (
    <main className="solo-host dot-grid flex screen-min-h flex-col bg-cream px-4 py-5 text-ink sm:px-8 sm:py-7">
      <div className="game-screen mx-auto flex w-full max-w-[1500px] flex-1 flex-col">
        <div className="flex-1">{children}</div>
        {timer}
      </div>
    </main>
  )
}

export function SoloScreen() {
  const sound = useSessionSound()
  const [state, dispatch] = useReducer(gameReducer, soloSession, createInitialGameState)
  const [showRecap, setShowRecap] = useState(false)
  useRevealConfetti(state)
  const lastSoundKey = useRef('')

  useEffect(() => {
    const reveal = [PHASES.ODD_REVEAL, PHASES.SPIN_REVEAL, PHASES.RENDER_REVEAL, PHASES.CHAIN_REVEAL].includes(state.phase)
    const key = `${state.phase}:${state.renderIndex}`
    if (lastSoundKey.current === key) return undefined
    if (state.phase === PHASES.SCOREBOARD) {
      lastSoundKey.current = key
      sound.play(SOUND_CUES.SCOREBOARD)
      return undefined
    }
    if (!reveal) return undefined
    lastSoundKey.current = key
    sound.play(SOUND_CUES.REVEAL)
    const answer = state.player.answers.at(-1)
    const timer = window.setTimeout(() => sound.play(answer?.correct ? SOUND_CUES.CORRECT : SOUND_CUES.INCORRECT), 280)
    return () => window.clearTimeout(timer)
  }, [sound, state.phase, state.player.answers, state.renderIndex])

  const onTimeExpired = useCallback(() => {
    dispatch({ type: 'TIME_EXPIRED', now: Date.now() })
  }, [])

  const onChainTimeExpired = useCallback(() => {
    dispatch({ type: 'CHAIN_TIME_EXPIRED', now: Date.now() })
  }, [])

  useEffect(() => {
    if (state.phase !== PHASES.RENDER_REVEAL) return undefined
    const timer = window.setTimeout(() => {
      dispatch({ type: 'NEXT_PHASE', now: Date.now() })
    }, 2_200)
    return () => window.clearTimeout(timer)
  }, [state.phase, state.renderIndex])

  const playAgain = () => {
    setShowRecap(false)
    lastSoundKey.current = ''
    dispatch({ type: 'PLAY_AGAIN' })
  }

  const startBonus = () => {
    setShowRecap(false)
    lastSoundKey.current = ''
    dispatch({ type: 'START_BONUS', now: Date.now() })
  }

  const soundToggle = <TopRail><SoundToggle muted={sound.muted} onToggle={sound.toggleMuted} /></TopRail>
  const lockSound = () => sound.play(SOUND_CUES.LOCK)
  const bonusPlayed = state.player.answers.some((answer) => answer.round === 'chain')

  if (showRecap) {
    return (
      <>{soundToggle}
        <RecapCard
          state={state}
          onBack={() => setShowRecap(false)}
          onPlayAgain={playAgain}
          onBonus={bonusPlayed ? undefined : startBonus}
        />
        
      </>
    )
  }
  if (state.phase === PHASES.LOBBY) {
    return <>{soundToggle}<Lobby onStart={() => dispatch({ type: 'START_GAME', now: Date.now() })} /></>
  }
  if (state.phase === PHASES.ODD_QUESTION) {
    return <>{soundToggle}<OddQuestion state={state} dispatch={dispatch} onTimeExpired={onTimeExpired} onSecondChange={sound.onCountdownSecond} onLock={lockSound} /></>
  }
  if (state.phase === PHASES.ODD_REVEAL) {
    return <>{soundToggle}<OddReveal state={state} dispatch={dispatch} /></>
  }
  if (state.phase === PHASES.SPIN_QUESTION) {
    return <>{soundToggle}<SpinQuestion state={state} dispatch={dispatch} onTimeExpired={onTimeExpired} onSecondChange={sound.onCountdownSecond} onLock={lockSound} /></>
  }
  if (state.phase === PHASES.SPIN_REVEAL) {
    return <>{soundToggle}<SpinReveal state={state} dispatch={dispatch} /></>
  }
  if (state.phase === PHASES.RENDER_QUESTION) {
    return <>{soundToggle}<RenderQuestion state={state} dispatch={dispatch} onTimeExpired={onTimeExpired} onSecondChange={sound.onCountdownSecond} onLock={lockSound} /></>
  }
  if (state.phase === PHASES.RENDER_REVEAL) {
    return <>{soundToggle}<RenderReveal state={state} /></>
  }
  if (state.phase === PHASES.CHAIN_QUESTION) {
    return <>{soundToggle}<ChainQuestion state={state} dispatch={dispatch} onTimeExpired={onChainTimeExpired} onSecondChange={sound.onCountdownSecond} onLock={lockSound} /></>
  }
  if (state.phase === PHASES.CHAIN_REVEAL) {
    return <>{soundToggle}<ChainReveal state={state} dispatch={dispatch} /></>
  }
  return <>{soundToggle}<Scoreboard state={state} onRecap={() => setShowRecap(true)} onPlayAgain={playAgain} /></>
}
