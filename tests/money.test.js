import { describe, it, expect } from 'vitest'
import { formatCurrency, applyDebit } from '../src/js/shared/money.js'

describe('formatCurrency', () => {
  it('formats a positive amount with two decimals', () => {
    expect(formatCurrency(12.4)).toBe('$12.40')
  })
  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })
  it('honors a custom symbol', () => {
    expect(formatCurrency(1000.5, 'kr')).toBe('kr1000.50')
  })
})

describe('applyDebit', () => {
  it('returns reduced balance when funds are sufficient', () => {
    expect(applyDebit(100, 30)).toEqual({ newBalance: 70, ok: true })
  })
  it('rejects when amount exceeds balance', () => {
    expect(applyDebit(100, 150)).toEqual({
      newBalance: 100,
      ok: false,
      reason: 'insufficient'
    })
  })
})
