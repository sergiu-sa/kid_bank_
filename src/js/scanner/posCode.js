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

const POS_CODE_URL = '/.netlify/functions/pos-code'

function makeError(message, code, status) {
  return Object.assign(new Error(message), { code, status })
}

export async function create(cart) {
  let response
  try {
    response = await fetch(POS_CODE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart }),
      signal: AbortSignal.timeout(8000)
    })
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw makeError('POS code request timed out', 'timeout', 0)
    }
    throw makeError('Network error creating POS code', 'network', 0)
  }
  if (!response.ok) {
    let errorCode = 'unknown'
    try {
      const body = await response.json()
      errorCode = body?.error?.code ?? errorCode
    } catch { /* ignore */ }
    throw makeError('Failed to create POS code', errorCode, response.status)
  }
  return response.json()
}

export async function lookup(code) {
  let response
  try {
    response = await fetch(`${POS_CODE_URL}/${code}`, {
      signal: AbortSignal.timeout(8000)
    })
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw makeError('POS code lookup timed out', 'timeout', 0)
    }
    throw makeError('Network error looking up POS code', 'network', 0)
  }
  if (response.status === 404) throw makeError('Not found', 'not_found', 404)
  if (response.status === 410) throw makeError('Expired', 'expired', 410)
  if (!response.ok) throw makeError('Lookup failed', 'unknown', response.status)
  return response.json()
}
