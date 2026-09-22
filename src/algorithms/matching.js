/**
 * Maximum bipartite matching — Kuhn's DFS augmenting-path algorithm
 * Used to assign suppliers to warehouses / open purchase orders.
 * Time: O(V · E)
 */

export function kuhnMatching(leftIds, rightIds, edges) {
  const lIndex = new Map(leftIds.map((id, i) => [id, i]))
  const rIndex = new Map(rightIds.map((id, i) => [id, i]))
  const nL = leftIds.length
  const nR = rightIds.length
  const adj = Array.from({ length: nL }, () => [])

  for (const e of edges) {
    if (!lIndex.has(e.left) || !rIndex.has(e.right)) continue
    adj[lIndex.get(e.left)].push(rIndex.get(e.right))
  }

  const matchR = Array(nR).fill(-1)
  const steps = []

  function dfs(u, seen, path) {
    for (const v of adj[u]) {
      if (seen[v]) continue
      seen[v] = true
      path.push({ left: leftIds[u], right: rightIds[v] })
      if (matchR[v] === -1 || dfs(matchR[v], seen, path)) {
        matchR[v] = u
        return true
      }
      path.pop()
    }
    return false
  }

  let matchingSize = 0
  for (let u = 0; u < nL; u += 1) {
    const seen = Array(nR).fill(false)
    const path = []
    const ok = dfs(u, seen, path)
    if (ok) matchingSize += 1
    steps.push({
      left: leftIds[u],
      success: ok,
      path: path.slice(),
      matchingSize,
    })
  }

  const pairs = []
  for (let v = 0; v < nR; v += 1) {
    if (matchR[v] !== -1) {
      pairs.push({ left: leftIds[matchR[v]], right: rightIds[v] })
    }
  }

  const unmatchedLeft = leftIds.filter((id) => !pairs.some((p) => p.left === id))
  const unmatchedRight = rightIds.filter((id) => !pairs.some((p) => p.right === id))

  return {
    matchingSize,
    pairs,
    unmatchedLeft,
    unmatchedRight,
    steps,
    complexity: `O(V·E) · |L|=${nL}, |R|=${nR}, |E|=${edges.length}`,
  }
}
