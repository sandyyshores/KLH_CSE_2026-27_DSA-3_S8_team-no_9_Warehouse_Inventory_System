import { useMemo, useState } from 'react'
import { kuhnMatching } from '../algorithms/matching.js'
import { matchingEdges, suppliers, warehouses } from '../data/seed.js'
import { useStore } from '../store.jsx'

export default function MatchingPage() {
  const { recordRun, log } = useStore()
  const [result, setResult] = useState(null)
  const [step, setStep] = useState(0)

  const left = suppliers.map((s) => s.id)
  const right = warehouses.map((w) => w.id)

  function run() {
    const r = kuhnMatching(left, right, matchingEdges)
    setResult(r)
    setStep(r.steps.length - 1)
    recordRun('matching', { size: r.matchingSize })
    log('match', `Kuhn matching size ${r.matchingSize}`)
  }

  const pairsNow = useMemo(() => {
    if (!result) return []
    // Reconstruct matching after `step` successful assignments by replaying
    const seen = new Set()
    const pairs = []
    for (let i = 0; i <= step; i += 1) {
      const st = result.steps[i]
      if (!st?.success) continue
      // remove previous pair of this left
      const filtered = pairs.filter((p) => p.left !== st.left && !st.path.some((x) => x.right === p.right && x.left !== p.left))
      pairs.length = 0
      pairs.push(...filtered)
      // apply augmenting path: last edge plus rematches already encoded in path
      st.path.forEach((e) => {
        const idx = pairs.findIndex((p) => p.right === e.right || p.left === e.left)
        if (idx >= 0) pairs.splice(idx, 1)
        pairs.push(e)
      })
      seen.add(st.left)
    }
    return pairs
  }, [result, step])

  const pairSet = new Set(pairsNow.map((p) => `${p.left}|${p.right}`))

  return (
    <>
      <div className="hud">
        <p className="help" style={{ marginTop: 0 }}>
          Suppliers on the left, DCs on the right. An edge means the supplier is allowed to serve that DC.
          <span className="k"> Kuhn’s algorithm</span> finds a maximum cardinality matching via DFS augmenting paths — O(V·E).
        </p>
        <div className="toolbar">
          <button className="btn primary" onClick={run}>Run bipartite matching</button>
          {result && (
            <>
              <button className="btn" onClick={() => setStep((s) => Math.max(0, s - 1))}>◀</button>
              <span className="pill">left vertex {step + 1} / {result.steps.length}</span>
              <button className="btn" onClick={() => setStep((s) => Math.min(result.steps.length - 1, s + 1))}>▶</button>
            </>
          )}
        </div>
      </div>

      <div className="grid g-4">
        <div className="card stat cyan"><div className="label">Matching size</div><div className="value">{result ? result.matchingSize : '—'}</div></div>
        <div className="card stat"><div className="label">|L| suppliers</div><div className="value">{left.length}</div></div>
        <div className="card stat"><div className="label">|R| warehouses</div><div className="value">{right.length}</div></div>
        <div className="card stat copper"><div className="label">Unmatched L</div><div className="value">{result ? result.unmatchedLeft.length : '—'}</div></div>
      </div>

      <div className="hud" style={{ padding: 8 }}>
        <svg viewBox="0 0 900 520" width="100%" height="520">
          {matchingEdges.map((e) => {
            const li = left.indexOf(e.left)
            const ri = right.indexOf(e.right)
            const x1 = 200
            const y1 = 40 + li * 80
            const x2 = 700
            const y2 = 50 + ri * 92
            const on = pairSet.has(`${e.left}|${e.right}`)
            return (
              <line
                key={`${e.left}-${e.right}`}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={on ? '#e09a42' : '#243140'}
                strokeWidth={on ? 2.6 : 1}
              />
            )
          })}
          {suppliers.map((s, i) => {
            const matched = pairsNow.some((p) => p.left === s.id)
            return (
              <g key={s.id}>
                <rect x="80" y={22 + i * 80} width="160" height="36" rx="8" fill="#121b24" stroke={matched ? '#e09a42' : '#314257'} />
                <text x="160" y={44 + i * 80} textAnchor="middle" fill="#e7eef5" fontSize="11">{s.name}</text>
              </g>
            )
          })}
          {warehouses.map((w, i) => {
            const matched = pairsNow.some((p) => p.right === w.id)
            return (
              <g key={w.id}>
                <rect x="660" y={32 + i * 92} width="160" height="36" rx="8" fill="#121b24" stroke={matched ? '#2ec4d6' : '#314257'} />
                <text x="740" y={54 + i * 92} textAnchor="middle" fill="#e7eef5" fontSize="11">{w.name}</text>
              </g>
            )
          })}
        </svg>
        {result && <p className="help">{result.complexity} · current pairs: {pairsNow.map((p) => `${p.left}→${p.right}`).join('  ')}</p>}
      </div>
    </>
  )
}
