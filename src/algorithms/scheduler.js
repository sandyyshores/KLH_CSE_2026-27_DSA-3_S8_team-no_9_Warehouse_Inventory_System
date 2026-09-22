/**
 * Matching-based 2-approximation for NP-hard order scheduling (P||Cmax)
 *
 * Makespan on m identical (or speed-scaled) pickers is NP-hard for m ≥ 2.
 * Lower bound  LB = max( max_j p_j ,  ceil(Σ p_j / m)  )
 * Any list schedule satisfies Cmax ≤ 2 · OPT.
 *
 * Matching phase: the m longest orders are assigned 1-to-1 onto pickers
 * via Kuhn bipartite matching (jobs × pickers), preferring faster docks.
 * Remaining orders: LPT list-scheduling onto the current least-loaded picker.
 */

import { kuhnMatching } from './matching.js'

export function matchingBasedSchedule(orders, pickers) {
  const m = pickers.length
  const jobs = orders.map((o) => ({
    ...o,
    p: o.processingMin,
  })).sort((a, b) => b.p - a.p)

  const sum = jobs.reduce((s, j) => s + j.p, 0)
  const maxP = jobs.reduce((s, j) => Math.max(s, j.p), 0)
  const lb = Math.max(maxP, Math.ceil(sum / m))

  const longest = jobs.slice(0, m)
  const rest = jobs.slice(m)

  // Bipartite graph: longest jobs (left) × pickers (right).
  // Edge exists if p / speed ≤ 2·LB (always true for identical machines;
  // still encodes the 2-approx feasibility window for speed-scaled docks).
  const leftIds = longest.map((j) => j.id)
  const rightIds = pickers.map((p) => p.id)
  const edges = []
  for (const job of longest) {
    for (const pk of pickers) {
      const speed = pk.speed || 1
      const effective = job.p / speed
      if (effective <= 2 * lb + 1e-9) {
        edges.push({ left: job.id, right: pk.id, weight: speed })
      }
    }
  }

  // Prefer faster pickers: sort each job's edges by speed desc before Kuhn
  // by emitting high-speed edges first (Kuhn takes first feasible augment).
  const bySpeed = [...pickers].sort((a, b) => (b.speed || 1) - (a.speed || 1))
  const orderedEdges = []
  for (const job of longest) {
    for (const pk of bySpeed) {
      if (edges.some((e) => e.left === job.id && e.right === pk.id)) {
        orderedEdges.push({ left: job.id, right: pk.id })
      }
    }
  }

  const matching = kuhnMatching(leftIds, rightIds, orderedEdges)

  const load = Array(m).fill(0)
  const assign = Array.from({ length: m }, () => [])
  const pickerIndex = new Map(pickers.map((p, i) => [p.id, i]))

  for (const pair of matching.pairs) {
    const job = longest.find((j) => j.id === pair.left)
    const idx = pickerIndex.get(pair.right)
    const speed = pickers[idx].speed || 1
    const dur = Math.round(job.p / speed)
    assign[idx].push({ ...job, duration: dur, phase: 'match' })
    load[idx] += dur
  }

  // Any unmatched long job (shouldn't happen on a complete graph) — greedy
  for (const job of longest) {
    if (matching.pairs.some((p) => p.left === job.id)) continue
    let best = 0
    for (let i = 1; i < m; i += 1) if (load[i] < load[best]) best = i
    const dur = Math.round(job.p / (pickers[best].speed || 1))
    assign[best].push({ ...job, duration: dur, phase: 'match' })
    load[best] += dur
  }

  const restSteps = []
  for (const job of rest) {
    let best = 0
    for (let i = 1; i < m; i += 1) if (load[i] < load[best]) best = i
    const dur = Math.round(job.p / (pickers[best].speed || 1))
    assign[best].push({ ...job, duration: dur, phase: 'lpt' })
    load[best] += dur
    restSteps.push({ jobId: job.id, picker: pickers[best].id, load: load.slice() })
  }

  const makespan = load.reduce((s, x) => Math.max(s, x), 0)
  const ratio = lb === 0 ? 1 : makespan / lb

  return {
    assign,
    load,
    makespan,
    lb,
    ratio,
    bound: 2,
    feasible: ratio <= 2 + 1e-9,
    matching,
    restSteps,
    jobs,
    pickers,
    sum,
    complexity: '2-approx · matching + LPT list schedule',
  }
}
