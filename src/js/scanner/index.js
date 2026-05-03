import { createCart } from './cart.js'
import { createCamera } from './camera.js'
import { createDetector } from './detector.js'
import { createFeedback } from './feedback.js'
import { detect as detectRestricted } from './restrictedDetector.js'
import {
  isExpired,
  formatRemaining,
  create as createPosCode
} from './posCode.js'
import { formatCurrency } from '../shared/money.js'
import categoriesJson from '../../data/restricted-categories.json'
import keywordsJson from '../../data/restricted-keywords.json'

const POS_CODE_DURATION_MS = 60_000
const COUNTDOWN_TICK_MS = 250

const restrictedConfig = {
  categories: categoriesJson,
  keywords: keywordsJson.keywords
}

const els = {
  viewfinder: document.getElementById('viewfinder'),
  video: document.getElementById('camera'),
  emptyCamera: document.getElementById('emptyCamera'),
  torchBtn: document.getElementById('torchBtn'),
  flipBtn: document.getElementById('flipBtn'),
  muteBtn: document.getElementById('muteBtn'),
  manualInput: document.getElementById('manualInput'),
  manualSubmit: document.getElementById('manualSubmit'),
  cartList: document.getElementById('cartList'),
  totalBar: document.getElementById('totalBar'),
  totalAmount: document.getElementById('totalAmount'),
  balanceAfter: document.getElementById('balanceAfter'),
  payNowBtn: document.getElementById('payNowBtn'),
  posCodeBtn: document.getElementById('posCodeBtn'),
  posOverlay: document.getElementById('posOverlay'),
  posCancel: document.getElementById('posCancel'),
  posCodeText: document.getElementById('posCodeText'),
  countdownCircle: document.getElementById('countdownCircle'),
  qrTarget: document.getElementById('qrTarget'),
  posSummary: document.getElementById('posSummary'),
  regenerateBtn: document.getElementById('regenerateBtn'),
  toast: document.getElementById('toast')
}

const cart = createCart()
const camera = createCamera()
const detector = createDetector()
const feedback = createFeedback({ viewfinderEl: els.viewfinder })

const seenCodes = new Set()        // codes successfully added to the cart
const inflightCodes = new Set()    // codes currently being fetched
let balance = readBalance()

function readBalance() {
  // The dashboard stores balance in the DOM; on the scanner page we have no DOM hook.
  // Use sessionStorage as the bridge: dashboard writes 'kb.balance' before linking out.
  const stored = sessionStorage.getItem('kb.balance')
  const parsed = parseFloat(stored ?? '')
  return Number.isFinite(parsed) ? parsed : 100
}

function commitFocusedPrice() {
  const active = document.activeElement
  if (active?.classList?.contains('price-input')) {
    const code = active.closest('.cart-item')?.dataset.code
    const next = parseFloat(active.value)
    if (code && Number.isFinite(next)) {
      cart.setUnitPrice(code, next)
    }
  }
}

function showToast(text, ms = 1800) {
  els.toast.textContent = text
  els.toast.classList.add('is-visible')
  setTimeout(() => els.toast.classList.remove('is-visible'), ms)
}

async function fetchProductDTO(code) {
  const response = await fetch(`/.netlify/functions/barcode/${code}`)
  if (!response.ok) {
    if (response.status === 404) return { ok: false, reason: 'not_found' }
    return { ok: false, reason: 'upstream' }
  }
  const data = await response.json()
  return { ok: true, data }
}

function decorateWithRestriction(dto) {
  const { restricted, reason } = detectRestricted(dto, restrictedConfig)
  return { ...dto, restricted, restrictionReason: reason }
}

