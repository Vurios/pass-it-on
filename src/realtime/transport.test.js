import test from 'node:test'
import assert from 'node:assert/strict'
import { REALTIME_MESSAGE_TYPES } from './transport.js'

test('transport contract contains exactly the six specified message types', () => {
  assert.deepEqual(
    [...REALTIME_MESSAGE_TYPES],
    ['probe', 'occupied', 'hello', 'state', 'answer', 'react'],
  )
})
