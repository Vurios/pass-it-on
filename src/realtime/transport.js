import { createClient } from '@supabase/supabase-js'
import { createReactionGate, REACTION_COOLDOWN_MS, REALTIME_REACTIONS } from './reactionProtocol.js'

export const REALTIME_MESSAGE_TYPES = Object.freeze([
  'probe',
  'occupied',
  'hello',
  'state',
  'answer',
  'react',
])

const ROOM_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ'
const ROOM_CODE_LENGTH = 4
const PLAYER_ID_KEY = 'pass-it-on:player-id'
const PLAYER_STALE_AFTER_MS = 5_000
const PLAYER_WATCHDOG_INTERVAL_MS = 1_000
const PLAYER_HEARTBEAT_MS = 3_000
const REACTIONS = new Set(REALTIME_REACTIONS)
const HOST_SEND_TYPES = new Set(['state'])
const PLAYER_SEND_TYPES = new Set(['answer', 'react'])
const SUBSCRIPTION_FAILURES = new Set(['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'])

let supabaseClient

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient

  const environment = import.meta.env ?? {}
  const url = environment.VITE_SUPABASE_URL
  const anonKey = environment.VITE_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.')
  }

  supabaseClient = createClient(url, anonKey)
  return supabaseClient
}

function randomIndex(maximum) {
  const values = new Uint32Array(1)
  crypto.getRandomValues(values)
  return values[0] % maximum
}

function createRoomCode() {
  return Array.from(
    { length: ROOM_CODE_LENGTH },
    () => ROOM_ALPHABET[randomIndex(ROOM_ALPHABET.length)],
  ).join('')
}

function normaliseRoomCode(roomCode) {
  const normalised = String(roomCode ?? '').trim().toUpperCase()
  const pattern = new RegExp(`^[${ROOM_ALPHABET}]{${ROOM_CODE_LENGTH}}$`)
  if (!pattern.test(normalised)) {
    throw new Error('Room code must be four letters and cannot contain I, L, or O.')
  }
  return normalised
}

function ownPlayerId() {
  const existing = localStorage.getItem(PLAYER_ID_KEY)
  if (existing) return existing
  const created = crypto.randomUUID()
  localStorage.setItem(PLAYER_ID_KEY, created)
  return created
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function validSnapshot(snapshot) {
  if (!isObject(snapshot)) return false
  return (
    typeof snapshot.currentPhase === 'string'
    && (typeof snapshot.currentRoundId === 'string' || snapshot.currentRoundId === null)
    && (typeof snapshot.timerEndsAt === 'number' || snapshot.timerEndsAt === null)
    && typeof snapshot.hostTime === 'number'
    && Array.isArray(snapshot.players)
    && (isObject(snapshot.publicQuestion) || snapshot.publicQuestion === null)
    && (isObject(snapshot.reveal) || snapshot.reveal === null)
  )
}

function isProtocolMessage(message) {
  if (!isObject(message) || !REALTIME_MESSAGE_TYPES.includes(message.type)) return false

  switch (message.type) {
    case 'probe':
    case 'occupied':
      return true
    case 'hello':
      return (
        typeof message.playerId === 'string'
        && typeof message.name === 'string'
        && typeof message.avatar === 'string'
      )
    case 'state':
      return validSnapshot(message.snapshot)
    case 'answer':
      return (
        typeof message.playerId === 'string'
        && typeof message.round === 'string'
        && message.intent !== undefined
      )
    case 'react':
      return typeof message.playerId === 'string' && REACTIONS.has(message.reaction)
    default:
      return false
  }
}

function createChannel(roomCode, acceptedTypes, onMessage, onStatus) {
  const channel = getSupabaseClient().channel(roomCode, {
    config: { broadcast: { ack: true, self: false } },
  })

  for (const type of acceptedTypes) {
    channel.on('broadcast', { event: type }, (envelope) => {
      const message = envelope.payload
      if (isProtocolMessage(message) && message.type === type) {
        Promise.resolve(onMessage(message)).catch(() => {})
      }
    })
  }

  channel.subscribe((status, error) => onStatus(status, error))
  return channel
}

function waitForSubscription(createChannelCallback, timeoutMs = 10_000) {
  return new Promise((resolve, reject) => {
    let settled = false
    const timeout = window.setTimeout(() => {
      if (settled) return
      settled = true
      reject(new Error('Realtime connection timed out.'))
    }, timeoutMs)

    const channel = createChannelCallback((status, error) => {
      if (status === 'SUBSCRIBED') {
        if (!settled) {
          settled = true
          window.clearTimeout(timeout)
          resolve(channel)
        }
        return
      }

      if (SUBSCRIPTION_FAILURES.has(status) && !settled) {
        settled = true
        window.clearTimeout(timeout)
        reject(error ?? new Error(`Realtime connection failed: ${status}`))
      }
    })
  })
}

async function broadcast(channel, message) {
  if (!isProtocolMessage(message)) throw new Error('Invalid realtime message.')

  const result = await channel.send({
    type: 'broadcast',
    event: message.type,
    payload: message,
  })

  if (result !== 'ok') throw new Error(`Realtime send failed: ${result}`)
}

function createListenerSet() {
  const listeners = new Set()
  const pending = []
  return {
    emit(message, metadata) {
      if (listeners.size === 0) {
        pending.push({ message, metadata })
        if (pending.length > 20) pending.shift()
        return
      }
      for (const listener of listeners) listener(message, metadata)
    },
    subscribe(listener) {
      if (typeof listener !== 'function') throw new Error('Subscriber must be a function.')
      listeners.add(listener)
      for (const entry of pending.splice(0)) listener(entry.message, entry.metadata)
      return () => listeners.delete(listener)
    },
    clear() {
      listeners.clear()
      pending.length = 0
    },
  }
}

async function removeChannel(channel) {
  if (!channel) return
  await getSupabaseClient().removeChannel(channel)
}

export async function createHostRoom({ probeWindowMs = 700, maxAttempts = 12 } = {}) {
  const listeners = createListenerSet()

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const roomCode = createRoomCode()
    let occupied = false
    let claimed = false
    let lastSnapshot = null
    let channel
    const lastReactionByPlayer = new Map()

    const onMessage = async (message) => {
      if (message.type === 'occupied' && !claimed) {
        occupied = true
        return
      }

      if (message.type === 'probe') {
        if (claimed) await broadcast(channel, { type: 'occupied' })
        return
      }

      if (message.type === 'react') {
        const now = Date.now()
        const lastReactionAt = lastReactionByPlayer.get(message.playerId) ?? Number.NEGATIVE_INFINITY
        if (now - lastReactionAt < REACTION_COOLDOWN_MS) return
        lastReactionByPlayer.set(message.playerId, now)
      }

      listeners.emit(message, { clockOffset: 0 })

      if (message.type === 'hello' && lastSnapshot) {
        await broadcast(channel, {
          type: 'state',
          snapshot: { ...lastSnapshot, hostTime: Date.now() },
        })
      }
    }

    try {
      channel = await waitForSubscription((onStatus) => {
        const candidate = createChannel(
          roomCode,
          ['probe', 'occupied', 'hello', 'answer', 'react'],
          onMessage,
          onStatus,
        )
        channel = candidate
        return candidate
      })
      await broadcast(channel, { type: 'probe' })
      await new Promise((resolve) => window.setTimeout(resolve, probeWindowMs))

      if (occupied) {
        await removeChannel(channel)
        continue
      }

      claimed = true
      let left = false

      return {
        role: 'host',
        roomCode,
        async send(message) {
          if (left) throw new Error('Room connection has already left.')
          if (!isObject(message) || !HOST_SEND_TYPES.has(message.type)) {
            throw new Error('Hosts may send state messages only.')
          }

          lastSnapshot = { ...message.snapshot }
          delete lastSnapshot.hostTime
          await broadcast(channel, {
            type: 'state',
            snapshot: { ...lastSnapshot, hostTime: Date.now() },
          })
        },
        subscribe: listeners.subscribe,
        getClockOffset: () => 0,
        async leave() {
          if (left) return
          left = true
          claimed = false
          listeners.clear()
          await removeChannel(channel)
        },
      }
    } catch (error) {
      await removeChannel(channel)
      throw error
    }
  }

  throw new Error('Could not claim an unused room code. Try again.')
}

