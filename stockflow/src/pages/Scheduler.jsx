import { useEffect, useMemo, useState } from 'react'
import { matchingBasedSchedule } from '../algorithms/scheduler.js'
import { pickers, warehouses } from '../data/seed.js'
import { useStore } from '../store.jsx'

function hubCity(id) {
  return warehouses.find((w) => w.id === id)?.city || '—'
}

export default function Orders() {
  const {
    orders, inbound, dismissInbound, packOrder,
    log, showToast, scheduleResult: result, setScheduleResult: setResult,
  } = useStore()
  const [hubId, setHubId] = useState('ALL')

  const open = useMemo(
    () => orders.filter((o) => o.status !== 'packed' && o.status !== 'cancelled'),
    [orders],
  )
  const visible = useMemo(
    () => (hubId === 'ALL' ? open : open.filter((o) => (o.hubId || '') === hubId)),
    [open, hubId],
  )
  const packed = useMemo(
    () => orders.filter((o) => o.status === 'packed' && (hubId === 'ALL' || o.hubId === hubId)),
    [orders, hubId],
  )

  function run() {
    const r = matchingBasedSchedule(visible, pickers)
    setResult(r)
    log('Built today’s pick plan')
    showToast(`Last dock finishes in ${r.makespan} min`)
  }

  useEffect(() => {
    setResult(matchingBasedSchedule(visible, pickers))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hubId, open])

  const maxT = result ? Math.max(result.makespan, 1) : 1

  function printList() {
    window.print()
  }

  return (
    <>
      {inbound.length > 0 && (
        <div className="inbound-stack no-print">
          {inbound.map((n) => (
            <div className="inbound" key={n.id}>
              <div>
                <b>{n.customer}</b>
                <span> · {n.city}</span>
                <div className="faint">{n.summary}</div>
              </div>
              <button className="btn ghost" type="button" onClick={() => dismissInbound(n.id)}>Got it</button>
            </div>
          ))}
        </div>
      )}

      <div className="print-only pick-sheet-head">
        <h2>Pick list{hubId !== 'ALL' ? ` · ${hubCity(hubId)}` : ''}</h2>
        <p>{new Date().toLocaleString('en-IN')} · {visible.length} open</p>
      </div>

      <div className="toolbar no-print">
        <button className={`chip ${hubId === 'ALL' ? 'on' : ''}`} onClick={() => setHubId('ALL')}>All hubs</button>
        {warehouses.map((w) => (
          <button key={w.id} className={`chip ${hubId === w.id ? 'on' : ''}`} onClick={() => setHubId(w.id)}>{w.city}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="btn" onClick={printList}>Print pick list</button>
        <button className="btn primary" onClick={run}>Rebuild pick plan</button>
      </div>

      {result && (
        <div className="stats no-print">
          <div className="stat"><div className="k">Last dock finishes</div><div className="v">{result.makespan}<span style={{ fontSize: 14 }}> min</span></div></div>
          <div className="stat"><div className="k">Fair share</div><div className="v">{result.lb} min</div><div className="s">if work split evenly</div></div>
          <div className="stat"><div className="k">Open</div><div className="v">{visible.length}</div></div>
          <div className="stat"><div className="k">Docks</div><div className="v">{pickers.length}</div></div>
        </div>
      )}

      {result && (
        <div className="card no-print" style={{ marginBottom: 18 }}>
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
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Item</th>
              <th>Hub</th>
              <th>Qty</th>
              <th>Pick time</th>
              <th className="no-print"></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((o) => (
              <tr key={o.id}>
                <td style={{ fontWeight: 650 }}>{o.id}</td>
                <td>{o.customer}</td>
                <td>{o.productName}</td>
                <td className="muted">{hubCity(o.hubId)}</td>
                <td>{o.qty}</td>
                <td className="muted">{o.processingMin} min</td>
                <td className="no-print">
                  <button className="btn primary" onClick={() => packOrder(o.id)}>Packed</button>
                </td>
              </tr>
            ))}
            {packed.map((o) => (
              <tr key={o.id} className="packed-row">
                <td style={{ fontWeight: 650 }}>{o.id}</td>
                <td>{o.customer}</td>
                <td>{o.productName}</td>
                <td className="muted">{hubCity(o.hubId)}</td>
                <td>{o.qty}</td>
                <td className="muted">{o.processingMin} min</td>
                <td className="no-print"><span className="pill">packed</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
