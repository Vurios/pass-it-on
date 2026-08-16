import test from 'node:test'
import assert from 'node:assert/strict'
import {
  CHAIN_TIMING,
  PHASES,
  SINGLE_SCREEN_TIME_BONUS,
  assignPlayerTitles,
  createInitialGameState,
  createMultiplayerGameState,
  gameReducer,
  scoreChainOfCustody,
  scoreOddSourceOut,
  scoreRealOrRendered,
  scoreSpinDoctor,
} from './gameReducer.js'

const item = (id, correctAnswer) => ({
  id,
  correctAnswer,
  technique: `Technique ${id}`,
  explanation: `Explanation ${id}`,
  fabricated: true,
})

const session = {
  oddItem: item('odd', 'b'),
  spinItem: item('spin', [0, 2]),
  renderItems: [item('render-1', 'real'), item('render-2', 'rendered')],
}

test('scoring follows all three round formulas', () => {
  assert.equal(scoreOddSourceOut({ selected: 'b', correctAnswer: 'b', elapsedMs: 0 }), 150)
  assert.equal(scoreOddSourceOut({ selected: 'b', correctAnswer: 'b', elapsedMs: 5_000 }), 125)
  assert.equal(scoreOddSourceOut({ selected: 'a', correctAnswer: 'b', elapsedMs: 0 }), 0)
  assert.equal(scoreSpinDoctor({ selected: [0, 1, 2], correctAnswer: [0, 2] }), 40)
  assert.equal(scoreSpinDoctor({ selected: [1], correctAnswer: [0, 2] }), 0)
  assert.equal(scoreRealOrRendered({ selected: 'real', correctAnswer: 'real' }), 40)
})

test('reducer runs lobby through every question and reveal to scoreboard', () => {
  let state = createInitialGameState(session)
  state = gameReducer(state, { type: 'START_GAME', now: 1_000 })
  assert.equal(state.phase, PHASES.ODD_QUESTION)

  state = gameReducer(state, { type: 'ANSWER_ODD', answerId: 'b', now: 2_000 })
  assert.equal(state.phase, PHASES.ODD_REVEAL)
  assert.equal(state.player.roundScores.odd, 145)

  state = gameReducer(state, { type: 'NEXT_PHASE', now: 3_000 })
  state = gameReducer(state, { type: 'TOGGLE_SPIN', phraseIndex: 0 })
  state = gameReducer(state, { type: 'TOGGLE_SPIN', phraseIndex: 2 })
  state = gameReducer(state, { type: 'SUBMIT_SPIN', now: 4_000 })
  assert.equal(state.phase, PHASES.SPIN_REVEAL)
  assert.equal(state.player.roundScores.spin, 50)

  state = gameReducer(state, { type: 'NEXT_PHASE', now: 5_000 })
  state = gameReducer(state, { type: 'ANSWER_RENDER', answer: 'real', now: 6_000 })
  state = gameReducer(state, { type: 'NEXT_PHASE', now: 7_000 })
  state = gameReducer(state, { type: 'TIME_EXPIRED', now: 12_000 })
  state = gameReducer(state, { type: 'NEXT_PHASE', now: 13_000 })

  assert.equal(state.phase, PHASES.SCOREBOARD)
  assert.equal(state.player.score, 235)
  assert.equal(state.player.answers.length, 4)
  assert.equal(state.encountered.length, 4)
})

test('spin selection caps at three and can be deselected', () => {
  let state = gameReducer(createInitialGameState(session), { type: 'START_GAME', now: 0 })
  state = gameReducer(state, { type: 'TIME_EXPIRED', now: 10_000 })
  state = gameReducer(state, { type: 'NEXT_PHASE', now: 11_000 })
  for (const phraseIndex of [0, 1, 2, 3]) {
    state = gameReducer(state, { type: 'TOGGLE_SPIN', phraseIndex })
  }
  assert.deepEqual(state.spinSelections, [0, 1, 2])
  state = gameReducer(state, { type: 'TOGGLE_SPIN', phraseIndex: 1 })
  assert.deepEqual(state.spinSelections, [0, 2])
})

