import { useEffect } from 'react'
import { edmondsKarp } from '../algorithms/edmondsKarp.js'
import { kuhnMatching } from '../algorithms/matching.js'
import { flowEdges, matchingEdges, suppliers, warehouses } from '../data/seed.js'
import { useStore } from '../store.jsx'

const nodes = ['SRC', ...suppliers.map((s) => s.id), ...warehouses.map((w) => w.id), 'SNK']

export default function Suppliers() {
  const {
    log, showToast,
    supplierFlow: flow, setSupplierFlow: setFlow,
    supplierMatch: match, setSupplierMatch: setMatch,
  } = useStore()

  function run() {
    const f = edmondsKarp(nodes, flowEdges, 'SRC', 'SNK')
    const m = kuhnMatching(
      suppliers.map((s) => s.id),
      warehouses.map((w) => w.id),
      matchingEdges,
    )
    setFlow(f)
    setMatch(m)
    log('Updated supplier allocations for the week')
    showToast(`This week we can move ${f.maxFlow.toLocaleString('en-IN')} units`)
  }

  useEffect(() => {
    if (!flow) run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pairOf = (sid) => match?.pairs.find((p) => p.left === sid)

  return (
    <>
      <div className="section">
        <button className="btn primary" onClick={run} style={{ marginLeft: 'auto' }}>Recalculate week</button>
      </div>

      {flow && (
        <div className="stats">
          <div className="stat"><div className="k">We can move</div><div className="v">{flow.maxFlow.toLocaleString('en-IN')}</div><div className="s">units this cycle</div></div>
          <div className="stat"><div className="k">Tight links</div><div className="v">{flow.cutEdges.length}</div><div className="s">places the network pinches</div></div>
          <div className="stat"><div className="k">Preferred pairs</div><div className="v">{match.matchingSize}</div><div className="s">supplier → hub</div></div>
          <div className="stat"><div className="k">Unassigned</div><div className="v">{match.unmatchedLeft.length}</div><div className="s">suppliers on standby</div></div>
        </div>
      )}

      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {suppliers.map((s) => {
          const pair = pairOf(s.id)
          const hub = warehouses.find((w) => w.id === pair?.right)
          const tight = flow?.bottleneckNodes.includes(s.id)
          return (
            <div className="card sup-card" key={s.id}>
              <div className="faint" style={{ fontSize: 12 }}>{s.region}</div>
              <h3>{s.name}</h3>
              <div className="muted" style={{ fontSize: 13, marginBottom: 10 }}>{s.categories.join(' · ')}</div>
              <div className="bar"><i style={{ width: `${Math.min(100, s.reliability * 100)}%`, background: 'var(--sage)' }} /></div>
              <div className="faint" style={{ fontSize: 12, marginTop: 6 }}>
                {s.capacity.toLocaleString('en-IN')} cap · {s.leadDays} day lead · {Math.round(s.reliability * 100)}% on time
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {hub && <span className="pill">best fit · {hub.city}</span>}
                {tight && <span className="chip">running tight</span>}
              </div>
            </div>
          )
        })}
      </div>

      <div className="section" style={{ marginTop: 28 }}><h2>Hubs</h2></div>
      <div className="row3">
        {warehouses.map((w) => (
          <div className="card" key={w.id}>
            <h3 style={{ margin: '0 0 4px' }}>{w.name}</h3>
            <div className="muted">{w.city}</div>
            <div style={{ marginTop: 10, fontSize: 22, fontWeight: 700 }}>{w.demand.toLocaleString('en-IN')}</div>
            <div className="faint">units wanted this week</div>
          </div>
        ))}
      </div>
    </>
  )
}
