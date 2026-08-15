import englishContent from './en.js'
import filipinoContent from './fil.js'

export const gameContentByLocale = Object.freeze({ en: englishContent, fil: filipinoContent })

export function createGameSession(locale = 'en') {
  const content = gameContentByLocale[locale] ?? englishContent
  return {
    locale: content.locale,
    oddItem: content.rounds.oddSourceOut[0],
    spinItem: content.rounds.spinDoctor[0],
    renderItems: content.rounds.realOrRendered.slice(0, 5),
    chainItem: content.rounds.chainOfCustody[0],
  }
}
