function tagError(err) {
  if (err.name === 'NotAllowedError') return Object.assign(err, { reason: 'permission-denied' })
  if (err.name === 'NotFoundError') return Object.assign(err, { reason: 'no-camera' })
  if (err.name === 'NotReadableError') return Object.assign(err, { reason: 'in-use' })
  return Object.assign(err, { reason: 'unknown' })
}

export function createCamera() {
  let stream = null
  let videoEl = null
  let currentFacing = 'environment'

  async function start({ facingMode = 'environment' } = {}) {
    currentFacing = facingMode
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false
      })
    } catch (err) {
      throw tagError(err)
    }
    if (videoEl) videoEl.srcObject = stream
    return stream
  }

  function attach(video) {
    videoEl = video
    if (stream) video.srcObject = stream
  }

  function stop() {
    stream?.getTracks().forEach((t) => t.stop())
    stream = null
    if (videoEl) videoEl.srcObject = null
  }

  async function toggleTorch() {
    const track = stream?.getVideoTracks()[0]
    if (!track) return false
    const caps = track.getCapabilities?.() ?? {}
    if (!caps.torch) return false
    const settings = track.getSettings?.() ?? {}
    const next = !settings.torch
    await track.applyConstraints({ advanced: [{ torch: next }] })
    return next
  }

  async function switchFacing() {
    const previous = currentFacing
    const next = currentFacing === 'environment' ? 'user' : 'environment'
    stop()
    try {
      await start({ facingMode: next })
      return next
    } catch (err) {
      // Roll back to the previous camera so the scanner doesn't end up dead.
      try { await start({ facingMode: previous }) } catch { /* both failed; surface original */ }
      throw err
    }
  }

  function hasTorchSupport() {
    const track = stream?.getVideoTracks()[0]
    return Boolean(track?.getCapabilities?.().torch)
  }

  return { start, stop, attach, toggleTorch, switchFacing, hasTorchSupport }
}
