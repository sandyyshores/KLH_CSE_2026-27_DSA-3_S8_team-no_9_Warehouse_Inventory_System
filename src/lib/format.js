export function inr(n) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n || 0)
}

export function stockLabel(p) {
  if (p.qty <= 0) return { t: 'Out of stock', k: 'out' }
  if (p.qty < p.minStock) return { t: `Only ${p.qty} left`, k: 'low' }
  return { t: 'In stock', k: 'ok' }
}
