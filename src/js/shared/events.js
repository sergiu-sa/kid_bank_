export function createEmitter() {
  const listeners = new Map()
  return {
    on(event, fn) {
      if (!listeners.has(event)) listeners.set(event, new Set())
      listeners.get(event).add(fn)
    },
    off(event, fn) {
      listeners.get(event)?.delete(fn)
    },
    emit(event, payload) {
      listeners.get(event)?.forEach((fn) => fn(payload))
    }
  }
}
