import test from 'node:test'
import assert from 'node:assert/strict'
import { PHASES } from '../game/gameReducer.js'
import { createGameSession } from '../content/gameSessions.js'
import { getHostNarration } from './hostNarration.js'

test('host narration reads question and reveal content', () => {
  const session = createGameSession()
  const question = getHostNarration({ phase: PHASES.SPIN_QUESTION, session, renderIndex: 0 })
  const reveal = getHostNarration({ phase: PHASES.RENDER_REVEAL, session, renderIndex: 0 })
  assert.equal(question, session.spinItem.material.phrases.join(' '))
  assert.ok(reveal.includes(session.renderItems[0].technique))
  assert.equal(getHostNarration({ phase: PHASES.LOBBY, session, renderIndex: 0 }), '')
})
