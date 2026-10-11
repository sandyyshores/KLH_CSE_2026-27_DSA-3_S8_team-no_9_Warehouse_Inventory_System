import { useStore } from '../../store.jsx'
import { warehouses } from '../../data/seed.js'
import { productImage } from '../../data/images.js'
import { inr } from '../../lib/format.js'

export default function ShopCart({ go }) {
  const { cartLines, setCartQty, placeOrder, deliverHubId, setDeliverHubId, deliverHub } = useStore()

  const total = cartLines.reduce((s, l) => s + l.product.mrp * l.qty, 0)

  function checkout() {
    const ticket = placeOrder(deliverHubId)
    if (ticket) go('orders')
  }

  return (
    <>
      <div className="section">
        <h2>Cart</h2>
      </div>
      {!cartLines.length && (
        <div className="card">
          <p className="help" style={{ margin: 0 }}>Empty. Add something from Shop.</p>
        </div>
      )}
      {cartLines.length > 0 && (
        <div className="workbench">
          <div className="card" style={{ padding: 0 }}>
            {cartLines.map((l) => {
              const max = l.atHub
              const over = l.qty > max
              return (
                <div className="low-row" key={l.id} style={{ padding: '12px 16px' }}>
                  <img className="mini" src={productImage(l.product)} alt="" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 650 }}>{l.product.name}</div>
                    <div className="faint">
                      {inr(l.product.mrp)} each
                      {over ? ` · only ${max} in ${deliverHub.city}` : ` · ${max} in ${deliverHub.city}`}
                    </div>
                  </div>
                  <div className="stepper">
                    <button type="button" onClick={() => setCartQty(l.id, l.qty - 1)}>−</button>
                    <span>{l.qty}</span>
                    <button type="button" onClick={() => setCartQty(l.id, Math.min(l.qty + 1, Math.max(1, max)))}>+</button>
                  </div>
                  <div style={{ minWidth: 80, textAlign: 'right', fontWeight: 700 }}>{inr(l.product.mrp * l.qty)}</div>
                </div>
              )
            })}
          </div>
          <aside className="cart-pane">
            <div className="card">
              <h2 className="cart-title">Checkout</h2>
              <label className="muted" style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
                Deliver to
                <select value={deliverHubId} onChange={(e) => setDeliverHubId(e.target.value)}>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.city} · {w.name}</option>
                  ))}
                </select>
              </label>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontWeight: 700 }}>
                <span>Total</span>
                <span>{inr(total)}</span>
              </div>
              <button className="btn primary" onClick={checkout}>Place order</button>
              <p className="help" style={{ marginTop: 10, marginBottom: 0 }}>
                Cuts {deliverHub.city} stock as soon as you place. Floor sees the pick immediately.
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