test('titles come from score and answer metrics', () => {
  const players = [
    { id: 'winner', score: 300, roundScores: { odd: 120, spin: 60, render: 120 }, answers: [] },
    {
      id: 'spin', score: 200, roundScores: { odd: 100, spin: 60, render: 40 },
      answers: [{ round: 'spin', selected: [0, 1], correctAnswer: [0, 1], correct: true, elapsedMs: 8_000 }],
    },
    {
      id: 'fast', score: 190, roundScores: { odd: 110, spin: 40, render: 40 },
      answers: [{ round: 'odd', selected: 'a', correctAnswer: 'a', correct: true, elapsedMs: 900 }],
    },
    {
      id: 'careful', score: 180, roundScores: { odd: 100, spin: 40, render: 40 },
      answers: [{ round: 'odd', selected: 'a', correctAnswer: 'a', correct: true, elapsedMs: 9_500 }],
    },
    {
      id: 'steady', score: 150, roundScores: { odd: 50, spin: 50, render: 50 },
      answers: [{ round: 'odd', selected: 'b', correctAnswer: 'a', correct: false, elapsedMs: 6_000 }],
    },
  ]
  const titles = assignPlayerTitles(players)
  assert.equal(titles.winner, 'The Fact Lion')
  assert.equal(titles.spin, 'The Skeptical Fox')
  assert.equal(titles.fast, 'The Speedy Cheetah')
  assert.equal(titles.careful, 'The Careful Panda')
  assert.equal(titles.steady, 'The Steady Turtle')
})

test('multiplayer Round 1 requires at least one player and reveals after all answer', () => {
  let state = createMultiplayerGameState(session)
  state = gameReducer(state, { type: 'START_GAME', now: 0 })
  assert.equal(state.phase, PHASES.LOBBY)

  let onePlayer = gameReducer(state, {
    type: 'ADD_PLAYER',
    player: { id: 'solo-phone', name: 'solo-phone', avatar: 'cat' },
  })
  onePlayer = gameReducer(onePlayer, { type: 'START_GAME', now: 500 })
  assert.equal(onePlayer.phase, PHASES.ODD_QUESTION)

  for (const id of ['one', 'two', 'three']) {
    state = gameReducer(state, {
      type: 'ADD_PLAYER',
      player: { id, name: id, avatar: 'cat' },
    })
  }
  state = gameReducer(state, { type: 'START_GAME', now: 1_000 })
  assert.equal(state.phase, PHASES.ODD_QUESTION)

  state = gameReducer(state, { type: 'ANSWER_ODD_PLAYER', playerId: 'one', answerId: 'b', now: 2_000 })
  state = gameReducer(state, { type: 'ANSWER_ODD_PLAYER', playerId: 'two', answerId: 'a', now: 3_000 })
  assert.equal(state.phase, PHASES.ODD_QUESTION)
  state = gameReducer(state, { type: 'ANSWER_ODD_PLAYER', playerId: 'three', answerId: 'b', now: 4_000 })

  assert.equal(state.phase, PHASES.ODD_REVEAL)
  assert.equal(state.players.find((player) => player.id === 'one').score, 145)
  assert.equal(state.players.find((player) => player.id === 'two').score, 0)
  assert.equal(state.players.find((player) => player.id === 'three').score, 135)
})

test('rejoining player keeps the same seat and score', () => {
  let state = createMultiplayerGameState(session)
  state = gameReducer(state, { type: 'ADD_PLAYER', player: { id: 'same-id', name: 'First', avatar: 'cat' } })
  state = {
    ...state,
    players: state.players.map((player) => ({ ...player, score: 90 })),
  }
  state = gameReducer(state, { type: 'ADD_PLAYER', player: { id: 'same-id', name: 'Updated', avatar: 'dog' } })

  assert.equal(state.players.length, 1)
  assert.equal(state.players[0].score, 90)
  assert.equal(state.players[0].name, 'Updated')
  assert.equal(state.players[0].avatar, 'dog')
})

function multiplayerAtOddQuestion() {
  let state = createMultiplayerGameState(session)
  for (const id of ['one', 'two', 'three']) {
    state = gameReducer(state, { type: 'ADD_PLAYER', player: { id, name: id, avatar: 'cat' }, now: 500 })
  }
  return gameReducer(state, { type: 'START_GAME', now: 1_000 })
}

