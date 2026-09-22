import { useEffect } from 'react'
import { matchingBasedSchedule } from '../algorithms/scheduler.js'
import { orders, pickers } from '../data/seed.js'
import { useStore } from '../store.jsx'

export default function Orders() {
  const { log, showToast, scheduleResult: result, setScheduleResult: setResult } = useStore()

  function run() {
    const r = matchingBasedSchedule(orders, pickers)
    setResult(r)
    log('Built today’s pick plan')
    showToast(`Last dock finishes in ${r.makespan} min`)
  }

  useEffect(() => {
    if (!result) run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const maxT = result ? Math.max(result.makespan, 1) : 1

  return (
    <>
      <div className="section">
        <button className="btn primary" onClick={run} style={{ marginLeft: 'auto' }}>Rebuild pick plan</button>
      </div>

      {result && (
        <div className="stats">
          <div className="stat"><div className="k">Last dock finishes</div><div className="v">{result.makespan}<span style={{ fontSize: 14 }}> min</span></div></div>
          <div className="stat"><div className="k">Fair share</div><div className="v">{result.lb} min</div><div className="s">if work split evenly</div></div>
          <div className="stat"><div className="k">Orders</div><div className="v">{orders.length}</div></div>
          <div className="stat"><div className="k">Docks</div><div className="v">{pickers.length}</div></div>
        </div>
      )}

      {result && (
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="section" style={{ marginTop: 0 }}><h2>Dock board</h2></div>
          <div className="gantt">
            {pickers.map((pk, i) => (
              <div className="gantt-row" key={pk.id}>
                <div>
                  <div style={{ fontWeight: 650 }}>{pk.name}</div>
                  <div className="faint">{result.load[i]} min</div>
                </div>
                <div className="gantt-track">
                  {(() => {
                    let t = 0
                    return result.assign[i].map((job) => {
                      const left = (t / maxT) * 100
                      const w = (job.duration / maxT) * 100
                      t += job.duration
                      return (
                        <div
                          key={job.id}
                          className="gantt-block"
                          style={{ left: `${left}%`, width: `${w}%`, opacity: job.phase === 'match' ? 1 : 0.75 }}
                          title={job.productName}
                        >
                          {job.id.replace('ORD-', '')}
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <table className="data">
          <thead>
            <tr><th>Order</th><th>Customer</th><th>Item</th><th>Qty</th><th>Pick time</th><th>Priority</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td style={{ fontWeight: 650 }}>{o.id}</td>
                <td>{o.customer}</td>
                <td>{o.productName}</td>
                <td>{o.qty}</td>
                <td className="muted">{o.processingMin} min</td>
                <td><span className="pill">{o.priority}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
