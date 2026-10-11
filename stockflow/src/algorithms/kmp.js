/**
 * Knuth–Morris–Pratt exact string matching
 * LPS preprocess: O(m) · Search: O(n) · Total: O(n + m)
 */

export function computeLPS(pattern) {
  const m = pattern.length
  const lps = Array(m).fill(0)
  const steps = []
  let len = 0
  let i = 1
  while (i < m) {
    if (pattern[i] === pattern[len]) {
      len += 1
      lps[i] = len
      steps.push({ i, len, action: 'match', lps: lps.slice() })
      i += 1
    } else if (len !== 0) {
      len = lps[len - 1]
      steps.push({ i, len, action: 'fallback', lps: lps.slice() })
    } else {
      lps[i] = 0
      steps.push({ i, len, action: 'zero', lps: lps.slice() })
      i += 1
    }
  }
  return { lps, steps }
}

export function kmpSearch(text, pattern) {
  if (!pattern) {
    return { matches: [], comparisons: 0, lps: [], trace: [], naive: 0 }
  }
  const { lps } = computeLPS(pattern)
  const n = text.length
  const m = pattern.length
  const matches = []
  const trace = []
  let i = 0
  let j = 0
  let comparisons = 0

  while (i < n) {
    comparisons += 1
    const equal = text[i] === pattern[j]
    trace.push({ i, j, equal, kind: 'compare' })
    if (equal) {
      i += 1
      j += 1
      if (j === m) {
        matches.push(i - j)
        trace.push({ i, j, equal: true, kind: 'hit', index: i - j })
        j = lps[j - 1]
      }
    } else if (j !== 0) {
      j = lps[j - 1]
    } else {
      i += 1
    }
  }

  return {
    matches,
    comparisons,
    lps,
    trace,
    n,
    m,
    naive: n * m,
    complexity: `O(n+m) = O(${n}+${m})`,
  }
}

export function kmpSearchCatalog(query, products) {
  const q = query.toLowerCase()
  if (!q) return { results: [], totalComparisons: 0, lps: [], query: q }
  const { lps } = computeLPS(q)
  const results = []
  let totalComparisons = 0
  let naive = 0

  for (const p of products) {
    const fields = [
      { key: 'sku', value: p.sku },
      { key: 'name', value: p.name },
      { key: 'category', value: p.category },
    ]
    for (const f of fields) {
      const hay = f.value.toLowerCase()
      const r = kmpSearch(hay, q)
      totalComparisons += r.comparisons
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

  return { results, totalComparisons, naive, lps, query: q, pattern: q }
}
