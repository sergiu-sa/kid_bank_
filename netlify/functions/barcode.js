import { fetchProduct } from '../../src/server/openFoodFacts.js'

const STATUS_BY_CODE = {
  invalid_barcode: 400,
  not_found: 404,
  timeout: 504,
  upstream_error: 502
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }
}

export async function handler(event) {
  const parts = event.path.split('/')
  const code = parts[parts.length - 1]

  if (!code || code === 'barcode') {
    return jsonResponse(400, {
      error: { code: 'invalid_barcode', message: 'Missing barcode' }
    })
  }

  const result = await fetchProduct(code)
  if (result.ok) return jsonResponse(200, result.data)

  return jsonResponse(STATUS_BY_CODE[result.error.code] ?? 500, {
    error: result.error
  })
}
