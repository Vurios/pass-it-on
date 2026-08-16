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
  const opts = typeof options === 'string' ? { locale: options } : options
  const { randomized = true, caseSeed } = opts
  const oddPool = englishContent.rounds.oddSourceOut
  const spinPool = englishContent.rounds.spinDoctor
  const renderPool = englishContent.rounds.realOrRendered
  const chainPool = englishContent.rounds.chainOfCustody

  let oddItem = oddPool[0]
  let spinItem = spinPool[0]
  let renderItems = renderPool.slice(0, 5)
  let chainItem = chainPool[0]

  if (typeof caseSeed === 'number') {
    oddItem = oddPool[Math.abs(caseSeed) % oddPool.length]
    spinItem = spinPool[Math.abs(caseSeed) % spinPool.length]
    chainItem = chainPool[Math.abs(caseSeed) % chainPool.length]
    renderItems = renderPool.slice(0, 5)
  } else if (randomized) {
    oddItem = pickRandom(oddPool) || oddPool[0]
    spinItem = pickRandom(spinPool) || spinPool[0]
    renderItems = shuffle(renderPool).slice(0, 5)
    chainItem = pickRandom(chainPool) || chainPool[0]
  }

  return {
    locale: englishContent.locale,
    oddItem,
    spinItem,
    renderItems,
    chainItem,
  }
}
