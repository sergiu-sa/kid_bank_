import { getStore } from '@netlify/blobs'

const TTL_MS = 60_000
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const CODE_REGEX = /^KB-[A-HJKM-NP-Z2-9]{4}-[A-HJKM-NP-Z2-9]{4}$/
const ipBuckets = new Map()
const RATE_LIMIT_PER_MIN = 10

function generateCode() {
  let code = 'KB-'
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-'
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return code
}

// Best-effort rate limit. Module-level state is per-isolate, not shared across
// concurrent Netlify Function instances — so this is a courtesy throttle, not a
// security boundary. A determined attacker can fan out across cold starts.
function rateLimitOk(ip) {
  const now = Date.now()
  const bucket = ipBuckets.get(ip)
  if (!bucket || now >= bucket.resetAt) {
    ipBuckets.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (bucket.count >= RATE_LIMIT_PER_MIN) return false
  bucket.count += 1
  return true
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }
}

export async function handler(event) {
  const store = getStore('pos-codes')
  const method = event.httpMethod

  if (method === 'POST') {
    const ip = event.headers['x-forwarded-for']?.split(',')[0].trim() || 'unknown'
    if (!rateLimitOk(ip)) {
      return jsonResponse(429, {
        error: { code: 'rate_limited', message: 'Too many codes; try again in a minute' }
      })
    }
    let body
    try {
      body = JSON.parse(event.body || '{}')
    } catch {
      return jsonResponse(400, {
        error: { code: 'bad_request', message: 'Invalid JSON' }
      })
    }
    if (!body.cart || typeof body.cart !== 'object') {
      return jsonResponse(400, {
        error: { code: 'bad_request', message: 'Missing cart' }
      })
    }

    let code
    // NOTE: there's a tiny theoretical race here — two concurrent POSTs could generate
    // the same candidate, both see it as free, and both write. With ~852B codes and a
    // 60s TTL, the probability is negligible at portfolio-demo scale, so we accept it.
    // Production would use a conditional write (`ifNoneMatch`) on Netlify Blobs.
    for (let attempt = 0; attempt < 3; attempt++) {
      const candidate = generateCode()
      const existing = await store.get(candidate)
      if (!existing) {
        code = candidate
        break
      }
    }
    if (!code) {
      return jsonResponse(500, {
        error: { code: 'collision', message: 'Could not generate a unique code' }
      })
    }

    const expiresAt = Date.now() + TTL_MS
    await store.setJSON(code, { cart: body.cart, expiresAt })
    return jsonResponse(201, { code, expiresAt })
  }

  if (method === 'GET') {
    const parts = event.path.split('/')
    const code = parts[parts.length - 1]
    if (!CODE_REGEX.test(code)) {
      return jsonResponse(400, {
        error: { code: 'invalid_format', message: 'Bad code format' }
      })
    }
    const record = await store.get(code, { type: 'json' })
    if (!record) {
      return jsonResponse(404, {
        error: { code: 'not_found', message: 'Code not found' }
      })
    }
    if (Date.now() >= record.expiresAt) {
      return jsonResponse(410, {
        error: { code: 'expired', message: 'Code has expired' }
      })
    }
    return jsonResponse(200, { cart: record.cart, expiresAt: record.expiresAt })
  }

  return jsonResponse(405, {
    error: { code: 'method_not_allowed', message: 'Use POST or GET' }
  })
}
