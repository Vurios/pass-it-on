export const REALTIME_REACTIONS = Object.freeze(['👏', '😮', '😂', '🤔'])
export const REACTION_COOLDOWN_MS = 2_000

export function createReactionGate({ cooldownMs = REACTION_COOLDOWN_MS, now = Date.now } = {}) {
  let lastSentAt = Number.NEGATIVE_INFINITY
  return {
    allow() {
      const current = now()
      if (current - lastSentAt < cooldownMs) return false
      lastSentAt = current
      return true
    },
  }
}