test('multiplayer reducer scores Spin Doctor and all Real or Rendered items', () => {
  let state = multiplayerAtOddQuestion()
  state = gameReducer(state, { type: 'TIME_EXPIRED', now: 11_000 })
  state = gameReducer(state, { type: 'NEXT_PHASE', now: 12_000 })
  state = gameReducer(state, { type: 'ANSWER_SPIN_PLAYER', playerId: 'one', selections: [0, 2], now: 13_000 })
  state = gameReducer(state, { type: 'ANSWER_SPIN_PLAYER', playerId: 'two', selections: [0, 1, 2], now: 14_000 })
  state = gameReducer(state, { type: 'ANSWER_SPIN_PLAYER', playerId: 'three', selections: [1], now: 15_000 })
  assert.equal(state.phase, PHASES.SPIN_REVEAL)
  assert.deepEqual(state.players.map((player) => player.roundScores.spin), [50, 40, 0])

  state = gameReducer(state, { type: 'NEXT_PHASE', now: 16_000 })
  for (const playerId of ['one', 'two', 'three']) {
    state = gameReducer(state, { type: 'ANSWER_RENDER_PLAYER', playerId, answer: playerId === 'two' ? 'rendered' : 'real', now: 17_000 })
  }
  assert.equal(state.phase, PHASES.RENDER_REVEAL)
  assert.deepEqual(state.players.map((player) => player.roundScores.render), [40, 0, 40])
  state = gameReducer(state, { type: 'NEXT_PHASE', now: 18_000 })
  state = gameReducer(state, { type: 'TIME_EXPIRED', now: 23_000 })
  state = gameReducer(state, { type: 'NEXT_PHASE', now: 24_000 })
  assert.equal(state.phase, PHASES.SCOREBOARD)
})

test('pause freezes host timer and rejects answers until resumed', () => {
  let state = multiplayerAtOddQuestion()
  state = gameReducer(state, { type: 'PAUSE_GAME', now: 4_000 })
  assert.equal(state.paused, true)
  assert.equal(state.pausedRemainingMs, 7_000)
  assert.equal(state.timerEndsAt, null)
  const paused = gameReducer(state, { type: 'ANSWER_ODD_PLAYER', playerId: 'one', answerId: 'b', now: 9_000 })
  assert.deepEqual(paused.oddAnswers, {})
  state = gameReducer(state, { type: 'RESUME_GAME', now: 20_000 })
  assert.equal(state.phaseStartedAt, 17_000)
  assert.equal(state.timerEndsAt, 27_000)
})

test('skip and end early do not add answers or points', () => {
  let state = multiplayerAtOddQuestion()
  state = gameReducer(state, { type: 'SKIP_ROUND' })
  assert.equal(state.phase, PHASES.ODD_REVEAL)
  assert.equal(state.players.every((player) => player.answers.length === 0 && player.score === 0), true)
  state = gameReducer(state, { type: 'NEXT_PHASE', now: 5_000 })
  state = gameReducer(state, { type: 'END_EARLY' })
  assert.equal(state.phase, PHASES.SCOREBOARD)
  assert.equal(state.players.every((player) => player.score === 0), true)
})

test('stale player greys out, is ignored by scoring, and cannot stall reveal', () => {
  let state = multiplayerAtOddQuestion()
  state = gameReducer(state, { type: 'ADD_PLAYER', player: { id: 'one', name: 'one', avatar: 'cat' }, now: 7_000 })
  state = gameReducer(state, { type: 'ADD_PLAYER', player: { id: 'two', name: 'two', avatar: 'cat' }, now: 7_000 })
  state = gameReducer(state, { type: 'ANSWER_ODD_PLAYER', playerId: 'one', answerId: 'b', now: 8_000 })
  state = gameReducer(state, { type: 'ANSWER_ODD_PLAYER', playerId: 'two', answerId: 'b', now: 8_000 })
  state = gameReducer(state, { type: 'MARK_STALE_PLAYERS', now: 9_000, staleAfterMs: 5_000 })
  assert.equal(state.phase, PHASES.ODD_REVEAL)
  assert.equal(state.players.find((player) => player.id === 'three').connected, false)
  assert.equal(state.players.find((player) => player.id === 'three').answers.length, 0)
})

test('play again preserves seats and connections but clears scores', () => {
  let state = multiplayerAtOddQuestion()
  state = gameReducer(state, { type: 'TIME_EXPIRED', now: 11_000 })
  state = gameReducer(state, { type: 'PLAY_AGAIN' })
  assert.equal(state.phase, PHASES.LOBBY)
  assert.deepEqual(state.players.map((player) => player.id), ['one', 'two', 'three'])
  assert.equal(state.players.every((player) => player.connected && player.score === 0 && player.answers.length === 0), true)
})

