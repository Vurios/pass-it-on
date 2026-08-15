import test from 'node:test'
import assert from 'node:assert/strict'
import { createReactionGate, REALTIME_REACTIONS } from './reactionProtocol.js'

test('reaction protocol exposes four reactions and permits one every two seconds', () => {
  let time = 10_000
  const gate = createReactionGate({ now: () => time })
  assert.deepEqual(REALTIME_REACTIONS, ['👏', '😮', '😂', '🤔'])
  assert.equal(gate.allow(), true)
  time += 1_999
  assert.equal(gate.allow(), false)
  time += 1
  assert.equal(gate.allow(), true)
})
