import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowsDownUp,
  Article,
  Check,
  Fire,
  ImageSquare,
  Play,
  SealCheck,
  Star,
  UsersThree,
  X,
} from '@phosphor-icons/react'
import confetti from 'canvas-confetti'
import { Link, useNavigate } from 'react-router-dom'
import { BigButton } from '../components/BigButton.jsx'
import { Card } from '../components/Card.jsx'
import { CountdownBar } from '../components/CountdownBar.jsx'
import { FabricatedStamp } from '../components/FabricatedStamp.jsx'
import { LeaveConfirmModal } from '../components/LeaveConfirmModal.jsx'
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

const sourceColours = ['bg-ocean text-white', 'bg-coral text-white', 'bg-lime text-ink', 'bg-sunshine text-ink']
const sourceRevealColours = ['!bg-ocean !text-white', '!bg-coral !text-white', '!bg-lime !text-ink', '!bg-sunshine !text-ink']

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

function GameHeader({ round, score, streak, detail }) {
  return (
    <header className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b-chunky border-ink pb-2 sm:mb-4 sm:pb-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-display text-sm font-bold uppercase tracking-[0.08em] sm:text-base host:text-4xl">{round}</p>
          {(streak ?? 0) >= 2 && (
            <span className="streak-pop inline-flex items-center gap-1 rounded-full border-2 border-ink bg-sunshine px-2 py-0.5 font-display text-xs font-bold shadow-hard-sm">
              <Fire size={14} weight="fill" className="text-coral" />
              <span>{streak}x Streak!</span>
            </span>
          )}
        </div>
        {detail && <p className="safe-copy line-clamp-1 font-body text-xs font-semibold sm:text-sm host:text-3xl">{detail}</p>}
      </div>
      <div className="shrink-0 rounded-[12px] border-chunky border-ink bg-sunshine px-3 py-1 font-display text-base font-bold shadow-hard-sm sm:text-lg host:text-4xl">
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
    <main className="solo-host dot-grid centre-column bg-cream px-4 py-4 text-ink sm:px-8">
      <div className="mx-auto w-full max-w-2xl">
        <Card fill="white" tilt="left" className="game-screen p-5 text-center sm:p-8">
          <UsersThree className="mx-auto" size={54} weight="fill" aria-hidden="true" />
          <p className="mt-2 font-display text-xs font-bold uppercase tracking-[0.08em] sm:text-sm host:text-4xl">
            One Screen Mode
          </p>
          <h1 className="mx-auto mt-1 max-w-xl font-display text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-5xl lg:text-6xl host:text-7xl">
            Gather Round. Read Together.
          </h1>
          <p className="mx-auto mt-3 max-w-lg font-body text-sm font-medium leading-relaxed sm:text-lg host:text-3xl">
            One person taps for the room. Three rounds, about four minutes, everyone answers out loud.
          </p>
          <div className="mx-auto mt-6 grid max-w-md gap-3 sm:grid-cols-[1fr_auto]">
            <BigButton variant="coral" onClick={onStart} className="!h-11 !min-h-0 gap-2 text-base sm:!h-13 sm:text-lg">
              <Play size={22} weight="fill" aria-hidden="true" />
              Start the Game
            </BigButton>
            <BigButton as={Link} to="/" variant="sunshine" className="!h-11 !min-h-0 gap-1.5 sm:!h-13 sm:w-auto">
              <ArrowLeft size={20} weight="bold" aria-hidden="true" />
              <span>Back</span>
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
      <div className="flex h-full flex-col justify-between py-1">
        <GameHeader round="Round 1: Odd Source Out" score={state.player.score} streak={state.player.streak} detail="Which source is least credible for checking this event?" />
        
        <div className="my-1 rounded-[16px] border-chunky border-ink bg-white p-3.5 text-center shadow-hard sm:p-4">
          <p className="font-display text-xs font-bold uppercase tracking-[0.08em] text-ocean sm:text-sm">The Event</p>
          <h1 className="safe-copy mt-1 font-display text-xl font-bold leading-tight sm:text-2xl lg:text-3xl host:text-5xl">
            {item.material.event}
          </h1>
        </div>

        <div className="my-2 grid flex-1 gap-3 sm:gap-4 md:grid-cols-2">
          {item.material.sources.map((source, index) => (
            <button
              key={source.id}
              type="button"
              onClick={() => { onLock(); dispatch({ type: 'ANSWER_ODD', answerId: source.id, now: Date.now() }) }}
              className={`${sourceColours[index]} press flex flex-col justify-between rounded-[16px] border-chunky border-ink p-4 text-left shadow-hard focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ink sm:p-5`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-2xl font-bold sm:text-3xl host:text-5xl">{source.label}</span>
                <span className="safe-copy rounded-[8px] border-2 border-ink bg-white/90 px-2 py-0.5 font-body text-xs font-bold uppercase tracking-[0.06em] text-ink sm:text-sm">
                  {source.source}
                </span>
              </div>
              <span className="safe-copy mt-2 block font-display text-base font-semibold leading-snug sm:text-xl host:text-3xl">
                {source.headline}
              </span>
            </button>
          ))}
        </div>
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
      <div className="flex h-full flex-col justify-between py-1">
        <GameHeader round="Round 1 Reveal" score={state.player.score} streak={state.player.streak} detail={state.currentAnswer === null ? "Time's up! Here is the strongest warning sign." : isRight ? 'Good catch.' : 'Here is the strongest warning sign.'} />
        
        <div className="my-1 grid flex-1 gap-3 sm:gap-4 md:grid-cols-2">
          {item.material.sources.map((source, index) => {
            const correct = source.id === item.correctAnswer
            return (
              <Card
                key={source.id}
                fill="white"
                className={`${sourceRevealColours[index]} ${correct ? 'ring-4 ring-sunshine shadow-hard !opacity-100' : '!opacity-75'} flex flex-col justify-between p-4 sm:p-5`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <p className="safe-copy font-display text-lg font-bold sm:text-xl host:text-3xl">{source.label}: {source.source}</p>
                    {correct && <span className="rounded-full border-2 border-ink bg-sunshine px-2.5 py-0.5 font-display text-xs font-bold text-ink shadow-hard-sm">Least Credible</span>}
                  </div>
                  <p className="safe-copy mt-2 font-body text-sm font-semibold leading-snug sm:text-base host:text-2xl">{source.headline}</p>
                </div>
              </Card>
            )
          })}
        </div>

        <Card className="reveal-banner my-2 bg-paper p-3.5 sm:p-4" tilt="right">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <SealCheck size={32} weight="fill" className="text-ocean" aria-hidden="true" />
            <h2 className="safe-copy font-display text-xl font-bold sm:text-2xl host:text-4xl">{answer?.source}: {item.technique}</h2>
            {item.fabricated && <FabricatedStamp />}
          </div>
          <p className="safe-copy mt-1.5 font-body text-sm font-medium leading-relaxed sm:text-base host:text-3xl">{item.explanation}</p>
        </Card>

        <BigButton variant="ocean" className="mx-auto !h-12 !min-h-0 w-full max-w-md text-base sm:!h-13 sm:text-lg host:text-3xl" onClick={() => dispatch({ type: 'NEXT_PHASE', now: Date.now() })}>
          Next: Spin Doctor
        </BigButton>
      </div>
    </GameLayout>
  )
}

function SpinQuestion({ state, dispatch, onTimeExpired, onSecondChange, onLock }) {
  const item = state.session.spinItem

  return (
    <GameLayout timer={<QuestionTimer state={state} onComplete={onTimeExpired} onSecondChange={onSecondChange} />}>
      <div className="flex h-full flex-col justify-between py-1">
        <GameHeader round="Round 2: Spin Doctor" score={state.player.score} streak={state.player.streak} detail="Flag up to three phrases doing persuasive work." />
        
        <div className="my-auto rounded-[20px] border-chunky border-ink bg-white p-5 text-center shadow-hard sm:p-8">
          <p className="font-display text-xs font-bold uppercase tracking-[0.1em] text-ocean sm:text-sm">
            Select the Manipulative Phrases
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {item.material.phrases.map((phrase, index) => {
              const selected = state.spinSelections.includes(index)
              return (
                <button
                  type="button"
                  key={phrase}
                  aria-pressed={selected}
                  onClick={() => dispatch({ type: 'TOGGLE_SPIN', phraseIndex: index })}
                  className={`${selected ? 'press-held bg-coral text-white' : 'press bg-cream text-ink shadow-hard hover:bg-paper'} safe-copy rounded-[14px] border-chunky border-ink px-4 py-3 font-display text-lg font-bold leading-tight sm:px-6 sm:py-4 sm:text-2xl host:text-4xl`}
                >
                  {phrase}
                </button>
              )
            })}
          </div>
          <p className="mt-4 font-display text-sm font-bold text-ink/80 sm:text-base host:text-3xl">
            {state.spinSelections.length} of 3 phrases flagged
          </p>
        </div>

        <div className="pt-2">
          <BigButton
            variant="sunshine"
            className="mx-auto !h-14 !min-h-0 w-full max-w-lg text-lg font-bold text-ink shadow-hard sm:!h-16 sm:text-xl host:text-3xl"
            disabled={state.spinSelections.length === 0}
            onClick={() => { onLock(); dispatch({ type: 'SUBMIT_SPIN', now: Date.now() }) }}
          >
            Lock These Phrases
          </BigButton>
        </div>
      </div>
    </GameLayout>
  )
}

function SpinReveal({ state, dispatch }) {
  const item = state.session.spinItem
  const selected = new Set(state.currentAnswer)
  const correct = new Set(item.correctAnswer)

  return (
    <GameLayout>
      <div className="flex h-full flex-col justify-between py-1">
        <GameHeader round="Round 2 Reveal" score={state.player.score} streak={state.player.streak} detail="Scepticism needs evidence, not suspicion of everything." />
        
        <div className="my-auto rounded-[20px] border-chunky border-ink bg-white p-5 shadow-hard sm:p-7">
          <p className="text-center font-display text-xs font-bold uppercase tracking-[0.1em] text-ocean sm:text-sm">
            Analysis Breakdown
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {item.material.phrases.map((phrase, index) => {
              const isCorrectPhrase = correct.has(index)
              const isWrongFlag = selected.has(index) && !isCorrectPhrase
              return (
                <div
                  key={phrase}
                  className={`${isCorrectPhrase ? 'bg-coral text-white' : isWrongFlag ? 'bg-paper border-coral' : 'bg-cream text-ink'} rounded-[14px] border-chunky border-ink p-3.5 sm:p-4`}
                >
                  <div className="flex items-start gap-2.5">
                    {isCorrectPhrase && <Check size={26} weight="bold" aria-label="Manipulative phrase" className="shrink-0" />}
                    {isWrongFlag && <X size={26} weight="bold" aria-label="Incorrect flag" className="shrink-0 text-coral" />}
                    <p className="safe-copy font-display text-base font-bold sm:text-lg host:text-3xl">{phrase}</p>
                  </div>
                  {isCorrectPhrase && <p className="safe-copy mt-1.5 font-body text-xs font-bold opacity-90 sm:text-sm host:text-2xl">{item.technique}</p>}
                  {isWrongFlag && <p className="safe-copy mt-1.5 font-body text-xs font-bold text-coral sm:text-sm">Not a manipulation signal.</p>}
                </div>
              )
            })}
          </div>
        </div>

        <Card className="reveal-banner my-2 bg-paper p-3.5 sm:p-4" tilt="left">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="safe-copy font-display text-xl font-bold sm:text-2xl host:text-4xl">{item.technique}</h2>
            {item.fabricated && <FabricatedStamp />}
          </div>
          <p className="safe-copy mt-1.5 font-body text-sm font-medium leading-relaxed sm:text-base host:text-3xl">{item.explanation}</p>
        </Card>

        <BigButton variant="lime" className="mx-auto !h-12 !min-h-0 w-full max-w-md text-base sm:!h-13 sm:text-lg text-ink host:text-3xl" onClick={() => dispatch({ type: 'NEXT_PHASE', now: Date.now() })}>
          Next: Real or Rendered
        </BigButton>
      </div>
    </GameLayout>
  )
}

function RenderQuestion({ state, dispatch, onTimeExpired, onSecondChange, onLock }) {
  const item = state.session.renderItems[state.renderIndex]
  const ItemIcon = item.material.kind === 'text' ? Article : ImageSquare

  return (
    <GameLayout timer={<QuestionTimer state={state} onComplete={onTimeExpired} onSecondChange={onSecondChange} />}>
      <div className="flex h-full flex-col justify-between py-1">
        <GameHeader
          round="Round 3: Real or Rendered"
          score={state.player.score}
          streak={state.player.streak}
          detail={`Item ${state.renderIndex + 1} of ${state.session.renderItems.length}`}
        />
        
        <Card fill="white" tilt={state.renderIndex % 2 ? 'right' : 'left'} className="mx-auto my-auto flex w-full max-w-4xl flex-col items-center justify-center p-6 text-center shadow-hard sm:p-10">
          <div className="grid h-16 w-16 place-items-center rounded-[14px] border-chunky border-ink bg-sunshine shadow-hard-sm">
            <ItemIcon size={40} weight="fill" aria-hidden="true" />
          </div>
          <p className="safe-copy mt-4 font-display text-2xl font-bold leading-snug sm:text-3xl lg:text-4xl host:text-6xl">{item.material.prompt}</p>
        </Card>

        <div className="mx-auto grid w-full max-w-2xl gap-3 pt-2 sm:grid-cols-2">
          <BigButton variant="ocean" className="!h-16 !min-h-0 text-3xl font-bold text-white shadow-hard sm:!h-18 sm:text-4xl host:text-6xl" onClick={() => { onLock(); dispatch({ type: 'ANSWER_RENDER', answer: 'real', now: Date.now() }) }}>
            Real
          </BigButton>
          <BigButton variant="coral" className="!h-16 !min-h-0 text-3xl font-bold text-white shadow-hard sm:!h-18 sm:text-4xl host:text-6xl" onClick={() => { onLock(); dispatch({ type: 'ANSWER_RENDER', answer: 'rendered', now: Date.now() }) }}>
            Rendered
          </BigButton>
        </div>
      </div>
    </GameLayout>
  )
}

function RenderReveal({ state }) {
  const item = state.session.renderItems[state.renderIndex]
  const correct = state.currentAnswer === item.correctAnswer

  return (
    <GameLayout>
      <div className="flex h-full flex-col justify-between py-1">
        <GameHeader
          round="Round 3 Reveal"
          score={state.player.score}
          streak={state.player.streak}
          detail={`Item ${state.renderIndex + 1} of ${state.session.renderItems.length}`}
        />
        <Card fill="white" tilt="right" className={`${correct ? '!bg-lime' : '!bg-sunshine'} mx-auto my-auto w-full max-w-3xl p-6 text-center shadow-hard sm:p-10`}>
          {correct ? <Check className="mx-auto" size={54} weight="bold" aria-hidden="true" /> : <X className="mx-auto" size={54} weight="bold" aria-hidden="true" />}
          <p className="mt-2 font-display text-3xl font-bold capitalize sm:text-5xl host:text-7xl">{item.correctAnswer}</p>
          <h2 className="safe-copy mt-3 font-display text-xl font-bold sm:text-2xl host:text-4xl">The tell: {item.technique}</h2>
          <p className="safe-copy mt-2 font-body text-sm font-medium leading-relaxed sm:text-base host:text-3xl">{item.explanation}</p>
          {item.fabricated && <FabricatedStamp className="mt-4" />}
        </Card>
        <p className="mt-2 text-center font-display text-sm font-bold sm:text-base host:text-3xl">Next one coming right up.</p>
      </div>
    </GameLayout>
  )
}

function ChainQuestion({ state, dispatch, onTimeExpired, onSecondChange, onLock }) {
  const item = state.session.chainItem
  const selections = state.chainSelections ?? []
  const full = selections.length === item.material.retellings.length

  return (
    <GameLayout timer={<QuestionTimer state={state} onComplete={onTimeExpired} onSecondChange={onSecondChange} />}>
      <div className="flex h-full flex-col justify-between py-1">
        <GameHeader round="Bonus Round: Chain of Custody" score={state.player.score} streak={state.player.streak} detail="Tap the retellings in the order they most likely happened, first to last." />
        
        <div className="my-1 rounded-[16px] border-chunky border-ink bg-white p-3.5 text-center shadow-hard sm:p-4">
          <p className="font-display text-xs font-bold uppercase tracking-[0.08em] text-ocean sm:text-sm">The Claim</p>
          <h1 className="safe-copy mt-1 font-display text-xl font-bold leading-tight sm:text-2xl host:text-4xl">{item.material.claim}</h1>
        </div>

        <div className="my-2 grid flex-1 gap-3 sm:gap-4 md:grid-cols-2">
          {item.material.retellings.map((retelling, index) => {
            const position = selections.indexOf(retelling.id)
            const chosen = position >= 0
            return (
              <button
                key={retelling.id}
                type="button"
                aria-pressed={chosen}
                onClick={() => { onLock(); dispatch({ type: 'TOGGLE_CHAIN', retellingId: retelling.id }) }}
                className={`${sourceColours[index]} ${chosen ? 'press-held' : 'press shadow-hard'} flex flex-col justify-between rounded-[16px] border-chunky border-ink p-4 text-left focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ink sm:p-5`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl font-bold host:text-4xl">{retelling.label}</span>
                  <span className={`${chosen ? 'bg-paper text-ink' : 'bg-cream text-ink opacity-60'} grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-ink font-display text-base font-bold`}>
                    {chosen ? position + 1 : '?'}
                  </span>
                </div>
                <span className="safe-copy mt-2 block font-display text-base font-semibold leading-snug sm:text-lg host:text-2xl">{retelling.text}</span>
              </button>
            )
          })}
        </div>

        <div className="mx-auto grid w-full max-w-xl gap-3 pt-2 sm:grid-cols-[1fr_auto]">
          <BigButton
            variant="sunshine"
            className="!h-13 !min-h-0 text-lg font-bold text-ink shadow-hard sm:!h-14 sm:text-xl host:text-3xl"
            disabled={!full}
            onClick={() => { onLock(); dispatch({ type: 'SUBMIT_CHAIN', now: Date.now() }) }}
          >
            {full ? 'Lock the Chain' : `Ordered ${selections.length} of ${item.material.retellings.length}`}
          </BigButton>
          <BigButton variant="ocean" className="!h-13 !min-h-0 gap-1.5 px-5 text-sm font-bold text-white sm:!h-14 sm:w-auto sm:text-base host:text-3xl" disabled={selections.length === 0} onClick={() => dispatch({ type: 'RESET_CHAIN' })}>
            <ArrowsDownUp size={20} weight="bold" aria-hidden="true" />
            Start Over
          </BigButton>
        </div>
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
      <div className="flex h-full flex-col justify-between py-1">
        <GameHeader round="Bonus Reveal" score={state.player.score} streak={state.player.streak} detail={`You scored ${answer?.score ?? 0} on the chain.`} />
        <ol className="my-1 grid flex-1 gap-2.5 lg:grid-cols-2 host:grid-cols-4">
          {ordered.map((retelling, index) => (
            <li key={retelling.id}>
              <Card fill="white" tilt={index % 2 ? 'right' : 'left'} className={`${index === 0 ? '!bg-lime' : index === ordered.length - 1 ? '!bg-coral !text-white' : ''} flex h-full flex-col justify-between p-3.5`}>
                <p className="safe-copy font-display text-sm font-bold sm:text-base host:text-3xl">
                  <span className="opacity-60">{index + 1}. </span>{retelling.text}
                </p>
                <p className="safe-copy mt-1 font-body text-xs font-semibold host:text-2xl">{retelling.note}</p>
              </Card>
            </li>
          ))}
        </ol>
        <Card className="reveal-banner my-2 bg-paper p-3.5 sm:p-4" tilt="left">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="safe-copy font-display text-xl font-bold sm:text-2xl host:text-4xl">{item.technique}</h2>
            {item.fabricated && <FabricatedStamp />}
          </div>
          <p className="safe-copy mt-1.5 font-body text-sm font-medium leading-relaxed sm:text-base host:text-3xl">{item.explanation}</p>
        </Card>
        <BigButton variant="ocean" className="mx-auto !h-12 !min-h-0 w-full max-w-md text-base sm:!h-13 sm:text-lg host:text-3xl" onClick={() => dispatch({ type: 'END_BONUS' })}>
          Back to Scores
        </BigButton>
      </div>
    </GameLayout>
  )
}

function Scoreboard({ state, onRecap, onPlayAgain }) {
  const title = assignPlayerTitles([state.player])[state.player.id]
  const bonus = state.player.bonusScore ?? 0

  return (
    <GameLayout>
      <GameHeader round="Final Scoreboard" score={state.player.score} detail="You made it through every round." />
      <Card fill="white" tilt="left" className="mx-auto max-w-3xl p-5 text-center sm:p-7">
        <Star className="mx-auto text-sunshine" size={54} weight="fill" aria-hidden="true" />
        <p className="mt-1 font-body text-sm font-bold host:text-3xl">Room Score</p>
        <h1 className="mt-1 font-display text-4xl font-bold leading-none sm:text-6xl">{state.player.score}</h1>
        <p className="mt-2 font-display text-xl font-bold text-ocean sm:text-2xl host:text-4xl">{title}</p>
        <div className="mx-auto mt-4 grid max-w-xl gap-2.5 sm:grid-cols-3">
          <ScoreTile label="Odd Source Out" score={state.player.roundScores.odd} colour="bg-ocean text-white" />
          <ScoreTile label="Spin Doctor" score={state.player.roundScores.spin} colour="bg-coral text-white" />
          <ScoreTile label="Real or Rendered" score={state.player.roundScores.render} colour="bg-lime text-ink" />
        </div>
        {bonus > 0 && (
          <div className="mx-auto mt-2.5 max-w-xl">
            <ScoreTile label="Bonus: Chain of Custody" score={bonus} colour="bg-sunshine text-ink" />
          </div>
        )}
      </Card>
      <div className="mx-auto mt-4 grid max-w-xl gap-3 sm:grid-cols-2">
        <BigButton variant="sunshine" className="!h-11 !min-h-0 text-base sm:!h-12 host:text-3xl" onClick={onRecap}>
          See What You Learned
        </BigButton>
        <BigButton variant="coral" className="!h-11 !min-h-0 text-base sm:!h-12 host:text-3xl" onClick={onPlayAgain}>
          Play Again
        </BigButton>
      </div>
    </GameLayout>
  )
}

function ScoreTile({ label, score, colour }) {
  return (
    <div className={`${colour} rounded-[12px] border-chunky border-ink p-2.5 shadow-hard-sm`}>
      <p className="safe-copy font-body text-xs font-bold uppercase tracking-[0.05em] host:text-2xl">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold host:text-4xl">{score}</p>
    </div>
  )
}

function GameLayout({ children, timer }) {
  return (
    <main className="solo-host dot-grid screen-min-h flex flex-col justify-between bg-cream px-3 py-2 text-ink sm:px-6 sm:py-3">
      <div className="game-screen mx-auto flex h-full w-full max-w-[1400px] flex-1 flex-col justify-between overflow-hidden">
        <div className="flex-1 overflow-hidden">{children}</div>
        {timer}
      </div>
    </main>
  )
}

export function SoloScreen() {
  const navigate = useNavigate()
  const sound = useSessionSound()
  const [state, dispatch] = useReducer(gameReducer, soloSession, createInitialGameState)
  const [showRecap, setShowRecap] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
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

  const handleBackClick = () => {
    if (state.phase === PHASES.LOBBY || state.phase === PHASES.SCOREBOARD || showRecap) {
      if (showRecap) setShowRecap(false)
      else navigate('/')
    } else {
      setShowLeaveConfirm(true)
    }
  }

  const handleConfirmLeave = () => {
    setShowLeaveConfirm(false)
    navigate('/')
  }

  const soundToggle = (
    <TopRail onBack={handleBackClick} backAriaLabel="Back to Menu">
      <SoundToggle muted={sound.muted} onToggle={sound.toggleMuted} />
    </TopRail>
  )
  const lockSound = () => sound.play(SOUND_CUES.LOCK)
  const bonusPlayed = state.player.answers.some((answer) => answer.round === 'chain')

  let content
  if (showRecap) {
    content = (
      <RecapCard
        state={state}
        onBack={() => setShowRecap(false)}
        onPlayAgain={playAgain}
        onMenu={() => navigate('/')}
        onBonus={bonusPlayed ? undefined : startBonus}
      />
    )
  } else if (state.phase === PHASES.LOBBY) {
    content = <Lobby onStart={() => dispatch({ type: 'START_GAME', now: Date.now() })} />
  } else if (state.phase === PHASES.ODD_QUESTION) {
    content = <OddQuestion state={state} dispatch={dispatch} onTimeExpired={onTimeExpired} onSecondChange={sound.onCountdownSecond} onLock={lockSound} />
  } else if (state.phase === PHASES.ODD_REVEAL) {
    content = <OddReveal state={state} dispatch={dispatch} />
  } else if (state.phase === PHASES.SPIN_QUESTION) {
    content = <SpinQuestion state={state} dispatch={dispatch} onTimeExpired={onTimeExpired} onSecondChange={sound.onCountdownSecond} onLock={lockSound} />
  } else if (state.phase === PHASES.SPIN_REVEAL) {
    content = <SpinReveal state={state} dispatch={dispatch} />
  } else if (state.phase === PHASES.RENDER_QUESTION) {
    content = <RenderQuestion state={state} dispatch={dispatch} onTimeExpired={onTimeExpired} onSecondChange={sound.onCountdownSecond} onLock={lockSound} />
  } else if (state.phase === PHASES.RENDER_REVEAL) {
    content = <RenderReveal state={state} />
  } else if (state.phase === PHASES.CHAIN_QUESTION) {
    content = <ChainQuestion state={state} dispatch={dispatch} onTimeExpired={onChainTimeExpired} onSecondChange={sound.onCountdownSecond} onLock={lockSound} />
  } else if (state.phase === PHASES.CHAIN_REVEAL) {
    content = <ChainReveal state={state} dispatch={dispatch} />
  } else {
    content = <Scoreboard state={state} onRecap={() => setShowRecap(true)} onPlayAgain={playAgain} />
  }

  return (
    <>
      {soundToggle}
      {content}
      <LeaveConfirmModal
        open={showLeaveConfirm}
        onConfirm={handleConfirmLeave}
        onCancel={() => setShowLeaveConfirm(false)}
        title="Leave Solo Game?"
        message="Are you sure you want to exit your game and return to the main menu? Progress will be lost."
      />
    </>
  )
}
