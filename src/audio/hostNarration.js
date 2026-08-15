import { PHASES } from '../game/gameReducer.js'

export function getHostNarration(state) {
  if (state.phase === PHASES.ODD_QUESTION) {
    const item = state.session.oddItem
    const sources = item.material.sources.map((source) => `${source.label}. ${source.source}. ${source.headline}`).join(' ')
    return `${item.material.event}. ${sources}`
  }
  if (state.phase === PHASES.SPIN_QUESTION) return state.session.spinItem.material.phrases.join(' ')
  if (state.phase === PHASES.RENDER_QUESTION) return state.session.renderItems[state.renderIndex].material.prompt
  if (state.phase === PHASES.ODD_REVEAL) {
    const item = state.session.oddItem
    return `${item.technique}. ${item.explanation}`
  }
  if (state.phase === PHASES.SPIN_REVEAL) {
    const item = state.session.spinItem
    return `${item.technique}. ${item.explanation}`
  }
  if (state.phase === PHASES.RENDER_REVEAL) {
    const item = state.session.renderItems[state.renderIndex]
    return `${item.correctAnswer}. ${item.technique}. ${item.explanation}`
  }
  return ''
}
