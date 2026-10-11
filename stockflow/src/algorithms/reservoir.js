/**
 * Reservoir sampling (Algorithm R — Vitter)
 * Draw k SKUs uniformly from n without knowing n in advance.
 * Each item ends with probability k/n of being in the audit sample.
 */

export function reservoirSample(items, k, rng = Math.random) {
  const n = items.length
  const sampleK = Math.max(0, Math.min(k, n))
  const reservoir = items.slice(0, sampleK).map((it, i) => ({ item: it, index: i }))
  const replacements = []

  for (let i = sampleK; i < n; i += 1) {
    const j = Math.floor(rng() * (i + 1))
    if (j < sampleK) {
      const evicted = reservoir[j]
      reservoir[j] = { item: items[i], index: i }
      replacements.push({
        i,
        j,
        incoming: items[i],
        evicted: evicted.item,
        probability: sampleK / (i + 1),
      })
    }
  }

  return {
    sample: reservoir.map((r) => r.item),
    replacements,
    n,
    k: sampleK,
    probability: n === 0 ? 0 : sampleK / n,
    complexity: `O(n) single pass · P(item in sample) = k/n = ${sampleK}/${n}`,
  }
}

/**
 * Simulate a physical count against book quantity.
 * Discrepancies are planted with a small probability so the audit is demoable.
 */
export function runAudit(sample, rng = Math.random) {
  return sample.map((p) => {
    const roll = rng()
    let counted = p.qty
    let note = 'Match'
    if (roll < 0.12) {
      const delta = Math.max(1, Math.round(p.qty * 0.08 * rng()) + 1)
      counted = Math.max(0, p.qty - delta)
      note = 'Shortage'
    } else if (roll < 0.18) {
      const delta = Math.max(1, Math.round(p.qty * 0.05 * rng()) + 1)
      counted = p.qty + delta
      note = 'Overage'
    }
    return {
      product: p,
      book: p.qty,
      counted,
      delta: counted - p.qty,
      note,
    }
  })
}
