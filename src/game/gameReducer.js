export const PHASES = {
  LOBBY: 'lobby',
  ODD_QUESTION: 'odd-question',
  ODD_REVEAL: 'odd-reveal',
  SPIN_QUESTION: 'spin-question',
  SPIN_REVEAL: 'spin-reveal',
  RENDER_QUESTION: 'render-question',
  RENDER_REVEAL: 'render-reveal',
  SCOREBOARD: 'scoreboard',
  /* Optional bonus round, reachable only from the scoreboard side of the recap. */
  CHAIN_QUESTION: 'chain-question',
  CHAIN_REVEAL: 'chain-reveal',
}

export const ROUND_TIMINGS = {
  odd: 10_000,
  spin: 15_000,
  render: 5_000,
}

/* The bonus round sits outside ROUND_TIMINGS so it can never lengthen a core session. */
export const CHAIN_TIMING = 20_000
export const SINGLE_SCREEN_TIME_BONUS = 5_000

function roundTiming(state, round) {
  return ROUND_TIMINGS[round] + (state.mode === 'solo' ? SINGLE_SCREEN_TIME_BONUS : 0)
}

const emptyRoundScores = () => ({ odd: 0, spin: 0, render: 0 })

export function createInitialGameState(session) {
  return {
    mode: 'solo',
    phase: PHASES.LOBBY,
    session,
    phaseStartedAt: null,
    timerEndsAt: null,
    renderIndex: 0,
    spinSelections: [],
    chainSelections: [],
    currentAnswer: null,
    player: {
      id: 'solo-room',
      name: 'House Team',
      score: 0,
      streak: 0,
      maxStreak: 0,
      roundScores: emptyRoundScores(),
      bonusScore: 0,
      answers: [],
    },
    encountered: [],
  }
}

function createMultiplayerPlayer(player) {
  return {
    id: player.id,
    name: player.name,
    avatar: player.avatar,
    connected: true,
    score: 0,
    streak: 0,
    maxStreak: 0,
    roundScores: emptyRoundScores(),
    bonusScore: 0,
    answers: [],
    lastSeenAt: player.now ?? 0,
  }
}

export function createMultiplayerGameState(session) {
  return {
    ...createInitialGameState(session),
    mode: 'multiplayer',
    players: [],
    oddAnswers: {},
    spinAnswers: {},
    renderAnswers: {},
    chainAnswers: {},
    paused: false,
    pausedRemainingMs: null,
    pausedElapsedMs: null,
  }
}

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value))

export function scoreOddSourceOut({ selected, correctAnswer, elapsedMs }) {
  if (selected !== correctAnswer) return 0
  const speedBonus = 50 * (1 - clamp(elapsedMs, 0, ROUND_TIMINGS.odd) / ROUND_TIMINGS.odd)
  return Math.round(100 + speedBonus)
}

export function scoreSpinDoctor({ selected, correctAnswer }) {
  const correctSet = new Set(correctAnswer)
  const correctFlags = selected.filter((index) => correctSet.has(index)).length
  const wrongFlags = selected.length - correctFlags
  return Math.max(0, correctFlags * 25 - wrongFlags * 10)
}

export function scoreRealOrRendered({ selected, correctAnswer }) {
  return selected === correctAnswer ? 40 : 0
}

/*
 * Bonus round: 30 per retelling placed in the right position, plus 40 when the
 * whole chain is right, floor at zero. No speed bonus, in line with the other
 * rounds that ask for judgement rather than reflexes. Bonus points are kept in
 * player.bonusScore so the three core round scores stay exactly as scored.
 */
export function scoreChainOfCustody({ selected, correctAnswer }) {
  const order = Array.isArray(selected) ? selected : []
  const placed = correctAnswer.filter((id, index) => order[index] === id).length
  return Math.max(0, placed * 30 + (placed === correctAnswer.length ? 40 : 0))
}

function answerAccuracy(answer) {
  if (answer.round === 'spin') {
    const correctSet = new Set(answer.correctAnswer)
    const correctFlags = answer.selected.filter((index) => correctSet.has(index)).length
    const wrongFlags = answer.selected.length - correctFlags
    const possible = Math.max(correctSet.size, answer.selected.length, 1)
    return clamp((correctFlags - wrongFlags) / possible, 0, 1)
  }

  return answer.correct ? 1 : 0
}

