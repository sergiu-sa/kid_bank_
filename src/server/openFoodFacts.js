import axios from 'axios'

const cache = new Map()
const CACHE_TTL_MS = 60_000
const CACHE_MAX_ENTRIES = 1000
const REQUEST_TIMEOUT_MS = 5_000
const USER_AGENT = 'KidBank/1.0 (https://k1dbank.netlify.app)'

function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function estimatePrice(barcode) {
  const cents = (hashCode(barcode) % 900) + 99
  return Math.round(cents) / 100
}

function trim(product, code) {
  const fallbackName = [product.brands, product.quantity].filter(Boolean).join(' ').trim()
  const name = (product.product_name?.trim()) || fallbackName || `Product ${code}`
  return {
    code,
    name,
    brand: product.brands?.split(',')[0]?.trim() ?? null,
    imageUrl: product.image_front_small_url ?? product.image_url ?? null,
    categoryTags: Array.isArray(product.categories_tags) ? product.categories_tags : [],
    labelTags: Array.isArray(product.labels_tags) ? product.labels_tags : [],
    estimatedPrice: estimatePrice(code)
  }
}

export async function fetchProduct(code) {
  if (typeof code !== 'string' || !/^\d{6,14}$/.test(code)) {
    return {
      ok: false,
      error: { code: 'invalid_barcode', message: 'Barcode must be 6-14 digits' }
    }
  }

  const cached = cache.get(code)
  if (cached && Date.now() < cached.expiresAt) {
    if (cached.negative) return cached.negative
    return { ok: true, data: cached.dto }
  }

  try {
    const response = await axios.get(
      `https://world.openfoodfacts.org/api/v0/product/${code}.json`,
      {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        timeout: REQUEST_TIMEOUT_MS
      }
    )
    if (response.data?.status !== 1) {
      // Cache negative results too, so repeat scans of an unknown barcode don't keep hammering OFF.
      const negative = { ok: false, error: { code: 'not_found', message: `No product for barcode ${code}` } }
      if (cache.size >= CACHE_MAX_ENTRIES) {
        cache.delete(cache.keys().next().value)
      }
      cache.set(code, { negative, expiresAt: Date.now() + CACHE_TTL_MS })
      return negative
    }
    const dto = trim(response.data.product, code)
    if (cache.size >= CACHE_MAX_ENTRIES) {
      cache.delete(cache.keys().next().value)
    }
    cache.set(code, { dto, expiresAt: Date.now() + CACHE_TTL_MS })
    return { ok: true, data: dto }
  } catch (err) {
    if (err.code === 'ECONNABORTED' || err.code === 'ERR_CANCELED') {
      return {
        ok: false,
        error: { code: 'timeout', message: 'Open Food Facts did not respond in time' }
      }
    }
    return {
      ok: false,
      error: { code: 'upstream_error', message: err.message ?? 'Upstream failure' }
    }
  }
}
