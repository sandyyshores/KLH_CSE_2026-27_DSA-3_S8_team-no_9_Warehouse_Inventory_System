import { kmpSearchCatalog } from '../algorithms/kmp.js'
import { rabinKarpCatalog } from '../algorithms/rabinKarp.js'
import { fuzzySearchCatalog } from '../algorithms/editDistance.js'

export function shopSearch(query, products) {
  const q = (query || '').trim()
  if (!q) return { results: products, correction: null, mode: 'browse' }

  const exact = kmpSearchCatalog(q, products)
  if (exact.results.length) {
    const seen = new Set()
    const results = []
    for (const r of exact.results) {
      if (seen.has(r.product.id)) continue
      seen.add(r.product.id)
      results.push({ ...r.product, _why: r.field === 'sku' ? 'sku' : 'match' })
    }
    return { results, correction: null, mode: 'exact' }
  }

  const hashed = rabinKarpCatalog(q, products)
  if (hashed.results.length) {
    return {
      results: hashed.results.map((r) => ({ ...r.product, _why: 'match' })),
      correction: null,
      mode: 'exact',
    }
  }

  const fuzzy = fuzzySearchCatalog(q, products, 3)
  if (!fuzzy.results.length) return { results: [], correction: null, mode: 'none' }

  const best = fuzzy.results[0]
  const correction = best.dist > 0 ? guessCorrection(q, best) : null
  const results = []
  const seen = new Set()
  for (const r of fuzzy.results) {
    if (seen.has(r.product.id)) continue
    seen.add(r.product.id)
    results.push({ ...r.product, _why: r.dist === 0 ? 'match' : 'close', _dist: r.dist })
  }
  return { results, correction, mode: 'fuzzy' }
}

function guessCorrection(q, best) {
  if (best.field === 'sku') return best.product.sku
  if (best.field === 'token' && best.haystack) {
    const name = best.product.name
    if (name.toLowerCase().includes(best.haystack.toLowerCase())) return name
    return capitalize(best.haystack)
  }
  return best.product.name
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

/** Typeahead: prefix hits first, then fuzzy if nothing starts with the query. */
export function suggestProducts(query, products, limit = 6) {
  const q = (query || '').trim().toLowerCase()
  if (q.length < 1) return []

  const scored = []
  for (const p of products) {
    const name = p.name.toLowerCase()
    const sku = p.sku.toLowerCase()
    let score = 0
    if (sku.startsWith(q)) score = 120
    else if (sku.includes(q)) score = 70
    if (name.startsWith(q)) score = Math.max(score, 100)
    for (const t of name.split(/[\s,/+×x-]+/)) {
      if (!t) continue
      if (t.startsWith(q)) score = Math.max(score, 90)
      else if (t.includes(q)) score = Math.max(score, 45)
    }
    if (name.includes(q)) score = Math.max(score, 40)
    if (score) scored.push({ product: p, score })
  }

  if (scored.length) {
    scored.sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
    const seen = new Set()
    const out = []
    for (const s of scored) {
      if (seen.has(s.product.id)) continue
      seen.add(s.product.id)
      out.push(s.product)
      if (out.length >= limit) break
    }
    return out
  }

  if (q.length < 3) return []
  return shopSearch(q, products).results.slice(0, limit)
}
