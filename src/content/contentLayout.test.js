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

test('every round item has a valid non-empty explanation string under maximum display threshold', () => {
  for (const [roundKey, items] of Object.entries(englishContent.rounds)) {
    const sortedByLength = [...items].sort((a, b) => b.explanation.length - a.explanation.length)
    const longestItem = sortedByLength[0]
    assert.ok(longestItem.explanation.length > 0, `Round ${roundKey} has empty explanation`)
    assert.ok(longestItem.explanation.length <= 200, `Longest explanation in ${roundKey} is unexpectedly long (${longestItem.explanation.length} chars): ${longestItem.explanation}`)
    
    // Verify all items in this round have valid explanations
    for (const item of items) {
      assert.equal(typeof item.explanation, 'string')
      assert.ok(item.explanation.trim().length > 0)
    }
  }
})

test('Odd Source Out longest explanation string formats cleanly', () => {
  const oddItems = englishContent.rounds.oddSourceOut
  const longestOdd = [...oddItems].sort((a, b) => b.explanation.length - a.explanation.length)[0]
  assert.equal(longestOdd.id, 'odd-space-07')
  assert.equal(longestOdd.explanation, 'A routine, distant flyby is converted into guaranteed catastrophe using a fake refusal-to-deny conspiracy trope.')
  assert.ok(longestOdd.explanation.length >= 100)
})

test('Real or Rendered evidence descriptions are non-empty and longest items stay bounded', () => {
  const renderItems = englishContent.rounds.realOrRendered
  const sorted = [...renderItems].sort((a, b) => (b.material.prompt?.length ?? 0) - (a.material.prompt?.length ?? 0))
  const longest = sorted[0]
  assert.equal(longest.id, 'render-receipt-08')
  assert.equal(longest.material.prompt, 'A grocery register receipt showing itemized purchases, 6 percent sales tax calculation, cashier ID, and timestamp.')
  assert.ok(longest.material.prompt.length >= 110 && longest.material.prompt.length <= 160)

  // Verify second longest
  const secondLongest = sorted[1]
  assert.equal(secondLongest.id, 'render-press-06')
  assert.equal(secondLongest.material.prompt, 'A university lab press release lists lead researcher names, peer-reviewed journal volume, and funding disclosure.')

  // Verify all prompts in this round are well-formed strings
  for (const item of renderItems) {
    assert.equal(typeof item.material.prompt, 'string')
    assert.ok(item.material.prompt.trim().length > 0)
    assert.ok(item.material.prompt.length <= 160, `Prompt for ${item.id} is unexpectedly long: ${item.material.prompt}`)
  }
})


