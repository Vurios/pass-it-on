import englishContent from './en.js'

export const gameContent = englishContent

export function createGameSession() {
  return {
    locale: englishContent.locale,
    oddItem: englishContent.rounds.oddSourceOut[0],
    spinItem: englishContent.rounds.spinDoctor[0],
    renderItems: englishContent.rounds.realOrRendered.slice(0, 5),
    chainItem: englishContent.rounds.chainOfCustody[0],
  }
}
