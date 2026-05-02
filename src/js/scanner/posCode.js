export const CODE_REGEX = /^KB-[A-HJKM-NP-Z2-9]{4}-[A-HJKM-NP-Z2-9]{4}$/

export function isValidCodeFormat(code) {
  return typeof code === 'string' && CODE_REGEX.test(code)
}

export function isExpired(expiresAt, now = Date.now()) {
  return now >= expiresAt
}

export function formatRemaining(expiresAt, now = Date.now()) {
  const remainingMs = Math.max(0, expiresAt - now)
  const totalSeconds = Math.floor(remainingMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
