import test from 'node:test'
import assert from 'node:assert/strict'
import { createMultiplayerGameState, gameReducer } from './gameReducer.js'
import { buildPublicSnapshot } from './publicSnapshot.js'

const oddItem = {
  id: 'odd-secret-test',
  material: {
    event: 'Host-only event title',
    sources: [
      { id: 'a', label: 'A', source: 'Host source A', headline: 'Host headline A' },
      { id: 'b', label: 'B', source: 'Host source B', headline: 'Host headline B' },
      { id: 'c', label: 'C', source: 'Host source C', headline: 'Host headline C' },
      { id: 'd', label: 'D', source: 'Host source D', headline: 'Host headline D' },
    ],
  },
  correctAnswer: 'b',
  technique: 'Secret technique before reveal',
  explanation: 'Secret explanation before reveal.',
  fabricated: true,
}

const spinItem = {
  id: 'spin-secret-test',
  material: { phrases: ['Public one', 'Public two', 'Public three'] },
  correctAnswer: [0, 2],
  technique: 'Hidden spin technique',
  explanation: 'Hidden spin explanation',
  fabricated: true,
}
const renderItem = {
  id: 'render-secret-test',
  material: { kind: 'text', prompt: 'Public item prompt' },
  correctAnswer: 'rendered',
  technique: 'Hidden render technique',
  explanation: 'Hidden render explanation',
  fabricated: true,
}
const session = { oddItem, spinItem, renderItems: [renderItem] }

function readyQuestionState() {
  let state = createMultiplayerGameState(session)
  for (const id of ['one', 'two', 'three']) {
    state = gameReducer(state, { type: 'ADD_PLAYER', player: { id, name: id, avatar: 'cat' } })
  }
  return gameReducer(state, { type: 'START_GAME', now: 1_000 })
}

test('question snapshot contains choices but no answer key, headlines, sources, or explanation', () => {
  const snapshot = buildPublicSnapshot(readyQuestionState())
  const serialised = JSON.stringify(snapshot)

  assert.deepEqual(snapshot.publicQuestion.choices.map((choice) => choice.label), ['A', 'B', 'C', 'D'])
  assert.equal(snapshot.reveal, null)
  assert.equal(serialised.includes('correctAnswer'), false)
  assert.equal(serialised.includes('Host headline'), false)
  assert.equal(serialised.includes('Host source'), false)
  assert.equal(serialised.includes('Secret technique'), false)
  assert.equal(serialised.includes('Secret explanation'), false)
})

test('reveal snapshot adds answer, explanation, and personal results', () => {
  let state = readyQuestionState()
  state = gameReducer(state, { type: 'ANSWER_ODD_PLAYER', playerId: 'one', answerId: 'b', now: 2_000 })
  state = gameReducer(state, { type: 'TIME_EXPIRED', now: 11_000 })
  const snapshot = buildPublicSnapshot(state)

  assert.equal(snapshot.reveal.correctAnswer, 'b')
  assert.equal(snapshot.reveal.technique, oddItem.technique)
  assert.equal(snapshot.reveal.explanation, oddItem.explanation)
  assert.deepEqual(snapshot.reveal.results.find((result) => result.playerId === 'one'), {
    playerId: 'one',
    answered: true,
    correct: true,
    score: 145,
  })
})

test('Spin Doctor and Real or Rendered questions never expose answer keys', () => {
  let state = readyQuestionState()
  state = gameReducer(state, { type: 'TIME_EXPIRED', now: 11_000 })
  state = gameReducer(state, { type: 'NEXT_PHASE', now: 12_000 })
  let snapshot = buildPublicSnapshot(state)
  assert.deepEqual(snapshot.publicQuestion.phrases, spinItem.material.phrases)
  assert.equal(JSON.stringify(snapshot).includes('Hidden spin'), false)
  assert.equal(JSON.stringify(snapshot).includes('correctAnswer'), false)

  state = gameReducer(state, { type: 'TIME_EXPIRED', now: 27_000 })
  state = gameReducer(state, { type: 'NEXT_PHASE', now: 28_000 })
  snapshot = buildPublicSnapshot(state)
  assert.equal(snapshot.publicQuestion.material.prompt, 'Public item prompt')
  assert.equal(JSON.stringify(snapshot).includes('Hidden render'), false)
  assert.equal(JSON.stringify(snapshot).includes('correctAnswer'), false)
})

const chainItem = {
  id: 'chain-secret-test',
  material: {
    claim: 'Host-only claim',
    retellings: [
      { id: 'a', label: 'A', text: 'Host retelling A', note: 'Hidden chain note A' },
      { id: 'b', label: 'B', text: 'Host retelling B', note: 'Hidden chain note B' },
      { id: 'c', label: 'C', text: 'Host retelling C', note: 'Hidden chain note C' },
      { id: 'd', label: 'D', text: 'Host retelling D', note: 'Hidden chain note D' },
    ],
  },
  correctAnswer: ['b', 'a', 'd', 'c'],
  technique: 'Hidden chain technique',
  explanation: 'Hidden chain explanation',
  fabricated: true,
}

test('the bonus round question ships letters only, and its reveal ships the true order', () => {
  let state = createMultiplayerGameState({ ...session, chainItem })
  for (const id of ['one', 'two']) {
    state = gameReducer(state, { type: 'ADD_PLAYER', player: { id, name: id, avatar: 'cat' }, now: 0 })
  }
  state = { ...state, phase: 'scoreboard' }
  state = gameReducer(state, { type: 'START_BONUS', now: 1_000 })

  let snapshot = buildPublicSnapshot(state)
  assert.deepEqual(snapshot.publicQuestion.choices.map((choice) => choice.id), ['a', 'b', 'c', 'd'])
  const questionJson = JSON.stringify(snapshot)
  assert.equal(questionJson.includes('Host retelling'), false)
  assert.equal(questionJson.includes('Hidden chain'), false)
  assert.equal(questionJson.includes('Host-only claim'), false)

  state = gameReducer(state, { type: 'CHAIN_TIME_EXPIRED', now: 21_000 })
  snapshot = buildPublicSnapshot(state)
  assert.deepEqual(snapshot.reveal.chainOrder.map((retelling) => retelling.id), ['b', 'a', 'd', 'c'])
  assert.equal(snapshot.reveal.technique, 'Hidden chain technique')
})
