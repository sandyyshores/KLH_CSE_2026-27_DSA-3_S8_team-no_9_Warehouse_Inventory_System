import { useStore } from '../../store.jsx'
import { inr } from '../../lib/format.js'

export default function ShopOrders() {
  const { buyerOrders, buyer, cancelOrder } = useStore()
  const mine = buyerOrders.filter((o) => o.customer === buyer)

  return (
    <>
      <div className="section">
        <h2>My orders</h2>
        <span className="muted">{buyer}</span>
      </div>
      {!mine.length && (
        <div className="card">
          <p className="help" style={{ margin: 0 }}>No orders yet for this company.</p>
        </div>
      )}
      {mine.map((o) => (
        <div className="card" key={o.id} style={{ marginBottom: 12 }}>
          <div className="section" style={{ marginTop: 0 }}>
            <h2 style={{ fontSize: 22 }}>{o.id}</h2>
            <span className={`pill ${o.status === 'cancelled' ? 'warn-pill' : ''}`}>{o.status}</span>
          </div>
          <div className="muted" style={{ marginBottom: 10 }}>
            {new Date(o.ts).toLocaleString('en-IN')} · {o.city}
          </div>
          {o.lines.map((l) => (
            <div className="low-row" key={l.sku}>
              <div style={{ flex: 1 }}>{l.name} × {l.qty}</div>
              <div>{inr(l.price * l.qty)}</div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <div style={{ fontWeight: 700 }}>{inr(o.total)}</div>
            {o.status === 'placed' && (
              <button className="btn ghost" onClick={() => cancelOrder(o.id)}>Cancel · restore stock</button>
            )}
          </div>
        </div>
      ))}
    </>
  )
}
