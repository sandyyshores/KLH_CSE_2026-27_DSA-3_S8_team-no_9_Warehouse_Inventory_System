import { useMemo, useState } from 'react'
import { useStore } from '../store.jsx'
import { categories, suppliers, warehouses } from '../data/seed.js'
import { productImage } from '../data/images.js'
import { inr, stockLabel } from '../lib/format.js'
import { hubQty } from '../lib/stock.js'

const empty = {
  sku: '', name: '', category: 'Electronics', qty: 0, minStock: 10,
  unitCost: 100, unitWeight: 1, demandScore: 5, location: 'A01-R01-B1',
  supplierId: suppliers[0].id, warehouseId: warehouses[0].id,
}

export default function Inventory({ go }) {
  const { products, upsertProduct, deleteProduct, bumpQty, setHighlightSku, transferStock } = useStore()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  const [hubId, setHubId] = useState('ALL')
  const [onlyLow, setOnlyLow] = useState(false)
  const [view, setView] = useState('cards')
  const [modal, setModal] = useState(null)
  const [move, setMove] = useState(null)

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    return products.filter((p) => {
      if (cat !== 'All' && p.category !== cat) return false
      const shown = hubId === 'ALL' ? p.qty : hubQty(p, hubId)
      if (onlyLow) {
        if (hubId === 'ALL' && p.qty >= p.minStock) return false
        if (hubId !== 'ALL' && shown >= 3) return false
      }
      if (!s) return true
      return `${p.sku} ${p.name} ${p.location}`.toLowerCase().includes(s)
    })
  }, [products, q, cat, onlyLow, hubId])

  function shownQty(p) {
    return hubId === 'ALL' ? p.qty : hubQty(p, hubId)
  }
  function bump(p, d) {
    bumpQty(p.id, d, hubId === 'ALL' ? p.warehouseId : hubId)
  }

  return (
    <>
      <div className="section">
        <h2>On the floor</h2>
        <div className="toolbar" style={{ margin: 0 }}>
          <div className="seg" style={{ margin: 0 }}>
            <button className={view === 'cards' ? 'on' : ''} onClick={() => setView('cards')}>Cards</button>
            <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}>List</button>
          </div>
          <button className="btn primary" onClick={() => setModal({ ...empty })}>Add product</button>
        </div>
      </div>

      <div className="toolbar">
        <input type="text" placeholder="Filter SKU, name, bin…" value={q} onChange={(e) => setQ(e.target.value)} style={{ minWidth: 220 }} />
        <button className={`chip ${cat === 'All' ? 'on' : ''}`} onClick={() => setCat('All')}>All</button>
        {categories.map((c) => (
          <button key={c} className={`chip ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>{c}</button>
        ))}
        <button className={`chip ${onlyLow ? 'on' : ''}`} onClick={() => setOnlyLow((v) => !v)}>Needs attention</button>
      </div>
      <div className="toolbar">
        <button className={`chip ${hubId === 'ALL' ? 'on' : ''}`} onClick={() => setHubId('ALL')}>All hubs</button>
        {warehouses.map((w) => (
          <button key={w.id} className={`chip ${hubId === w.id ? 'on' : ''}`} onClick={() => setHubId(w.id)}>{w.city}</button>
        ))}
      </div>

      {view === 'cards' ? (
        <div className="grid-cards">
          {rows.map((p) => {
            const snap = { ...p, qty: shownQty(p) }
            const st = stockLabel(snap)
            return (
              <div className="pcard stock-card" key={p.id}>
                <div className="ph">
                  <img src={productImage(p)} alt="" />
                  <span className={`flag ${st.k}`}>{st.t}</span>
                </div>
                <div className="bd">
                  <div className="nm">{p.name}</div>
                  <div className="sku">{p.sku} · {p.location}</div>
                  <div className="meta">
                    <span className="price">{inr(p.unitCost)}</span>
                  </div>
                  <div className="stock-ops">
                    <div className="stepper">
                      <button type="button" onClick={() => bump(p, -1)}>−</button>
                      <span className={`st ${st.k}`}>{snap.qty}</span>
                      <button type="button" onClick={() => bump(p, 1)}>+</button>
                    </div>
                    <span className="faint">{hubId === 'ALL' ? `min ${p.minStock}` : warehouses.find((w) => w.id === hubId)?.city}</span>
                  </div>
                  <div className="stock-ops">
                    <button className="btn ghost" onClick={() => setModal({ ...p })}>Edit</button>
                    <button className="btn ghost" onClick={() => setMove({
                      id: p.id,
                      name: p.name,
                      from: hubId === 'ALL' ? p.warehouseId : hubId,
                      to: warehouses.find((w) => w.id !== (hubId === 'ALL' ? p.warehouseId : hubId))?.id || warehouses[0].id,
                      qty: 1,
                    })}>Move</button>
                    <button className="btn ghost" onClick={() => { setHighlightSku(p.sku); go('reorder') }}>Reorder</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          <table className="data">
            <thead>
              <tr>
                <th></th>
                <th>Product</th>
                <th>Bin</th>
                <th>On hand</th>
                <th>Cost</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const snap = { ...p, qty: shownQty(p) }
                const st = stockLabel(snap)
                return (
                  <tr key={p.id}>
                    <td><img className="mini" src={productImage(p)} alt="" /></td>
                    <td>
                      <div style={{ fontWeight: 650 }}>{p.name}</div>
                      <div className="faint">{p.sku}</div>
                    </td>
                    <td className="muted">{p.location}</td>
                    <td>
                      <div className="stepper">
                        <button type="button" onClick={() => bump(p, -1)}>−</button>
                        <span className={`st ${st.k}`}>{snap.qty}</span>
                        <button type="button" onClick={() => bump(p, 1)}>+</button>
                      </div>
                    </td>
                    <td>{inr(p.unitCost)}</td>
                    <td>
                      <button className="btn ghost" onClick={() => setModal({ ...p })}>Edit</button>
                      <button className="btn ghost" onClick={() => setMove({
                        id: p.id,
                        name: p.name,
                        from: hubId === 'ALL' ? p.warehouseId : hubId,
                        to: warehouses.find((w) => w.id !== (hubId === 'ALL' ? p.warehouseId : hubId))?.id || warehouses[0].id,
                        qty: 1,
                      })}>Move</button>
                      <button className="btn ghost" onClick={() => { setHighlightSku(p.sku); go('reorder') }}>Reorder</button>
                      <button className="btn danger ghost" onClick={() => deleteProduct(p.id)}>Remove</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-back" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="section" style={{ marginTop: 0 }}>
              <h2>{modal.id ? 'Edit product' : 'New product'}</h2>
              <button className="btn ghost" onClick={() => setModal(null)}>Close</button>
            </div>
            <div className="form">
              <div className="form-row">
                <label>SKU<input value={modal.sku} onChange={(e) => setModal({ ...modal, sku: e.target.value })} /></label>
                <label>Category
                  <select value={modal.category} onChange={(e) => setModal({ ...modal, category: e.target.value })}>
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </label>
              </div>
              <label>Name<input value={modal.name} onChange={(e) => setModal({ ...modal, name: e.target.value })} /></label>
              <div className="form-row">
                <label>On hand<input type="number" value={modal.qty} onChange={(e) => setModal({ ...modal, qty: +e.target.value })} /></label>
                <label>Min stock<input type="number" value={modal.minStock} onChange={(e) => setModal({ ...modal, minStock: +e.target.value })} /></label>
              </div>
              <div className="form-row">
                <label>Unit cost ₹<input type="number" value={modal.unitCost} onChange={(e) => setModal({ ...modal, unitCost: +e.target.value })} /></label>
                <label>Bin<input value={modal.location} onChange={(e) => setModal({ ...modal, location: e.target.value })} /></label>
              </div>
              <div className="form-row">
                <label>Supplier
                  <select value={modal.supplierId} onChange={(e) => setModal({ ...modal, supplierId: e.target.value })}>
                    {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </label>
                <label>Hub
                  <select value={modal.warehouseId} onChange={(e) => setModal({ ...modal, warehouseId: e.target.value })}>
                    {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </label>
              </div>
              <button className="btn primary" onClick={() => { upsertProduct(modal); setModal(null) }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {move && (
        <div className="modal-back" onClick={() => setMove(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="section" style={{ marginTop: 0 }}>
              <h2>Move stock</h2>
              <button className="btn ghost" onClick={() => setMove(null)}>Close</button>
            </div>
            <p className="help">{move.name}</p>
            <div className="form">
              <div className="form-row">
                <label>From
                  <select value={move.from} onChange={(e) => setMove({ ...move, from: e.target.value })}>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.city} · {hubQty(products.find((x) => x.id === move.id) || {}, w.id)}</option>
                    ))}
                  </select>
                </label>
                <label>To
                  <select value={move.to} onChange={(e) => setMove({ ...move, to: e.target.value })}>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.city}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>Qty
                <input type="number" min="1" value={move.qty} onChange={(e) => setMove({ ...move, qty: e.target.value })} />
              </label>
              <button
                className="btn primary"
                onClick={() => {
                  if (transferStock(move.id, move.from, move.to, move.qty)) setMove(null)
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
