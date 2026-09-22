/**
 * Wagner–Fischer edit distance (Levenshtein)
 * DP table: O(n·m) time and space
 * Used for typo-tolerant / fuzzy SKU and name search
 */

export function editDistance(a, b) {
  const n = a.length
  const m = b.length
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))

  for (let i = 0; i <= n; i += 1) dp[i][0] = i
  for (let j = 0; j <= m; j += 1) dp[0][j] = j

  for (let i = 1; i <= n; i += 1) {
    for (let j = 1; j <= m; j += 1) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],
          dp[i][j - 1],
          dp[i - 1][j - 1],
        )
      }
    }
  }

  const ops = backtrack(a, b, dp)
  return {
    distance: dp[n][m],
    dp,
    a,
    b,
    ops,
    complexity: `O(n·m) = O(${n}·${m})`,
  }
}

function backtrack(a, b, dp) {
  const ops = []
  let i = a.length
  let j = b.length
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      ops.push({ type: 'match', a: a[i - 1], b: b[j - 1] })
      i -= 1
      j -= 1
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      ops.push({ type: 'sub', a: a[i - 1], b: b[j - 1] })
      i -= 1
      j -= 1
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      ops.push({ type: 'del', a: a[i - 1] })
      i -= 1
    } else {
      ops.push({ type: 'ins', b: b[j - 1] })
      j -= 1
    }
  }
  return ops.reverse()
}

export function fuzzySearchCatalog(query, products, maxDist = 2) {
  const q = query.toLowerCase()
  if (!q) return { results: [], query: q, maxDist }

  const scored = []
  for (const p of products) {
    const name = p.name.toLowerCase()
    const sku = p.sku.toLowerCase()
    const dName = editDistance(q, name)
    const dSku = editDistance(q, sku)

    // Also consider distance to each token and a sliding window of query length
    let best = dName.distance <= dSku.distance
      ? { dist: dName.distance, field: 'name', haystack: p.name, detail: dName }
      : { dist: dSku.distance, field: 'sku', haystack: p.sku, detail: dSku }

    const tokens = name.split(/[\s,/+-]+/)
    for (const t of tokens) {
      if (!t) continue
      const d = editDistance(q, t)
      if (d.distance < best.dist) {
        best = { dist: d.distance, field: 'token', haystack: t, detail: d }
      }
    }

    // substring-ish: min distance against windows of similar length
    if (name.length > q.length) {
      const w = Math.max(q.length, Math.min(q.length + 2, name.length))
      for (let i = 0; i + q.length <= name.length; i += 1) {
        const slice = name.slice(i, i + w)
        const d = editDistance(q, slice)
        if (d.distance < best.dist) {
          best = { dist: d.distance, field: 'name', haystack: p.name, detail: d }
        }
      }
    }

    if (best.dist <= maxDist) {
      scored.push({ product: p, ...best })
    }
  }

  scored.sort((a, b) => a.dist - b.dist || a.product.name.localeCompare(b.product.name))
  return { results: scored, query: q, maxDist }
}
