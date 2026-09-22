import { useEffect } from 'react'
import { reservoirSample } from '../algorithms/reservoir.js'
import { useStore } from '../store.jsx'
import { productImage } from '../data/images.js'

export default function Counts() {
  const {
    products, applyAuditCounts, audits, log,
    auditK: k, setAuditK: setK,
    auditDrawn: drawn, setAuditDrawn: setDrawn,
    auditRows: rows, setAuditRows: setRows,
  } = useStore()

  function sample() {
    const r = reservoirSample(products, k)
    setDrawn(r)
    setRows(r.sample.map((p) => ({
      product: p,
      book: p.qty,
      counted: String(p.qty),
      delta: 0,
      note: 'to count',
    })))
    log(`Picked ${k} SKUs for today’s count`)
  }

  useEffect(() => {
    if (!drawn) sample()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function setCounted(id, raw) {
    const digits = raw.replace(/[^\d]/g, '')
    setRows((list) => list.map((r) => {
      if (r.product.id !== id) return r
      if (digits === '') return { ...r, counted: '', delta: 0, note: 'to count' }
      const counted = Number(digits)
      const delta = counted - r.book
      const note = delta === 0 ? 'Match' : delta < 0 ? 'Shortage' : 'Overage'
      return { ...r, counted: digits, delta, note }
    }))
  }

  const list = rows || []
  const ready = list.length > 0 && list.every((r) => r.counted !== '')

  return (
    <>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="toolbar" style={{ marginBottom: 0 }}>
          <label className="muted" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            How many today
            <input type="number" min={1} max={products.length} value={k} onChange={(e) => setK(+e.target.value)} style={{ width: 80 }} />
          </label>
          <button className="btn primary" onClick={sample}>New list</button>
          <button className="btn" disabled={!ready} onClick={() => applyAuditCounts(list)}>Post to stock</button>
        </div>
      </div>

      <div className="card">
        {!list.length && <p className="help" style={{ margin: 0 }}>Make a list to start walking bins.</p>}
        {list.map((r) => {
          const p = r.product
          return (
            <div className="check" key={p.id}>
              <img className="mini" src={productImage(p)} alt="" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 650 }}>{p.name}</div>
                <div className="faint">{p.sku} · {p.location}</div>
              </div>
              <div className="muted">book {r.book}</div>
              <label className="muted" style={{ display: 'grid', gap: 4, fontSize: 11 }}>
                counted
                <input
                  type="text"
                  inputMode="numeric"
                  value={r.counted}
                  onChange={(e) => setCounted(p.id, e.target.value)}
                  onFocus={(e) => e.target.select()}
                  style={{ width: 88, fontWeight: 700, fontSize: 14 }}
                />
              </label>
              <div style={{ minWidth: 52, textAlign: 'right' }}>
                {r.delta ? <div className={`st ${r.delta < 0 ? 'low' : 'ok'}`}>{r.delta > 0 ? '+' : ''}{r.delta}</div> : null}
              </div>
              <span className="chip">{r.note}</span>
            </div>
          )
        })}
      </div>

      {audits[0] && (
        <p className="help" style={{ marginTop: 14 }}>Last posted count had {audits[0].discrepancies} mismatches.</p>
      )}
    </>
  )
}