export function computePlayerMetrics(player) {
  const answered = player.answers.filter((answer) => answer.selected !== null)
  const responseTimes = answered.map((answer) => answer.elapsedMs)
  const accuracies = player.answers.map(answerAccuracy)
  const spinAnswers = player.answers.filter((answer) => answer.round === 'spin')
  const spinAccuracy = spinAnswers.length
    ? spinAnswers.reduce((total, answer) => total + answerAccuracy(answer), 0) / spinAnswers.length
    : 0
  const averageAnswerTime = responseTimes.length
    ? responseTimes.reduce((total, time) => total + time, 0) / responseTimes.length
    : Number.POSITIVE_INFINITY
  const overallAccuracy = accuracies.length
    ? accuracies.reduce((total, accuracy) => total + accuracy, 0) / accuracies.length
    : 0
  const scores = Object.values(player.roundScores)
  const meanScore = scores.reduce((total, score) => total + score, 0) / scores.length
  const scoreVariance = scores.reduce((total, score) => total + (score - meanScore) ** 2, 0) / scores.length

  return { spinAccuracy, averageAnswerTime, overallAccuracy, scoreVariance }
}

export function assignPlayerTitles(players) {
  if (!players.length) return {}

  const metrics = Object.fromEntries(players.map((player) => [player.id, computePlayerMetrics(player)]))
  const ranked = [...players].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
  const titles = { [ranked[0].id]: 'The Fact Lion' }
  const unassigned = () => players.filter((player) => !titles[player.id])

  const assignBest = (title, compare, filter = () => true) => {
    const candidates = unassigned().filter(filter).sort(compare)
    if (candidates[0]) titles[candidates[0].id] = title
  }

  assignBest(
    'The Skeptical Fox',
    (a, b) => metrics[b.id].spinAccuracy - metrics[a.id].spinAccuracy || a.id.localeCompare(b.id),
  )
  assignBest(
    'The Speedy Cheetah',
    (a, b) => metrics[a.id].averageAnswerTime - metrics[b.id].averageAnswerTime || a.id.localeCompare(b.id),
  )
  assignBest(
    'The Careful Panda',
    (a, b) => metrics[b.id].averageAnswerTime - metrics[a.id].averageAnswerTime || a.id.localeCompare(b.id),
    (player) => metrics[player.id].overallAccuracy >= 0.5,
  )
  assignBest(
    'The Steady Turtle',
    (a, b) => metrics[a.id].scoreVariance - metrics[b.id].scoreVariance || a.id.localeCompare(b.id),
  )

  for (const player of unassigned()) {
    const playerMetrics = metrics[player.id]
    if (playerMetrics.spinAccuracy >= 0.67) titles[player.id] = 'The Skeptical Fox'
    else if (playerMetrics.overallAccuracy >= 0.5 && playerMetrics.averageAnswerTime >= 8_000) titles[player.id] = 'The Careful Panda'
    else if (playerMetrics.averageAnswerTime <= 4_000) titles[player.id] = 'The Speedy Cheetah'
    else titles[player.id] = 'The Steady Turtle'
  }

  return titles
}

function phaseClock(phase, now, duration) {
  return {
    phase,
    phaseStartedAt: now,
    timerEndsAt: now + duration,
    currentAnswer: null,
  }
}

function encounter(state, item) {
  if (state.encountered.some((entry) => entry.id === item.id)) return state.encountered
  return [
    ...state.encountered,
    {
      id: item.id,
      technique: item.technique,
      explanation: item.explanation,
      fabricated: item.fabricated,
    },
  ]
}

