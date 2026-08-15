import test from 'node:test'
import assert from 'node:assert/strict'
import { validatePlayerName } from './index.js'

test('English player-name validation accepts ordinary names and blocks profanity', () => {
  assert.equal(validatePlayerName('Mina').valid, true)
  assert.equal(validatePlayerName('sh1t').valid, false)
  assert.equal(validatePlayerName('d1ckhead').valid, false)
  assert.equal(validatePlayerName('  ').valid, false)
})
