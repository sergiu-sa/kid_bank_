const NATIVE_FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128']

async function loadZXingReader() {
  try {
    const mod = await import('@zxing/browser')
    return new mod.BrowserMultiFormatReader()
  } catch (err) {
    throw Object.assign(new Error('Failed to load ZXing fallback'), { reason: 'zxing-load-failed', cause: err })
  }
}

export function createDetector() {
  let active = false
  let intervalId = null
  let zxingReader = null
  let zxingControls = null
  let mode = 'unknown'

  async function start(videoEl, onDetect) {
    if (active) stop()
    active = true
    if ('BarcodeDetector' in window) {
      mode = 'native'
      const detector = new window.BarcodeDetector({ formats: NATIVE_FORMATS })
      intervalId = setInterval(async () => {
        if (!active) return
        try {
          const codes = await detector.detect(videoEl)
          if (codes[0]?.rawValue) onDetect(codes[0].rawValue)
        } catch { /* per-frame error; ignore */ }
      }, 250)
      return mode
    }
    mode = 'zxing'
    if (!zxingReader) zxingReader = await loadZXingReader()
    zxingControls = await zxingReader.decodeFromVideoElement(videoEl, (result) => {
      if (result && active) onDetect(result.getText())
    })
    return mode
  }

  function stop() {
    active = false
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    if (zxingControls) {
      zxingControls.stop()
      zxingControls = null
    }
  }

  return { start, stop, get mode() { return mode } }
}