function recordRoundAnswer(state, { round, itemId, selected, correctAnswer, score, elapsedMs }) {
  const isCorrect = Array.isArray(correctAnswer)
    ? scoreSpinDoctor({ selected, correctAnswer }) > 0
    : selected === correctAnswer

  const streak = isCorrect ? (state.player.streak || 0) + 1 : 0
  const maxStreak = Math.max(state.player.maxStreak || 0, streak)

  const answer = {
    round,
    itemId,
    selected,
    correctAnswer,
    correct: isCorrect,
    score,
    elapsedMs,
    streak,
  }

  return {
    ...state.player,
    score: state.player.score + score,
    streak,
    maxStreak,
    roundScores: {
      ...state.player.roundScores,
      [round]: state.player.roundScores[round] + score,
    },
    answers: [...state.player.answers, answer],
  }
}

function revealOdd(state, selected, now) {
  const item = state.session.oddItem
  const elapsedMs = clamp(now - state.phaseStartedAt, 0, ROUND_TIMINGS.odd)
  const score = scoreOddSourceOut({ selected, correctAnswer: item.correctAnswer, elapsedMs })

  return {
    ...state,
    phase: PHASES.ODD_REVEAL,
    timerEndsAt: null,
    currentAnswer: selected,
    encountered: encounter(state, item),
    player: recordRoundAnswer(state, {
      round: 'odd',
      itemId: item.id,
      selected,
      correctAnswer: item.correctAnswer,
      score,
      elapsedMs,
    }),
  }
}

function revealMultiplayerOdd(state) {
  const item = state.session.oddItem
  const players = state.players.map((player) => {
    if (!player.connected) return player
    const submitted = state.oddAnswers[player.id]
    const selected = submitted?.answerId ?? null
    const elapsedMs = submitted?.elapsedMs ?? ROUND_TIMINGS.odd
    const score = scoreOddSourceOut({ selected, correctAnswer: item.correctAnswer, elapsedMs })
    const isCorrect = selected === item.correctAnswer
    const streak = isCorrect ? (player.streak || 0) + 1 : 0
    const maxStreak = Math.max(player.maxStreak || 0, streak)
    const answer = {
      round: 'odd',
      itemId: item.id,
      selected,
      correctAnswer: item.correctAnswer,
      correct: isCorrect,
      score,
      elapsedMs,
      streak,
    }

    return {
      ...player,
      score: player.score + score,
      streak,
      maxStreak,
      roundScores: { ...player.roundScores, odd: player.roundScores.odd + score },
      answers: [...player.answers, answer],
    }
  })

  return {
    ...state,
    phase: PHASES.ODD_REVEAL,
    timerEndsAt: null,
    encountered: encounter(state, item),
    players,
  }
}

function revealSpin(state, selected, now) {
  const item = state.session.spinItem
  const elapsedMs = clamp(now - state.phaseStartedAt, 0, ROUND_TIMINGS.spin)
  const score = scoreSpinDoctor({ selected, correctAnswer: item.correctAnswer })

  return {
    ...state,
    phase: PHASES.SPIN_REVEAL,
    timerEndsAt: null,
    currentAnswer: selected,
    encountered: encounter(state, item),
    player: recordRoundAnswer(state, {
      round: 'spin',
      itemId: item.id,
      selected,
      correctAnswer: item.correctAnswer,
      score,
      elapsedMs,
    }),
  }
}

function revealRendered(state, selected, now) {
  const item = state.session.renderItems[state.renderIndex]
  const elapsedMs = clamp(now - state.phaseStartedAt, 0, ROUND_TIMINGS.render)
  const score = scoreRealOrRendered({ selected, correctAnswer: item.correctAnswer })

  return {
    ...state,
    phase: PHASES.RENDER_REVEAL,
    timerEndsAt: null,
    currentAnswer: selected,
    encountered: encounter(state, item),
    player: recordRoundAnswer(state, {
      round: 'render',
      itemId: item.id,
      selected,
      correctAnswer: item.correctAnswer,
      score,
      elapsedMs,
    }),
  }
}

