import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../store.jsx'
import { buildRestockItems, knapsack01 } from '../algorithms/knapsack.js'
import { productImage } from '../data/images.js'
import { inr } from '../lib/format.js'

export default function Reorder() {
  const {
    products, applyRestock, log,
    reorderCap: cap, setReorderCap: setCap,
    reorderResult: result, setReorderResult: setResult,
    pinnedRestockIds, highlightSku, setHighlightSku,
  } = useStore()
  const [capText, setCapText] = useState(cap ? String(cap) : '')
  const items = useMemo(
    () => buildRestockItems(products, 'budget', pinnedRestockIds),
    [products, pinnedRestockIds],
  )

  function onCapChange(e) {
    const raw = e.target.value.replace(/[^\d]/g, '')
    setCapText(raw)
    setCap(raw === '' ? 0 : Number(raw))
  }

  function run() {
    const r = knapsack01(items, cap)
    setResult(r)
    log(`Suggested a buy list under ${inr(cap)}`)
  }

  useEffect(() => {
    if (result) return
    if (!items.length) return
    setResult(knapsack01(items, cap || 0))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, items])

  const picked = new Set((result?.selected || []).map((s) => s.id))

  return (
    <div className="workbench">
      <div className="card" style={{ padding: 0 }}>
        <table className="data">
          <thead>
            <tr>
              <th></th>
              <th>Item</th>
              <th>Gap</th>
              <th>Lot</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr
                key={it.id}
                className={highlightSku === it.sku ? 'hl' : ''}
                style={{ background: picked.has(it.id) ? 'var(--sage-s)' : undefined }}
                onClick={() => setHighlightSku(it.sku)}
              >
                <td><img className="mini" src={productImage(it.product)} alt="" /></td>
                <td>
                  <div style={{ fontWeight: 650 }}>{it.name}</div>
                  <div className="faint">{it.sku}</div>
                </td>
                <td className="st low">{it.product.qty}/{it.product.minStock}</td>
                <td>{inr(it.cost)}</td>
                <td>{picked.has(it.id) ? <span className="pill">in cart</span> : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <aside className="cart-pane">
        <div className="card">
          <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>Spend up to</div>
          <label className="money">
            <span>₹</span>
            <input
              type="text"
              inputMode="numeric"
              value={capText}
              onChange={onCapChange}
              onFocus={(e) => e.target.select()}
              placeholder="0"
            />
          </label>
          <div className="toolbar" style={{ margin: '12px 0 0' }}>
            <button className="btn primary" onClick={run}>Recalculate</button>
            {result && (
              <button className="btn" onClick={() => applyRestock(result.selected)} disabled={!result.selected.length}>
                Place POs
              </button>
            )}
          </div>
          {result && (
            <div className="pill" style={{ marginTop: 10 }}>
              {inr(result.usedWeight)} used · {inr(result.leftover)} left
            </div>
          )}
        </div>
        <div className="card">
          <h2 className="cart-title">Cart</h2>
          {!result?.selected?.length && <p className="help">Nothing in this budget yet.</p>}
          {result?.selected.map((s) => (
            <div className={`low-row ${highlightSku === s.sku ? 'hl' : ''}`} key={s.id}>
              <img className="mini" src={productImage(s.product)} alt="" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 650 }}>{s.name}</div>
                <div className="faint">+{s.restockQty}</div>
              </div>
              <div>{inr(s.cost)}</div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
