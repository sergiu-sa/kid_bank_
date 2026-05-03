export function formatCurrency(amount, symbol = '$') {
  const num = Number(amount)
  const safe = Number.isFinite(num) ? num : 0
  return `${symbol}${safe.toFixed(2)}`
}

export function applyDebit(balance, amount) {
  if (amount > balance) {
    return { newBalance: balance, ok: false, reason: 'insufficient' }
  }
  return { newBalance: balance - amount, ok: true }
}