function revealMultiplayerSpin(state) {
  const item = state.session.spinItem
  const players = state.players.map((player) => {
    if (!player.connected) return player
    const submitted = state.spinAnswers[player.id]
    const selected = submitted?.selections ?? []
    const elapsedMs = submitted?.elapsedMs ?? ROUND_TIMINGS.spin
    const score = scoreSpinDoctor({ selected, correctAnswer: item.correctAnswer })
    const isCorrect = score > 0
    const streak = isCorrect ? (player.streak || 0) + 1 : 0
    const maxStreak = Math.max(player.maxStreak || 0, streak)
    const answer = {
      round: 'spin', itemId: item.id, selected, correctAnswer: item.correctAnswer,
      correct: isCorrect, score, elapsedMs, streak,
    }
    return {
      ...player,
      score: player.score + score,
      streak,
      maxStreak,
      roundScores: { ...player.roundScores, spin: player.roundScores.spin + score },
      answers: [...player.answers, answer],
    }
  })
  return {
    ...state,
    phase: PHASES.SPIN_REVEAL,
    timerEndsAt: null,
    encountered: encounter(state, item),
    players,
  }
}

function revealMultiplayerRendered(state) {
  const item = state.session.renderItems[state.renderIndex]
  const players = state.players.map((player) => {
    if (!player.connected) return player
    const submitted = state.renderAnswers[player.id]
    const selected = submitted?.answer ?? null
    const elapsedMs = submitted?.elapsedMs ?? ROUND_TIMINGS.render
    const score = scoreRealOrRendered({ selected, correctAnswer: item.correctAnswer })
    const isCorrect = selected === item.correctAnswer
    const streak = isCorrect ? (player.streak || 0) + 1 : 0
    const maxStreak = Math.max(player.maxStreak || 0, streak)
    const answer = {
      round: 'render', itemId: item.id, selected, correctAnswer: item.correctAnswer,
      correct: isCorrect, score, elapsedMs, streak,
    }
    return {
      ...player,
      score: player.score + score,
      streak,
      maxStreak,
      roundScores: { ...player.roundScores, render: player.roundScores.render + score },
      answers: [...player.answers, answer],
    }
  })
  return {
    ...state,
    phase: PHASES.RENDER_REVEAL,
    timerEndsAt: null,
    encountered: encounter(state, item),
    players,
  }
}

function recordBonusAnswer(player, { item, selected, elapsedMs }) {
  const score = scoreChainOfCustody({ selected, correctAnswer: item.correctAnswer })
  const isCorrect = score > 0
  const streak = isCorrect ? (player.streak || 0) + 1 : 0
  const maxStreak = Math.max(player.maxStreak || 0, streak)
  const answer = {
    round: 'chain',
    itemId: item.id,
    selected,
    correctAnswer: item.correctAnswer,
    correct: isCorrect,
    score,
    elapsedMs,
    streak,
  }

  return {
    ...player,
    score: player.score + score,
    bonusScore: (player.bonusScore ?? 0) + score,
    streak,
    maxStreak,
    answers: [...player.answers, answer],
  }
}

function revealChain(state, selected, now) {
  const item = state.session.chainItem
  return {
    ...state,
    phase: PHASES.CHAIN_REVEAL,
    timerEndsAt: null,
    currentAnswer: selected,
    encountered: encounter(state, item),
    player: recordBonusAnswer(state.player, {
      item,
      selected,
      elapsedMs: clamp(now - state.phaseStartedAt, 0, CHAIN_TIMING),
    }),
  }
}

function revealMultiplayerChain(state) {
  const item = state.session.chainItem
  const players = state.players.map((player) => {
    if (!player.connected) return player
    const submitted = state.chainAnswers?.[player.id]
    return recordBonusAnswer(player, {
      item,
      selected: submitted?.order ?? [],
      elapsedMs: submitted?.elapsedMs ?? CHAIN_TIMING,
    })
  })

  return {
    ...state,
    phase: PHASES.CHAIN_REVEAL,
    timerEndsAt: null,
    encountered: encounter(state, item),
    players,
  }
}

function allConnectedAnswered(state, answers) {
  return state.players.filter((player) => player.connected).every((player) => answers[player.id])
}

