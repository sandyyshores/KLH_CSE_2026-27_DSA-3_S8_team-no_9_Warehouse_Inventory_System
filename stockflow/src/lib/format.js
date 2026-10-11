export function inr(n) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n || 0)
}

export function stockLabel(p, { place, shop } = {}) {
  if (p.qty <= 0) return { t: place ? `Out in ${place}` : 'Out of stock', k: 'out' }
  const lowCut = shop ? Math.max(3, Math.round((p.minStock || 10) * 0.15)) : p.minStock
  if (p.qty < lowCut) {
    return { t: place ? `${p.qty} in ${place}` : `${p.qty} left`, k: 'low' }
  }
  return { t: place ? `${p.qty} in ${place}` : `${p.qty} in stock`, k: 'ok' }
}
