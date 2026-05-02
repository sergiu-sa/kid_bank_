import { describe, it, expect } from 'vitest'
import { createCart } from '../src/js/scanner/cart.js'

const allowed = {
  code: '111',
  name: 'Apple',
  imageUrl: null,
  estimatedPrice: 2.5,
  restricted: false,
  restrictionReason: null
}

const restricted = {
  code: '222',
  name: 'Vodka',
  imageUrl: null,
  estimatedPrice: 9.99,
  restricted: true,
  restrictionReason: 'Alcoholic beverage'
}

describe('cart', () => {
  it('starts empty with totals zero and not blocked', () => {
    const cart = createCart()
    const state = cart.getState()
    expect(state.items.size).toBe(0)
    expect(state.total).toBe(0)
    expect(state.restrictedCount).toBe(0)
    expect(state.isCheckoutBlocked).toBe(false)
  })

  it('adds an item at qty 1; second add of same code increments to qty 2', () => {
    const cart = createCart()
    cart.add(allowed)
    cart.add(allowed)
    const state = cart.getState()
    expect(state.items.get('111').quantity).toBe(2)
    expect(state.total).toBe(5)
  })

  it('setUnitPrice recalculates total', () => {
    const cart = createCart()
    cart.add(allowed)
    cart.setUnitPrice('111', 4)
    expect(cart.getState().total).toBe(4)
  })

  it('remove deletes the item and notifies subscribers', () => {
    const cart = createCart()
    const seen = []
    cart.subscribe((state) => seen.push(state.items.size))
    cart.add(allowed)
    cart.remove('111')
    expect(cart.getState().items.size).toBe(0)
    expect(seen).toEqual([1, 0])
  })

  it('flips isCheckoutBlocked when a restricted item is added then removed', () => {
    const cart = createCart()
    cart.add(restricted)
    expect(cart.getState().isCheckoutBlocked).toBe(true)
    cart.remove('222')
    expect(cart.getState().isCheckoutBlocked).toBe(false)
  })
})
