import { PHASES, assignPlayerTitles } from './gameReducer.js'

const choiceColours = ['ocean', 'coral', 'lime', 'sunshine']

function currentAnswers(state) {
  if (state.phase === PHASES.ODD_QUESTION) return state.oddAnswers
  if (state.phase === PHASES.SPIN_QUESTION) return state.spinAnswers
  if (state.phase === PHASES.RENDER_QUESTION) return state.renderAnswers
  if (state.phase === PHASES.CHAIN_QUESTION) return state.chainAnswers ?? {}
  return {}
}

function publicPlayers(state) {
  const answers = currentAnswers(state)
  return state.players.map((player) => ({
    id: player.id,
    name: player.name,
    avatar: player.avatar,
    score: player.score,
    streak: player.streak ?? 0,
    connected: player.connected,
    hasAnswered: Boolean(answers[player.id]),
  }))
}

function publicQuestion(state) {
  if (state.phase === PHASES.ODD_QUESTION) {
    return {
      id: state.session.oddItem.id,
      choices: state.session.oddItem.material.sources.map((source, index) => ({
        id: source.id,
        label: source.label,
        colour: choiceColours[index],
      })),
    }
  }
  if (state.phase === PHASES.SPIN_QUESTION) {
    return { id: state.session.spinItem.id, phrases: state.session.spinItem.material.phrases }
  }
  if (state.phase === PHASES.RENDER_QUESTION) {
    const item = state.session.renderItems[state.renderIndex]
    return {
      id: item.id,
      material: item.material,
      itemNumber: state.renderIndex + 1,
      itemTotal: state.session.renderItems.length,
    }
  }
  if (state.phase === PHASES.CHAIN_QUESTION) {
    const item = state.session.chainItem
    return {
      id: item.id,
      choices: item.material.retellings.map((retelling, index) => ({
        id: retelling.id,
        label: retelling.label,
        colour: choiceColours[index],
      })),
    }
  }
  return null
}

function resultFor(player, round, itemId) {
  const answer = player.answers.findLast((entry) => entry.round === round && entry.itemId === itemId)
  return {
    playerId: player.id,
    answered: answer?.selected !== null && answer?.selected !== undefined,
    ...(round === 'spin' || round === 'chain' ? { selected: answer?.selected ?? [] } : {}),
    correct: answer?.correct ?? false,
    score: answer?.score ?? 0,
  }
}

function publicReveal(state) {
  let item
  let round
  if (state.phase === PHASES.ODD_REVEAL) {
    item = state.session.oddItem
    round = 'odd'
  } else if (state.phase === PHASES.SPIN_REVEAL) {
    item = state.session.spinItem
    round = 'spin'
  } else if (state.phase === PHASES.RENDER_REVEAL) {
    item = state.session.renderItems[state.renderIndex]
    round = 'render'
  } else if (state.phase === PHASES.CHAIN_REVEAL) {
    item = state.session.chainItem
    round = 'chain'
  } else {
    return null
  }

  return {
    itemId: item.id,
    correctAnswer: item.correctAnswer,
    technique: item.technique,
    explanation: item.explanation,
    fabricated: item.fabricated,
    ...(round === 'chain'
      ? { chainOrder: item.correctAnswer.map((id) => item.material.retellings.find((retelling) => retelling.id === id)) }
      : {}),
    results: state.players.map((player) => resultFor(player, round, item.id)),
  }
}

function roundId(state) {
  if ([PHASES.ODD_QUESTION, PHASES.ODD_REVEAL].includes(state.phase)) return state.session.oddItem.id
  if ([PHASES.SPIN_QUESTION, PHASES.SPIN_REVEAL].includes(state.phase)) return state.session.spinItem.id
  if ([PHASES.RENDER_QUESTION, PHASES.RENDER_REVEAL].includes(state.phase)) return state.session.renderItems[state.renderIndex].id
  if ([PHASES.CHAIN_QUESTION, PHASES.CHAIN_REVEAL].includes(state.phase)) return state.session.chainItem.id
  return null
}

export function buildPublicSnapshot(state) {
  return {
    currentPhase: state.phase,
    currentRoundId: roundId(state),
    timerStartedAt: state.phaseStartedAt,
    timerEndsAt: state.timerEndsAt,
    paused: Boolean(state.paused),
    players: publicPlayers(state),
    publicQuestion: publicQuestion(state),
    reveal: publicReveal(state),
    titles: state.phase === PHASES.SCOREBOARD ? assignPlayerTitles(state.players) : {},
  }
}