function skipToReveal(state) {
  if (state.phase === PHASES.ODD_QUESTION) {
    return { ...state, phase: PHASES.ODD_REVEAL, timerEndsAt: null, encountered: encounter(state, state.session.oddItem) }
  }
  if (state.phase === PHASES.SPIN_QUESTION) {
    return { ...state, phase: PHASES.SPIN_REVEAL, timerEndsAt: null, encountered: encounter(state, state.session.spinItem) }
  }
  if (state.phase === PHASES.RENDER_QUESTION) {
    const item = state.session.renderItems[state.renderIndex]
    return { ...state, phase: PHASES.RENDER_REVEAL, timerEndsAt: null, encountered: encounter(state, item) }
  }
  return state
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_SESSION':
      if (state.phase !== PHASES.LOBBY) return state
      return { ...state, session: action.session }

    case 'ADD_PLAYER': {
      if (state.mode !== 'multiplayer') return state
      const existing = state.players.find((player) => player.id === action.player.id)
      if (existing) {
        return {
          ...state,
          players: state.players.map((player) => (
            player.id === action.player.id
              ? { ...player, name: action.player.name, avatar: action.player.avatar, connected: true, lastSeenAt: action.now ?? player.lastSeenAt }
              : player
          )),
        }
      }
      if (state.players.filter((player) => player.connected).length >= 8) return state
      return { ...state, players: [...state.players, createMultiplayerPlayer({ ...action.player, now: action.now })] }
    }

    case 'MARK_STALE_PLAYERS': {
      if (state.mode !== 'multiplayer') return state
      const players = state.players.map((player) => ({
        ...player,
        connected: action.now - player.lastSeenAt < action.staleAfterMs,
      }))
      const connectionChanged = players.some((player, index) => player.connected !== state.players[index].connected)
      if (!connectionChanged) return state
      const nextState = { ...state, players }
      if (state.paused) return nextState
      if (state.phase === PHASES.ODD_QUESTION && allConnectedAnswered(nextState, state.oddAnswers)) return revealMultiplayerOdd(nextState)
      if (state.phase === PHASES.SPIN_QUESTION && allConnectedAnswered(nextState, state.spinAnswers)) return revealMultiplayerSpin(nextState)
      if (state.phase === PHASES.RENDER_QUESTION && allConnectedAnswered(nextState, state.renderAnswers)) return revealMultiplayerRendered(nextState)
      return nextState
    }

    case 'START_GAME':
      if (state.phase !== PHASES.LOBBY) return state
      if (state.mode === 'multiplayer') {
        const activePlayerCount = state.players.filter((player) => player.connected).length
        if (activePlayerCount < 1 || activePlayerCount > 8) return state
      }
      return {
        ...state,
        ...phaseClock(PHASES.ODD_QUESTION, action.now, roundTiming(state, 'odd')),
        ...(state.mode === 'multiplayer' ? { oddAnswers: {} } : {}),
      }

    case 'ANSWER_ODD':
      if (state.phase !== PHASES.ODD_QUESTION) return state
      return revealOdd(state, action.answerId, action.now)

    case 'ANSWER_ODD_PLAYER': {
      if (state.mode !== 'multiplayer' || state.phase !== PHASES.ODD_QUESTION || state.paused) return state
      if (!state.players.some((player) => player.id === action.playerId && player.connected)) return state
      if (state.oddAnswers[action.playerId]) return state

      const nextState = {
        ...state,
        oddAnswers: {
          ...state.oddAnswers,
          [action.playerId]: {
            answerId: action.answerId,
            elapsedMs: clamp(action.now - state.phaseStartedAt, 0, ROUND_TIMINGS.odd),
          },
        },
      }
      const activePlayers = nextState.players.filter((player) => player.connected)
      const everyoneAnswered = activePlayers.every((player) => nextState.oddAnswers[player.id])
      return everyoneAnswered ? revealMultiplayerOdd(nextState) : nextState
    }

    case 'ANSWER_SPIN_PLAYER': {
      if (state.mode !== 'multiplayer' || state.phase !== PHASES.SPIN_QUESTION || state.paused) return state
      if (!state.players.some((player) => player.id === action.playerId && player.connected)) return state
      if (state.spinAnswers[action.playerId]) return state
      const selections = [...new Set(action.selections)].filter(Number.isInteger).slice(0, 3)
      const nextState = {
        ...state,
        spinAnswers: {
          ...state.spinAnswers,
          [action.playerId]: { selections, elapsedMs: clamp(action.now - state.phaseStartedAt, 0, ROUND_TIMINGS.spin) },
        },
      }
      return allConnectedAnswered(nextState, nextState.spinAnswers) ? revealMultiplayerSpin(nextState) : nextState
    }

    case 'ANSWER_RENDER_PLAYER': {
      if (state.mode !== 'multiplayer' || state.phase !== PHASES.RENDER_QUESTION || state.paused) return state
      if (!state.players.some((player) => player.id === action.playerId && player.connected)) return state
      if (state.renderAnswers[action.playerId]) return state
      if (!['real', 'rendered'].includes(action.answer)) return state
      const nextState = {
        ...state,
        renderAnswers: {
          ...state.renderAnswers,
          [action.playerId]: { answer: action.answer, elapsedMs: clamp(action.now - state.phaseStartedAt, 0, ROUND_TIMINGS.render) },
        },
      }
      return allConnectedAnswered(nextState, nextState.renderAnswers) ? revealMultiplayerRendered(nextState) : nextState
    }

    case 'TOGGLE_SPIN': {
      if (state.phase !== PHASES.SPIN_QUESTION) return state
      const selected = state.spinSelections.includes(action.phraseIndex)
      if (!selected && state.spinSelections.length >= 3) return state
      return {
        ...state,
        spinSelections: selected
          ? state.spinSelections.filter((index) => index !== action.phraseIndex)
          : [...state.spinSelections, action.phraseIndex],
      }
    }

    case 'SUBMIT_SPIN':
      if (state.phase !== PHASES.SPIN_QUESTION) return state
      return revealSpin(state, state.spinSelections, action.now)

    case 'ANSWER_RENDER':
      if (state.phase !== PHASES.RENDER_QUESTION) return state
      return revealRendered(state, action.answer, action.now)

    case 'TIME_EXPIRED':
      if (state.paused) return state
      if (state.phase === PHASES.ODD_QUESTION) {
        return state.mode === 'multiplayer' ? revealMultiplayerOdd(state) : revealOdd(state, null, action.now)
      }
      if (state.phase === PHASES.SPIN_QUESTION) return state.mode === 'multiplayer' ? revealMultiplayerSpin(state) : revealSpin(state, state.spinSelections, action.now)
      if (state.phase === PHASES.RENDER_QUESTION) return state.mode === 'multiplayer' ? revealMultiplayerRendered(state) : revealRendered(state, null, action.now)
      return state

    case 'NEXT_PHASE':
      if (state.phase === PHASES.ODD_REVEAL) {
        return {
          ...state,
          ...phaseClock(PHASES.SPIN_QUESTION, action.now, roundTiming(state, 'spin')),
          spinSelections: [],
          ...(state.mode === 'multiplayer' ? { spinAnswers: {} } : {}),
        }
      }
      if (state.phase === PHASES.SPIN_REVEAL) {
        return {
          ...state,
          ...phaseClock(PHASES.RENDER_QUESTION, action.now, roundTiming(state, 'render')),
          renderIndex: 0,
          ...(state.mode === 'multiplayer' ? { renderAnswers: {} } : {}),
        }
      }
      if (state.phase === PHASES.RENDER_REVEAL) {
        const nextIndex = state.renderIndex + 1
        if (nextIndex >= state.session.renderItems.length) {
          return { ...state, phase: PHASES.SCOREBOARD, currentAnswer: null, timerEndsAt: null }
        }
        return {
          ...state,
          ...phaseClock(PHASES.RENDER_QUESTION, action.now, roundTiming(state, 'render')),
          renderIndex: nextIndex,
          ...(state.mode === 'multiplayer' ? { renderAnswers: {} } : {}),
        }
      }
      return state

    case 'PAUSE_GAME': {
      if (state.mode !== 'multiplayer' || state.paused || state.timerEndsAt === null) return state
      return {
        ...state,
        paused: true,
        pausedRemainingMs: Math.max(0, state.timerEndsAt - action.now),
        pausedElapsedMs: Math.max(0, action.now - state.phaseStartedAt),
        timerEndsAt: null,
      }
    }

    case 'RESUME_GAME':
      if (state.mode !== 'multiplayer' || !state.paused) return state
      return {
        ...state,
        paused: false,
        phaseStartedAt: action.now - state.pausedElapsedMs,
        timerEndsAt: action.now + state.pausedRemainingMs,
        pausedRemainingMs: null,
        pausedElapsedMs: null,
      }

    case 'SKIP_ROUND':
      if (state.mode !== 'multiplayer') return state
      return { ...skipToReveal(state), paused: false, pausedRemainingMs: null, pausedElapsedMs: null }

    case 'END_EARLY':
      if (state.mode !== 'multiplayer' || state.phase === PHASES.LOBBY) return state
      return { ...state, phase: PHASES.SCOREBOARD, timerEndsAt: null, paused: false, pausedRemainingMs: null, pausedElapsedMs: null }

    /* Bonus round. Every case below is reachable only from the scoreboard, so
       the three core rounds and the twelve minute session are unaffected. */
    case 'START_BONUS': {
      if (state.phase !== PHASES.SCOREBOARD || !state.session.chainItem) return state
      return {
        ...state,
        phase: PHASES.CHAIN_QUESTION,
        phaseStartedAt: action.now,
        timerEndsAt: action.now + CHAIN_TIMING + (state.mode === 'solo' ? SINGLE_SCREEN_TIME_BONUS : 0),
        currentAnswer: null,
        chainSelections: [],
        ...(state.mode === 'multiplayer' ? { chainAnswers: {}, paused: false } : {}),
      }
    }

    case 'TOGGLE_CHAIN': {
      if (state.phase !== PHASES.CHAIN_QUESTION) return state
      const selections = state.chainSelections ?? []
      if (selections.includes(action.retellingId)) {
        return { ...state, chainSelections: selections.filter((id) => id !== action.retellingId) }
      }
      if (selections.length >= state.session.chainItem.material.retellings.length) return state
      return { ...state, chainSelections: [...selections, action.retellingId] }
    }

    case 'RESET_CHAIN':
      if (state.phase !== PHASES.CHAIN_QUESTION) return state
      return { ...state, chainSelections: [] }

    case 'SUBMIT_CHAIN':
      if (state.phase !== PHASES.CHAIN_QUESTION) return state
      return revealChain(state, state.chainSelections ?? [], action.now)

    case 'ANSWER_CHAIN_PLAYER': {
      if (state.mode !== 'multiplayer' || state.phase !== PHASES.CHAIN_QUESTION || state.paused) return state
      if (!state.players.some((player) => player.id === action.playerId && player.connected)) return state
      if (state.chainAnswers?.[action.playerId]) return state
      const validIds = new Set(state.session.chainItem.material.retellings.map((retelling) => retelling.id))
      const order = [...new Set(action.order ?? [])].filter((id) => validIds.has(id)).slice(0, validIds.size)
      const nextState = {
        ...state,
        chainAnswers: {
          ...state.chainAnswers,
          [action.playerId]: { order, elapsedMs: clamp(action.now - state.phaseStartedAt, 0, CHAIN_TIMING) },
        },
      }
      return allConnectedAnswered(nextState, nextState.chainAnswers) ? revealMultiplayerChain(nextState) : nextState
    }

    case 'CHAIN_TIME_EXPIRED':
      if (state.phase !== PHASES.CHAIN_QUESTION || state.paused) return state
      return state.mode === 'multiplayer'
        ? revealMultiplayerChain(state)
        : revealChain(state, state.chainSelections ?? [], action.now)

    case 'END_BONUS':
      if (state.phase !== PHASES.CHAIN_REVEAL) return state
      return { ...state, phase: PHASES.SCOREBOARD, currentAnswer: null, timerEndsAt: null }

    case 'PLAY_AGAIN':
      if (state.mode === 'multiplayer') {
        return {
          ...createMultiplayerGameState(state.session),
          players: state.players.map((player) => ({
            ...createMultiplayerPlayer({ ...player, now: player.lastSeenAt }),
            connected: player.connected,
          })),
        }
      }
      return createInitialGameState(state.session)

    default:
      return state
  }
}