test('a phone waking and re-announcing the same id keeps its live seat and answers', () => {
  let state = multiplayerAtOddQuestion()
  state = gameReducer(state, { type: 'ANSWER_ODD_PLAYER', playerId: 'one', answerId: 'b', now: 2_000 })
  state = gameReducer(state, { type: 'ADD_PLAYER', player: { id: 'one', name: 'one', avatar: 'dog' }, now: 8_000 })
  const player = state.players.find((entry) => entry.id === 'one')
  assert.equal(state.players.length, 3)
  assert.equal(player.connected, true)
  assert.equal(player.avatar, 'dog')
  assert.equal(state.oddAnswers.one.answerId, 'b')
})

test('a player can join and answer while a round is already running', () => {
  let state = multiplayerAtOddQuestion()
  state = gameReducer(state, { type: 'ADD_PLAYER', player: { id: 'late', name: 'Late', avatar: 'fox' }, now: 2_000 })
  state = gameReducer(state, { type: 'ANSWER_ODD_PLAYER', playerId: 'late', answerId: 'b', now: 3_000 })
  assert.equal(state.players.find((player) => player.id === 'late').connected, true)
  assert.equal(state.oddAnswers.late.answerId, 'b')
})

test('a ninth player is refused without disturbing the running room', () => {
  let state = multiplayerAtOddQuestion()
  for (const id of ['four', 'five', 'six', 'seven', 'eight']) {
    state = gameReducer(state, { type: 'ADD_PLAYER', player: { id, name: id, avatar: 'cat' }, now: 2_000 })
  }
  const fullState = gameReducer(state, { type: 'ADD_PLAYER', player: { id: 'nine', name: 'nine', avatar: 'dog' }, now: 3_000 })
  assert.equal(fullState.players.length, 8)
  assert.equal(fullState.players.some((player) => player.id === 'nine'), false)
})

test('the final item reaches scoreboard when nobody answers', () => {
  let state = multiplayerAtOddQuestion()
  state = gameReducer(state, { type: 'TIME_EXPIRED', now: 11_000 })
  state = gameReducer(state, { type: 'NEXT_PHASE', now: 12_000 })
  state = gameReducer(state, { type: 'TIME_EXPIRED', now: 27_000 })
  state = gameReducer(state, { type: 'NEXT_PHASE', now: 28_000 })
  for (let index = 0; index < session.renderItems.length; index += 1) {
    state = gameReducer(state, { type: 'TIME_EXPIRED', now: state.timerEndsAt })
    assert.equal(state.phase, PHASES.RENDER_REVEAL)
    state = gameReducer(state, { type: 'NEXT_PHASE', now: (state.phaseStartedAt ?? 0) + 6_000 })
  }
  assert.equal(state.phase, PHASES.SCOREBOARD)
  assert.equal(state.players.every((player) => player.roundScores.render === 0), true)
})

test('game session can change only in the lobby', () => {
  const customSession = { ...session, locale: 'en-custom' }
  let state = createMultiplayerGameState(session)
  state = gameReducer(state, { type: 'SET_SESSION', session: customSession })
  assert.equal(state.session.locale, 'en-custom')
  for (const id of ['one', 'two', 'three']) {
    state = gameReducer(state, { type: 'ADD_PLAYER', player: { id, name: id, avatar: 'cat' }, now: 0 })
  }
  state = gameReducer(state, { type: 'START_GAME', now: 1_000 })
  state = gameReducer(state, { type: 'SET_SESSION', session })
  assert.equal(state.session.locale, 'en-custom')
})

const chainItem = {
  id: 'chain-test',
  material: {
    claim: 'A claim someone measured once.',
    retellings: [
      { id: 'a', label: 'A', text: 'Second telling', note: 'Sample size drops.' },
      { id: 'b', label: 'B', text: 'First telling', note: 'Named source and numbers.' },
      { id: 'c', label: 'C', text: 'Fourth telling', note: 'All caps and fury.' },
      { id: 'd', label: 'D', text: 'Third telling', note: 'A want becomes a demand.' },
    ],
  },
  correctAnswer: ['b', 'a', 'd', 'c'],
  technique: 'Detail loss and escalation',
  explanation: 'Each retelling drops a detail and adds a feeling.',
  fabricated: true,
}
const bonusSession = { ...session, chainItem }

test('bonus round scoring pays per placement and adds a whole chain bonus', () => {
  assert.equal(scoreChainOfCustody({ selected: ['b', 'a', 'd', 'c'], correctAnswer: chainItem.correctAnswer }), 160)
  assert.equal(scoreChainOfCustody({ selected: ['b', 'a', 'c', 'd'], correctAnswer: chainItem.correctAnswer }), 60)
  assert.equal(scoreChainOfCustody({ selected: [], correctAnswer: chainItem.correctAnswer }), 0)
  assert.equal(scoreChainOfCustody({ selected: null, correctAnswer: chainItem.correctAnswer }), 0)
})

