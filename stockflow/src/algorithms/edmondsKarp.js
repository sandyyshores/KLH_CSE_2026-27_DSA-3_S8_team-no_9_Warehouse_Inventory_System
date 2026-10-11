/**
 * Edmonds–Karp max-flow (Ford–Fulkerson + BFS augmenting paths)
 * Time: O(V · E²)
 * Also returns min-cut, which flags bottleneck suppliers / edges.
 */

function key(u, v) {
  return `${u}->${v}`
}

export function edmondsKarp(nodeIds, rawEdges, source, sink) {
  const nodes = [...nodeIds]
  const cap = new Map()
  const adj = new Map()
  nodes.forEach((id) => adj.set(id, new Set()))

  const original = []
  for (const e of rawEdges) {
    if (!adj.has(e.from) || !adj.has(e.to)) continue
    const k = key(e.from, e.to)
    cap.set(k, (cap.get(k) || 0) + e.cap)
    adj.get(e.from).add(e.to)
    adj.get(e.to).add(e.from)
    if (!cap.has(key(e.to, e.from))) cap.set(key(e.to, e.from), 0)
    original.push({ from: e.from, to: e.to, cap: e.cap })
  }

  const flow = new Map()
  for (const k of cap.keys()) flow.set(k, 0)

  function residual(u, v) {
    return (cap.get(key(u, v)) || 0) - (flow.get(key(u, v)) || 0)
  }

  function bfs() {
    const parent = new Map()
    const q = [source]
    parent.set(source, null)
    while (q.length) {
      const u = q.shift()
      for (const v of adj.get(u) || []) {
        if (parent.has(v)) continue
        if (residual(u, v) <= 0) continue
        parent.set(v, u)
        if (v === sink) return parent
        q.push(v)
      }
    }
    return null
  }

  const paths = []
  let maxFlow = 0
  let guard = 0
  while (guard < 10_000) {
    guard += 1
    const parent = bfs()
    if (!parent) break
    const path = []
    let v = sink
    let bottleneck = Infinity
    while (v !== source) {
      const u = parent.get(v)
      path.push([u, v])
      bottleneck = Math.min(bottleneck, residual(u, v))
      v = u
    }
    path.reverse()
    for (const [u, w] of path) {
      flow.set(key(u, w), (flow.get(key(u, w)) || 0) + bottleneck)
      flow.set(key(w, u), (flow.get(key(w, u)) || 0) - bottleneck)
    }
    maxFlow += bottleneck
    paths.push({
      nodes: [source, ...path.map((p) => p[1])],
      edges: path.map(([u, w]) => ({ from: u, to: w })),
      add: bottleneck,
      flowAfter: maxFlow,
    })
  }

  // Min-cut: nodes reachable from source in residual graph
  const reachable = new Set()
  const q = [source]
  reachable.add(source)
  while (q.length) {
    const u = q.shift()
    for (const v of adj.get(u) || []) {
      if (reachable.has(v)) continue
      if (residual(u, v) <= 0) continue
      reachable.add(v)
      q.push(v)
    }
  }

  const cutEdges = original.filter(
    (e) => reachable.has(e.from) && !reachable.has(e.to),
  )

  const edgeFlows = original.map((e) => {
    const f = Math.max(0, flow.get(key(e.from, e.to)) || 0)
    return {
      ...e,
      flow: f,
      residual: e.cap - f,
      saturated: f >= e.cap - 1e-9,
      inCut: cutEdges.some((c) => c.from === e.from && c.to === e.to),
    }
  })

  const bottleneckNodes = [...new Set(cutEdges.map((e) => e.from).filter((id) => id !== source))]

  return {
    maxFlow,
    paths,
    edgeFlows,
    reachable: [...reachable],
    cutEdges,
    bottleneckNodes,
    iterations: paths.length,
    complexity: `O(V·E²) · V=${nodes.length}, E=${original.length}, augmentations=${paths.length}`,
  }
}