export async function joinPlayerRoom({ roomCode, name, avatar, staleAfterMs = PLAYER_STALE_AFTER_MS }) {
  const normalisedCode = normaliseRoomCode(roomCode)
  const playerId = ownPlayerId()
  const player = {
    playerId,
    name: String(name ?? '').trim(),
    avatar: String(avatar ?? '').trim(),
  }

  if (!player.name || !player.avatar) throw new Error('Player name and avatar are required.')

  const listeners = createListenerSet()
  let clockOffset = 0
  let lastSnapshotAt = Date.now()
  let lastHelloAt = 0
  let left = false
  let channel
  let subscribedOnce = false
  const reactionGate = createReactionGate()

  const announce = async () => {
    if (left || !channel) return
    lastHelloAt = Date.now()
    await broadcast(channel, { type: 'hello', ...player })
  }

  const onMessage = (message) => {
    if (message.type === 'state') {
      lastSnapshotAt = Date.now()
      clockOffset = message.snapshot.hostTime - lastSnapshotAt
    }
    listeners.emit(message, { clockOffset })
  }

  try {
    channel = await waitForSubscription((onStatus) => {
      const candidate = createChannel(normalisedCode, ['state', 'react'], onMessage, (status, error) => {
        onStatus(status, error)
        if (status === 'SUBSCRIBED') {
          if (subscribedOnce && channel) announce().catch(() => {})
          subscribedOnce = true
        }
      })
      channel = candidate
      return candidate
    })
    await announce()
  } catch (error) {
    await removeChannel(channel)
    throw error
  }

  const reannounceIfNeeded = () => {
    const now = Date.now()
    const snapshotIsStale = now - lastSnapshotAt >= staleAfterMs
    const heartbeatDue = now - lastHelloAt >= PLAYER_HEARTBEAT_MS
    if (snapshotIsStale || heartbeatDue) {
      announce().catch(() => {})
    }
  }

  const watchdog = window.setInterval(reannounceIfNeeded, PLAYER_WATCHDOG_INTERVAL_MS)
  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') reannounceIfNeeded()
  }
  document.addEventListener('visibilitychange', onVisibilityChange)

  return {
    role: 'player',
    roomCode: normalisedCode,
    playerId,
    async send(message) {
      if (left) throw new Error('Room connection has already left.')
      if (!isObject(message) || !PLAYER_SEND_TYPES.has(message.type)) {
        throw new Error('Players may send answer or react messages only.')
      }
      if (message.type === 'react' && !reactionGate.allow()) return false
      await broadcast(channel, { ...message, playerId })
      return true
    },
    subscribe: listeners.subscribe,
    getClockOffset: () => clockOffset,
    async leave() {
      if (left) return
      left = true
      window.clearInterval(watchdog)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      listeners.clear()
      await removeChannel(channel)
    },
  }
}
