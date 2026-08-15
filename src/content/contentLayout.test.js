import test from 'node:test'
import assert from 'node:assert/strict'
import englishContent from './en.js'
import filipinoContent from './fil.js'
import { createGameSession } from './gameSessions.js'

test('bundled content has no unbreakable token capable of overflowing a card', () => {
  const tokens = JSON.stringify([englishContent, filipinoContent]).match(/[A-Za-z]+/g)
  const longestToken = tokens.sort((a, b) => b.length - a.length)[0]
  assert.ok(longestToken.length <= 32, `Unbreakable token is too long: ${longestToken}`)
})

test('English and Filipino content use the same round shape', () => {
  for (const round of ['oddSourceOut', 'spinDoctor', 'realOrRendered', 'chainOfCustody']) {
    assert.equal(filipinoContent.rounds[round].length, englishContent.rounds[round].length)
    assert.deepEqual(
      filipinoContent.rounds[round].map((item) => item.id),
      englishContent.rounds[round].map((item) => item.id),
    )
  }
  assert.equal(createGameSession('fil').locale, 'fil')
  assert.equal(createGameSession('en').locale, 'en')
})

test('every bonus round item lists each retelling exactly once in its answer order', () => {
  for (const content of [englishContent, filipinoContent]) {
    for (const item of content.rounds.chainOfCustody) {
      const ids = item.material.retellings.map((retelling) => retelling.id)
      assert.equal(new Set(ids).size, ids.length)
      assert.deepEqual([...item.correctAnswer].sort(), [...ids].sort())
      for (const retelling of item.material.retellings) assert.ok(retelling.note.length > 0)
    }
  }
})