async function handleDetection(rawCode) {
  if (seenCodes.has(rawCode)) {
    feedback.onDuplicate()
    showToast('Already in cart — tap item to add another.')
    return
  }
  if (inflightCodes.has(rawCode)) {
    // Same code seen again while the first lookup is still pending — dedupe silently.
    return
  }
  inflightCodes.add(rawCode)
  try {
    const result = await fetchProductDTO(rawCode)
    if (!result.ok) {
      feedback.onError()
      if (result.reason === 'not_found') {
        const add = window.confirm(`Unknown barcode ${rawCode} — add anyway?`)
        if (add) {
          cart.add({
            code: rawCode,
            name: `Unknown (${rawCode})`,
            imageUrl: null,
            estimatedPrice: 1.99,
            restricted: false,
            restrictionReason: null
          })
          seenCodes.add(rawCode)
        }
        return
      }
      showToast('Couldn't reach product database.')
      return
    }
    const enriched = decorateWithRestriction(result.data)
    cart.add(enriched)
    seenCodes.add(rawCode)
    feedback.onSuccess()
  } finally {
    inflightCodes.delete(rawCode)
  }
}

function renderCartItem(item) {
  const li = document.createElement('div')
  li.className = `cart-item${item.restricted ? ' restricted' : ''}`
  li.dataset.code = item.code

  if (item.imageUrl) {
    const tag = document.createElement('img')
    tag.src = item.imageUrl
    tag.alt = ''
    li.appendChild(tag)
  } else {
    const placeholder = document.createElement('div')
    placeholder.className = 'placeholder'
    placeholder.innerHTML = '<i class="fa-solid fa-box"></i>'
    li.appendChild(placeholder)
  }

  const meta = document.createElement('div')
  const name = document.createElement('div')
  name.className = 'name'
  name.textContent = item.name
  meta.appendChild(name)
  if (item.restrictionReason) {
    const chip = document.createElement('span')
    chip.className = 'reason-chip'
    chip.textContent = item.restrictionReason
    meta.appendChild(chip)
  }
  const subtotal = document.createElement('div')
  subtotal.className = 'meta'
  subtotal.textContent = `${formatCurrency(item.unitPrice)} × ${item.quantity}`
  meta.appendChild(subtotal)
  li.appendChild(meta)

  const qty = document.createElement('div')
  qty.className = 'qty'
  const minus = document.createElement('button')
  minus.setAttribute('aria-label', 'Decrease quantity')
  minus.textContent = '−'
  minus.addEventListener('click', () => {
    commitFocusedPrice()
    cart.setQuantity(item.code, item.quantity - 1)
  })
  const span = document.createElement('span')
  span.textContent = String(item.quantity)
  const plus = document.createElement('button')
  plus.setAttribute('aria-label', 'Increase quantity')
  plus.textContent = '+'
  plus.addEventListener('click', () => {
    commitFocusedPrice()
    cart.setQuantity(item.code, item.quantity + 1)
  })
  qty.append(minus, span, plus)
  li.appendChild(qty)

  const priceInput = document.createElement('input')
  priceInput.className = 'price-input'
  priceInput.type = 'number'
  priceInput.step = '0.01'
  priceInput.min = '0'
  priceInput.value = item.unitPrice.toFixed(2)
  priceInput.setAttribute('aria-label', 'Edit price')
  priceInput.addEventListener('change', () => {
    const next = parseFloat(priceInput.value)
    if (Number.isFinite(next)) cart.setUnitPrice(item.code, next)
  })
  li.appendChild(priceInput)

  const remove = document.createElement('button')
  remove.className = 'remove'
  remove.setAttribute('aria-label', 'Remove item')
  remove.innerHTML = '<i class="fa-solid fa-xmark"></i>'
  remove.addEventListener('click', () => {
    commitFocusedPrice()
    seenCodes.delete(item.code)
    cart.remove(item.code)
  })
  li.appendChild(remove)

  return li
}

function renderCart(state) {
  els.cartList.innerHTML = ''
  for (const item of state.items.values()) {
    els.cartList.appendChild(renderCartItem(item))
  }
  els.totalAmount.textContent = formatCurrency(state.total)
  els.balanceAfter.textContent = `Balance after ${formatCurrency(Math.max(0, balance - state.total))}`
  els.totalBar.classList.toggle('is-blocked', state.isCheckoutBlocked)
}

cart.subscribe(renderCart)

els.manualSubmit.addEventListener('click', () => {
  const value = els.manualInput.value.trim()
  if (/^\d{6,14}$/.test(value)) {
    handleDetection(value)
    els.manualInput.value = ''
  } else {
    showToast('Enter 6–14 digits.')
  }
})
els.manualInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') els.manualSubmit.click()
})

els.muteBtn.addEventListener('click', () => {
  feedback.setMuted(!feedback.isMuted())
  els.muteBtn.querySelector('i').className = feedback.isMuted()
    ? 'fa-solid fa-volume-xmark'
    : 'fa-solid fa-volume-high'
})

els.payNowBtn.addEventListener('click', () => {
  const state = cart.getState()
  if (state.isCheckoutBlocked || state.items.size === 0) return
  const confirmed = window.confirm(
    `Pay ${formatCurrency(state.total)} from your KidBank balance? Balance after: ${formatCurrency(balance - state.total)}.`
  )
  if (!confirmed) return
  balance -= state.total
  sessionStorage.setItem('kb.balance', String(balance))
  const token = `self-${Date.now()}`
  sessionStorage.setItem(
    `kb.receipt.${token}`,
    JSON.stringify({ items: Array.from(state.items.values()), total: state.total, paid: true })
  )
  window.location.href = `/checkout.html?ref=${token}`
})

