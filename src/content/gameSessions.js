import englishContent from './en.js'

export const gameContent = englishContent

function pickRandom(array) {
  if (!array || array.length === 0) return null
  return array[Math.floor(Math.random() * array.length)]
}

function shuffle(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function createGameSession(options = {}) {
  const { randomized = false, caseSeed } = options
  const oddPool = englishContent.rounds.oddSourceOut
  const spinPool = englishContent.rounds.spinDoctor
  const renderPool = englishContent.rounds.realOrRendered
  const chainPool = englishContent.rounds.chainOfCustody

  let oddItem = oddPool[0]
  let spinItem = spinPool[0]
  let renderItems = renderPool.slice(0, 5)
  let chainItem = chainPool[0]

  if (randomized) {
    oddItem = pickRandom(oddPool) || oddPool[0]
    spinItem = pickRandom(spinPool) || spinPool[0]
    renderItems = shuffle(renderPool).slice(0, 5)
    chainItem = pickRandom(chainPool) || chainPool[0]
  } else if (typeof caseSeed === 'number') {
    oddItem = oddPool[caseSeed % oddPool.length]
    spinItem = spinPool[caseSeed % spinPool.length]
    chainItem = chainPool[caseSeed % chainPool.length]
  }

  return {
    locale: englishContent.locale,
    oddItem,
    spinItem,
    renderItems,
    chainItem,
  }
}
