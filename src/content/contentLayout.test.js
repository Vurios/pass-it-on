import test from 'node:test'
import assert from 'node:assert/strict'
import englishContent from './en.js'
import { createGameSession } from './gameSessions.js'

test('bundled content has no unbreakable token capable of overflowing a card', () => {
  const tokens = JSON.stringify([englishContent]).match(/[A-Za-z]+/g)
  const longestToken = tokens.sort((a, b) => b.length - a.length)[0]
  assert.ok(longestToken.length <= 32, `Unbreakable token is too long: ${longestToken}`)
})

test('English content defines all required rounds', () => {
  for (const round of ['oddSourceOut', 'spinDoctor', 'realOrRendered', 'chainOfCustody']) {
    assert.ok(englishContent.rounds[round].length > 0)
  }
  assert.equal(createGameSession().locale, 'en')
})

test('every bonus round item lists each retelling exactly once in its answer order', () => {
  for (const item of englishContent.rounds.chainOfCustody) {
    const ids = item.material.retellings.map((retelling) => retelling.id)
    assert.equal(new Set(ids).size, ids.length)
    assert.deepEqual([...item.correctAnswer].sort(), [...ids].sort())
    for (const retelling of item.material.retellings) assert.ok(retelling.note.length > 0)
  }
})
