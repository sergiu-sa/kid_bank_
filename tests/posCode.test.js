import { describe, it, expect } from 'vitest'
import {
  isValidCodeFormat,
  isExpired,
  formatRemaining
} from '../src/js/scanner/posCode.js'

describe('isValidCodeFormat', () => {
  it('accepts a well-formed code', () => {
    expect(isValidCodeFormat('KB-7F2A-9CXY')).toBe(true)
  })
  it('rejects codes containing ambiguous chars (0, 1, I, L, O)', () => {
    expect(isValidCodeFormat('KB-0OOO-XXXX')).toBe(false)
    expect(isValidCodeFormat('KB-1IIL-XXXX')).toBe(false)
  })
  it('rejects wrong-length codes', () => {
    expect(isValidCodeFormat('KB-XXX-XXXX')).toBe(false)
    expect(isValidCodeFormat('KB-XXXX-XXX')).toBe(false)
  })
})

describe('isExpired', () => {
  it('returns false before expiry', () => {
    expect(isExpired(2000, 1000)).toBe(false)
  })
  it('returns true after expiry', () => {
    expect(isExpired(1000, 2000)).toBe(true)
  })
  it('returns true at the boundary (now equals expiresAt)', () => {
    expect(isExpired(1000, 1000)).toBe(true)
  })
})

describe('formatRemaining', () => {
  it('formats 42 seconds as 0:42', () => {
    expect(formatRemaining(42_000, 0)).toBe('0:42')
  })
  it('clamps to 0:00 when expired', () => {
    expect(formatRemaining(0, 5_000)).toBe('0:00')
  })
})
