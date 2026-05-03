const STORAGE_KEY = 'scannerMuted'
let audioContext = null

function ensureAudioContext() {
  if (!audioContext && typeof window !== 'undefined') {
    const Ctor = window.AudioContext || window.webkitAudioContext
    if (Ctor) audioContext = new Ctor()
  }
  return audioContext
}

function playTone(frequency, duration) {
  const ctx = ensureAudioContext()
  if (!ctx) return
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.connect(gain).connect(ctx.destination)
  oscillator.frequency.value = frequency
  oscillator.type = 'sine'
  gain.gain.setValueAtTime(0.0001, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
  oscillator.start()
  oscillator.stop(ctx.currentTime + duration)
}

function vibrate(ms) {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(ms)
  }
}

export function createFeedback({ viewfinderEl }) {
  let muted = localStorage.getItem(STORAGE_KEY) === 'true'

  function flash(className) {
    if (!viewfinderEl) return
    viewfinderEl.classList.add(className)
    setTimeout(() => viewfinderEl.classList.remove(className), 220)
  }

  return {
    onSuccess() {
      flash('flash-success')
      if (!muted) playTone(880, 0.08)
      vibrate(50)
    },
    onDuplicate() {
      flash('flash-duplicate')
      if (!muted) playTone(440, 0.08)
      vibrate(30)
    },
    onError() {
      // Reuses the duplicate-flash class on purpose: both are non-success amber feedback.
      // The audible cue (a lower 220Hz tone vs duplicate's 440Hz) is what differentiates them.
      flash('flash-duplicate')
      if (!muted) playTone(220, 0.12)
    },
    setMuted(next) {
      muted = !!next
      localStorage.setItem(STORAGE_KEY, String(muted))
    },
    isMuted() { return muted }
  }
}