els.posCodeBtn.addEventListener('click', () => openPosOverlay())
els.posCancel.addEventListener('click', () => closePosOverlay())
els.regenerateBtn.addEventListener('click', () => openPosOverlay())

let countdownTimer = null
function startCountdown(expiresAt) {
  clearInterval(countdownTimer)
  function tick() {
    const now = Date.now()
    if (isExpired(expiresAt, now)) {
      els.posOverlay.classList.add('is-expired')
      els.countdownCircle.style.strokeDashoffset = '100'
      els.countdownCircle.setAttribute('stroke', 'var(--danger)')
      clearInterval(countdownTimer)
      return
    }
    const remainingMs = expiresAt - now
    const fraction = Math.max(0, remainingMs / POS_CODE_DURATION_MS)
    els.countdownCircle.style.strokeDasharray = '100'
    els.countdownCircle.style.strokeDashoffset = String(100 - fraction * 100)
    if (remainingMs <= 5_000) {
      els.countdownCircle.setAttribute('stroke', 'var(--danger)')
    } else if (remainingMs <= 15_000) {
      els.countdownCircle.setAttribute('stroke', 'var(--warning)')
    } else {
      els.countdownCircle.setAttribute('stroke', 'var(--accent)')
    }
    els.posSummary.textContent = `${cartSummaryText()} · ${formatRemaining(expiresAt, now)}`
  }
  tick()
  countdownTimer = setInterval(tick, COUNTDOWN_TICK_MS)
}

function cartSummaryText() {
  const state = cart.getState()
  return `${[...state.items.values()].reduce((acc, i) => acc + i.quantity, 0)} items · ${formatCurrency(state.total)}`
}

async function openPosOverlay() {
  const state = cart.getState()
  if (state.isCheckoutBlocked || state.items.size === 0) return
  els.posOverlay.classList.add('is-open')
  els.posOverlay.classList.remove('is-expired')
  els.posCodeText.textContent = 'Generating…'
  els.qrTarget.innerHTML = ''
  els.posCodeBtn.disabled = true
  els.regenerateBtn.disabled = true
  try {
    const cartPayload = {
      items: Array.from(state.items.values()),
      total: state.total
    }
    const { code, expiresAt } = await createPosCode(cartPayload)
    els.posCodeText.textContent = code
    const url = `${location.origin}/checkout.html?ref=${code}`
    new window.QRCode(els.qrTarget, { text: url, width: 200, height: 200 })
    startCountdown(expiresAt)
  } catch (err) {
    feedback.onError()
    els.posCodeText.textContent = 'Error'
    showToast(err.code === 'rate_limited' ? 'Too many codes — wait a minute.' : 'Could not generate code.')
  } finally {
    els.posCodeBtn.disabled = false
    els.regenerateBtn.disabled = false
  }
}

function closePosOverlay() {
  els.posOverlay.classList.remove('is-open')
  clearInterval(countdownTimer)
}

async function startCamera() {
  try {
    await camera.start({ facingMode: 'environment' })
    camera.attach(els.video)
    els.viewfinder.classList.add('is-active')
    if (camera.hasTorchSupport()) els.torchBtn.hidden = false
    if (navigator.mediaDevices?.enumerateDevices) {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const cameras = devices.filter((d) => d.kind === 'videoinput')
      if (cameras.length > 1) els.flipBtn.hidden = false
    }
    els.torchBtn.addEventListener('click', async () => {
      const enabled = await camera.toggleTorch()
      els.torchBtn.setAttribute('aria-pressed', String(enabled))
    })
    els.flipBtn.addEventListener('click', async () => {
      await camera.switchFacing()
      camera.attach(els.video)
    })
    await detector.start(els.video, handleDetection)
  } catch (err) {
    els.viewfinder.classList.remove('is-active')
    els.emptyCamera.hidden = false
    if (err.reason === 'permission-denied') {
      showToast('Camera permission denied — type the barcode below.')
    } else {
      showToast('Camera unavailable — type the barcode below.')
    }
  }
}

window.addEventListener('pagehide', () => {
  detector.stop()
  camera.stop()
  clearInterval(countdownTimer)
})

startCamera()
