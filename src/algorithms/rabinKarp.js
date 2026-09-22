/**
 * Rabin–Karp rolling-hash exact matching
 * Average: O(n + m) · Worst (many collisions): O(n·m)
 */

const BASE = 256
const MOD = 1_000_000_007

function mod(n) {
  return ((n % MOD) + MOD) % MOD
}

export function rollingHash(s) {
  let h = 0
  for (let i = 0; i < s.length; i += 1) {
    h = mod(h * BASE + s.charCodeAt(i))
  }
  return h
}

export function rabinKarpSearch(text, pattern) {
  const n = text.length
  const m = pattern.length
  if (!m || m > n) {
    return {
      matches: [],
      comparisons: 0,
      windows: [],
      collisions: 0,
      patternHash: 0,
      n,
      m,
      naive: n * m,
    }
  }

  let high = 1
  for (let i = 0; i < m - 1; i += 1) high = mod(high * BASE)

  const patternHash = rollingHash(pattern)
  let windowHash = rollingHash(text.slice(0, m))

  const matches = []
  const windows = []
  let comparisons = 0
  let collisions = 0

  for (let i = 0; i <= n - m; i += 1) {
    const slice = text.slice(i, i + m)
    const hashMatch = windowHash === patternHash
    let verified = false
    if (hashMatch) {
      comparisons += 1
      verified = slice === pattern
      if (verified) matches.push(i)
      else collisions += 1
    }
    windows.push({
      i,
      slice,
      hash: windowHash,
      hashMatch,
      verified,
    })
    if (i < n - m) {
      windowHash = mod(windowHash - text.charCodeAt(i) * high)
      windowHash = mod(windowHash * BASE + text.charCodeAt(i + m))
    }
  }

  return {
    matches,
    comparisons,
    windows,
    collisions,
    patternHash,
    n,
    m,
    naive: n * m,
    complexity: `O(n+m) avg · ${comparisons} verify(s), ${collisions} collision(s)`,
  }
}

export function rabinKarpCatalog(query, products) {
  const q = query.toLowerCase()
  if (!q) return { results: [], totalComparisons: 0, query: q, patternHash: 0 }
  const patternHash = rollingHash(q)
  const results = []
  let totalComparisons = 0
  let collisions = 0
  let naive = 0

  for (const p of products) {
    const fields = [
      { key: 'sku', value: p.sku },
      { key: 'name', value: p.name },
      { key: 'category', value: p.category },
    ]
    for (const f of fields) {
      const hay = f.value.toLowerCase()
      const r = rabinKarpSearch(hay, q)
      totalComparisons += r.comparisons
      collisions += r.collisions
      naive += hay.length * q.length
      if (r.matches.length) {
        results.push({
          product: p,
          field: f.key,
          haystack: f.value,
          positions: r.matches,
          comparisons: r.comparisons,
        })
        break
      }
    }
  }

  return { results, totalComparisons, collisions, naive, patternHash, query: q }
}
