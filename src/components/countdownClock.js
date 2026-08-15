export function getCountdownFrame({ endTimestamp, startTimestamp, clockOffset = 0, now = Date.now() }) {
  const remaining = Math.max(0, endTimestamp - (now + clockOffset))
  const totalWindow = Math.max(1, endTimestamp - startTimestamp)
  return {
    remaining,
    seconds: Math.ceil(remaining / 1000),
    progress: Math.min(1, remaining / totalWindow),
  }
}
