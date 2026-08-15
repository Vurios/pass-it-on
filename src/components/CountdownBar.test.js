import test from 'node:test'
import assert from 'node:assert/strict'
import { getCountdownFrame } from './countdownClock.js'

test('host and phone countdown frames finish at the same host-clock moment', () => {
  const timestamps = { startTimestamp: 10_000, endTimestamp: 20_000 }
  const host = getCountdownFrame({ ...timestamps, now: 17_250, clockOffset: 0 })
  const phone = getCountdownFrame({ ...timestamps, now: 15_250, clockOffset: 2_000 })
  assert.deepEqual(phone, host)
  assert.equal(getCountdownFrame({ ...timestamps, now: 20_000, clockOffset: 0 }).remaining, 0)
  assert.equal(getCountdownFrame({ ...timestamps, now: 18_000, clockOffset: 2_000 }).remaining, 0)
})