test('the bonus round is reachable only from the scoreboard and leaves core round scores alone', () => {
  let state = createInitialGameState(bonusSession)
  state = gameReducer(state, { type: 'START_BONUS', now: 0 })
  assert.equal(state.phase, PHASES.LOBBY)

  state = gameReducer(state, { type: 'START_GAME', now: 1_000 })
  state = gameReducer(state, { type: 'ANSWER_ODD', answerId: 'b', now: 2_000 })
  const coreOddScore = state.player.roundScores.odd
  state = { ...state, phase: PHASES.SCOREBOARD, timerEndsAt: null }
  const coreScore = state.player.score

  state = gameReducer(state, { type: 'START_BONUS', now: 20_000 })
  assert.equal(state.phase, PHASES.CHAIN_QUESTION)
  assert.equal(state.timerEndsAt, 20_000 + CHAIN_TIMING + SINGLE_SCREEN_TIME_BONUS)

  for (const retellingId of ['b', 'a', 'd', 'c']) {
    state = gameReducer(state, { type: 'TOGGLE_CHAIN', retellingId })
  }
  assert.deepEqual(state.chainSelections, ['b', 'a', 'd', 'c'])
  state = gameReducer(state, { type: 'SUBMIT_CHAIN', now: 25_000 })

  assert.equal(state.phase, PHASES.CHAIN_REVEAL)
  assert.equal(state.player.bonusScore, 160)
  assert.equal(state.player.score, coreScore + 160)
  assert.equal(state.player.roundScores.odd, coreOddScore)
  assert.deepEqual(state.player.roundScores, { odd: coreOddScore, spin: 0, render: 0 })
  assert.ok(state.encountered.some((entry) => entry.technique === chainItem.technique))

  state = gameReducer(state, { type: 'END_BONUS' })
  assert.equal(state.phase, PHASES.SCOREBOARD)
})

test('a networked bonus round reveals once every connected phone has ordered the chain', () => {
  let state = createMultiplayerGameState(bonusSession)
  for (const id of ['one', 'two', 'three']) {
    state = gameReducer(state, { type: 'ADD_PLAYER', player: { id, name: id, avatar: 'cat' }, now: 0 })
  }
  state = { ...state, phase: PHASES.SCOREBOARD }
  state = gameReducer(state, { type: 'START_BONUS', now: 1_000 })
  assert.equal(state.phase, PHASES.CHAIN_QUESTION)

  state = gameReducer(state, { type: 'ANSWER_CHAIN_PLAYER', playerId: 'one', order: ['b', 'a', 'd', 'c'], now: 2_000 })
  state = gameReducer(state, { type: 'ANSWER_CHAIN_PLAYER', playerId: 'two', order: ['b', 'a', 'c', 'd', 'b'], now: 3_000 })
  assert.equal(state.phase, PHASES.CHAIN_QUESTION)
  state = gameReducer(state, { type: 'ANSWER_CHAIN_PLAYER', playerId: 'three', order: ['nope'], now: 4_000 })

  assert.equal(state.phase, PHASES.CHAIN_REVEAL)
  const scores = Object.fromEntries(state.players.map((player) => [player.id, player.bonusScore]))
  assert.deepEqual(scores, { one: 160, two: 60, three: 0 })
  assert.equal(state.players.every((player) => player.roundScores.odd === 0), true)
})

test('the bonus timer expiring counts the phones that answered and never touches a core round', () => {
  let state = createMultiplayerGameState(bonusSession)
  for (const id of ['one', 'two']) {
    state = gameReducer(state, { type: 'ADD_PLAYER', player: { id, name: id, avatar: 'cat' }, now: 0 })
  }
  state = { ...state, phase: PHASES.SCOREBOARD }
  state = gameReducer(state, { type: 'START_BONUS', now: 0 })
  state = gameReducer(state, { type: 'ANSWER_CHAIN_PLAYER', playerId: 'one', order: ['b', 'a', 'd', 'c'], now: 5_000 })
  state = gameReducer(state, { type: 'CHAIN_TIME_EXPIRED', now: CHAIN_TIMING })
  assert.equal(state.phase, PHASES.CHAIN_REVEAL)
  assert.equal(state.players.find((player) => player.id === 'two').bonusScore, 0)
  assert.equal(gameReducer(state, { type: 'TIME_EXPIRED', now: 30_000 }).phase, PHASES.CHAIN_REVEAL)
})
