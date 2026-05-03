import { isValidCodeFormat, lookup as lookupPosCode } from '../scanner/posCode.js'
import { formatCurrency } from '../shared/money.js'

const els = {
  eyebrow: document.getElementById('receiptEyebrow'),
  date: document.getElementById('dateLine'),
  lines: document.getElementById('lines'),
  totals: document.getElementById('totals'),
  total: document.getElementById('totalAmount')
}

function setDate() {
  const d = new Date()
  els.date.textContent = d.toISOString().slice(0, 10).replace(/-/g, '.')
}

function renderLines(items) {
  els.lines.innerHTML = ''
  if (!items || items.length === 0) {
    const empty = document.createElement('div')
    empty.className = 'empty-state'
    empty.textContent = 'No products in this receipt.'
    els.lines.appendChild(empty)
    return
  }
  for (const item of items) {
    const row = document.createElement('div')
    row.className = 'line'
    const name = document.createElement('span')
    name.className = 'name'
    name.textContent = item.name
    const qty = document.createElement('span')
    qty.className = 'qty'
    qty.textContent = `× ${item.quantity}`
    const price = document.createElement('span')
    price.className = 'price'
    price.textContent = formatCurrency(item.unitPrice)
    const subtotal = document.createElement('span')
    subtotal.className = 'subtotal'
    subtotal.textContent = formatCurrency(item.unitPrice * item.quantity)
    row.append(name, qty, price, subtotal)
    els.lines.appendChild(row)
  }
}

function renderTotal(total) {
  els.total.textContent = formatCurrency(total)
  els.totals.hidden = false
}

function renderError(message) {
  els.lines.innerHTML = ''
  const empty = document.createElement('div')
  empty.className = 'empty-state'
  empty.textContent = message
  els.lines.appendChild(empty)
}

async function bootstrap() {
  setDate()
  const params = new URLSearchParams(window.location.search)
  const ref = params.get('ref')
  if (!ref) {
    renderError('No receipt reference provided.')
    return
  }
  if (ref.startsWith('self-')) {
    els.eyebrow.textContent = 'Paid'
    const raw = sessionStorage.getItem(`kb.receipt.${ref}`)
    if (!raw) {
      renderError('This receipt is no longer available.')
      return
    }
    try {
      const data = JSON.parse(raw)
      renderLines(data.items)
      renderTotal(data.total)
    } catch {
      renderError('Receipt data is corrupted.')
    }
    return
  }
  if (isValidCodeFormat(ref)) {
    els.eyebrow.textContent = 'POS code'
    try {
      const { cart } = await lookupPosCode(ref)
      renderLines(cart.items)
      renderTotal(cart.total)
    } catch (err) {
      if (err.code === 'expired') renderError('This code has expired.')
      else if (err.code === 'not_found') renderError('Code not found.')
      else renderError('Could not load this receipt.')
    }
    return
  }
  renderError('Invalid receipt reference.')
}

bootstrap()
