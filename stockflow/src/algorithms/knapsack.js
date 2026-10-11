/**
 * 0/1 Knapsack via classic DP (budget-optimal restocking)
 * Time: O(n · W) · Space: O(n · W) so we can reconstruct the set
 */

export function knapsack01(items, capacity) {
  const n = items.length
  const W = Math.max(0, Math.floor(capacity))
  const dp = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0))
  const take = Array.from({ length: n + 1 }, () => Array(W + 1).fill(false))

  for (let i = 1; i <= n; i += 1) {
    const { value, weight } = items[i - 1]
    const w = Math.floor(weight)
    const v = value
    for (let c = 0; c <= W; c += 1) {
      dp[i][c] = dp[i - 1][c]
      if (w <= c) {
        const withItem = dp[i - 1][c - w] + v
        if (withItem > dp[i][c]) {
          dp[i][c] = withItem
          take[i][c] = true
        }
      }
    }
  }

  const selected = []
  let c = W
  for (let i = n; i >= 1; i -= 1) {
    if (take[i][c]) {
      selected.push(items[i - 1])
      c -= Math.floor(items[i - 1].weight)
    }
  }
  selected.reverse()

  const usedWeight = selected.reduce((s, it) => s + Math.floor(it.weight), 0)
  const usedValue = selected.reduce((s, it) => s + it.value, 0)

  return {
    maxValue: dp[n][W],
    selected,
    usedWeight,
    usedValue,
    leftover: W - usedWeight,
    dp,
    n,
    W,
    complexity: `O(n·W) = O(${n}·${W})`,
  }
}

/**
 * Build restock candidates from inventory: each under-min SKU is a 0/1 item.
 * value  = urgency × units-short × demand
 * weight = restock cost (or space, depending on mode)
 */
export function buildRestockItems(products, mode = 'budget', extraIds = []) {
  const extra = new Set(extraIds)
  return products
    .filter((p) => p.qty < p.minStock || extra.has(p.id))
    .map((p) => {
      const short = p.minStock - p.qty
      const restockQty = short > 0
        ? Math.max(short, Math.ceil(p.minStock * 0.5))
        : Math.max(1, Math.ceil((p.minStock || 1) * 0.25))
      const cost = restockQty * p.unitCost
      const space = restockQty * p.unitWeight
      const urgency = p.qty === 0 ? 3 : p.qty < p.minStock * 0.35 ? 2 : 1
      const value = Math.round(urgency * short * (p.demandScore || 1) * 10)
      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        product: p,
        restockQty,
        cost,
        space,
        urgency,
        value,
        weight: mode === 'space' ? Math.max(1, Math.round(space)) : Math.max(1, Math.round(cost)),
      }
    })
}
