import { createEmitter } from '../shared/events.js'

export function createCart() {
  const items = new Map()
  const emitter = createEmitter()

  function snapshot() {
    let total = 0
    let restrictedCount = 0
    for (const item of items.values()) {
      total += item.unitPrice * item.quantity
      if (item.restricted) restrictedCount += 1
    }
    return Object.freeze({
      items: new Map(items),
      total: Math.round(total * 100) / 100,
      restrictedCount,
      isCheckoutBlocked: restrictedCount > 0
    })
  }

  function notify() {
    emitter.emit('change', snapshot())
  }

  function remove(code) {
    if (items.delete(code)) notify()
  }

  return {
    add(product) {
      const existing = items.get(product.code)
      if (existing) {
        existing.quantity += 1
      } else {
        items.set(product.code, {
          code: product.code,
          name: product.name,
          imageUrl: product.imageUrl ?? null,
          unitPrice: product.estimatedPrice ?? 0,
          quantity: 1,
          restricted: product.restricted ?? false,
          restrictionReason: product.restrictionReason ?? null
        })
      }
      notify()
    },
    remove,
    setQuantity(code, n) {
      if (n < 1) {
        remove(code)
        return
      }
      const item = items.get(code)
      if (item) {
        item.quantity = n
        notify()
      }
    },
    setUnitPrice(code, price) {
      const item = items.get(code)
      if (item && Number.isFinite(price) && price >= 0) {
        item.unitPrice = price
        notify()
      }
    },
    clear() {
      items.clear()
      notify()
    },
    getState: snapshot,
    subscribe(fn) {
      emitter.on('change', fn)
      return () => emitter.off('change', fn)
    }
  }
}
