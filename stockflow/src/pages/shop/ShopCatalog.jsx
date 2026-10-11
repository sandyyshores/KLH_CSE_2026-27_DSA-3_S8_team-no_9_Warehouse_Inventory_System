import { useMemo, useState } from 'react'
import { useStore } from '../../store.jsx'
import { categories } from '../../data/seed.js'
import { shopSearch } from '../../lib/shopSearch.js'
import { atHub, hubQty, hubsWithStock, substitutes } from '../../lib/stock.js'
import { productImage } from '../../data/images.js'
import { inr, stockLabel } from '../../lib/format.js'
import ProductCard from '../../components/ProductCard.jsx'

const ICO = {
  Electronics: '⌁', Fasteners: '⬡', Packaging: '▣', Apparel: '◈',
  Automotive: '⚙', Pharma: '+', FMCG: '◎', Industrial: '▣',
}

export default function ShopCatalog() {
  const { products, shopQuery, setShopQuery, addToCart, deliverHub, deliverHubId, setDeliverHubId } = useStore()
  const [cat, setCat] = useState('All')
  const [open, setOpen] = useState(null)
  const [qty, setQty] = useState(1)
  const city = deliverHub.city

  const browsing = !shopQuery.trim() && cat === 'All'
  const found = useMemo(() => shopSearch(shopQuery, products), [shopQuery, products])
  const rows = useMemo(() => {
    let list = found.results
    if (cat !== 'All') list = list.filter((p) => p.category === cat)
    return list.map((p) => atHub(p, deliverHubId))
  }, [found, cat, deliverHubId])
  const featured = useMemo(
    () => [...products].sort((a, b) => b.demandScore - a.demandScore).slice(0, 8).map((p) => atHub(p, deliverHubId)),
    [products, deliverHubId],
  )
  const source = open ? products.find((p) => p.id === open.id) || open : null
  const live = source ? atHub(source, deliverHubId) : null
  const alts = live && live.qty <= 0 ? substitutes(source, products, deliverHubId, 3) : []
  const elsewhere = live && live.qty <= 0 ? hubsWithStock(source, deliverHubId) : []

  function buy(p, n = 1) {
    const have = hubQty(p, deliverHubId)
    if (have <= 0) return
    addToCart(p, Math.min(n, have))
    setOpen(null)
    setQty(1)
  }

  return (
    <>
      {browsing ? (
        <>
          <div className="shop-head">
            <h2>Wholesale for your company</h2>
            <p>Selling price, live stock at {city}.</p>
          </div>
          <div className="cats">
            {categories.map((c) => (
              <button className="cat" key={c} onClick={() => setCat(c)}>
                <div className="ico">{ICO[c] || '·'}</div>
                <span>{c}</span>
              </button>
            ))}
          </div>
          <div className="section"><h2>Moving today</h2></div>
          <div className="grid-cards">
            {featured.map((p) => (
              <ProductCard key={p.id} p={p} shop place={city} onClick={() => { setOpen(p); setQty(1) }} />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="section">
            <h2>{shopQuery ? `Results for “${shopQuery}”` : cat}</h2>
            <span className="muted">{rows.length} · {city}</span>
          </div>
          {found.correction && (
            <div className="didyou">Showing results for <b>{found.correction}</b></div>
          )}
          <div className="toolbar">
            <button className={`chip ${cat === 'All' ? 'on' : ''}`} onClick={() => { setCat('All'); if (!shopQuery) setShopQuery('') }}>All</button>
            {categories.map((c) => (
              <button key={c} className={`chip ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
          <div className="grid-cards">
            {rows.map((p) => (
              <ProductCard key={p.id} p={p} shop place={city} onClick={() => { setOpen(p); setQty(1) }} />
            ))}
          </div>
        </>
      )}

      {live && (
        <div className="modal-back" onClick={() => setOpen(null)}>
          <div className="modal product-modal" onClick={(e) => e.stopPropagation()}>
            <div className="product-modal-grid">
              <div className="ph well">
                <img src={productImage(live)} alt="" />
              </div>
              <div>
                <div className="sku">{live.category}</div>
                <h3 className="product-title">{live.name}</h3>
                <div className="stars">★ {live.rating}</div>
                <div style={{ margin: '14px 0 10px' }}>
                  <span className="price lg">{inr(live.mrp)}</span>
                </div>
                <div className={`st ${stockLabel(live, { place: city, shop: true }).k}`}>
                  {live.qty} available in {city}
                </div>
                {live.qty > 0 ? (
                  <div className="toolbar" style={{ marginTop: 16 }}>
                    <div className="stepper">
                      <button type="button" onClick={() => setQty((n) => Math.max(1, n - 1))}>−</button>
                      <span>{qty}</span>
                      <button type="button" onClick={() => setQty((n) => Math.min(live.qty || 1, n + 1))}>+</button>
                    </div>
                    <button className="btn primary" onClick={() => buy(source, qty)}>
                      Add to cart
                    </button>
                  </div>
                ) : (
                  <div className="sub-block">
                    <p className="help" style={{ margin: '12px 0 8px' }}>Gone here. Try a close match, or another hub.</p>
                    {elsewhere.length > 0 && (
                      <div className="toolbar" style={{ marginBottom: 10 }}>
                        {elsewhere.map((w) => (
                          <button key={w.id} className="chip" onClick={() => setDeliverHubId(w.id)}>
                            {w.city} · {hubQty(source, w.id)}
                          </button>
                        ))}
                      </div>
                    )}
                    {alts.length > 0 && (
                      <div className="alt-row">
                        {alts.map((p) => (
                          <button
                            key={p.id}
                            className="alt-card"
                            type="button"
                            onClick={() => { setOpen(p); setQty(1) }}
                          >
                            <img src={productImage(p)} alt="" />
                            <span>
                              <b>{p.name}</b>
                              <em>{hubQty(p, deliverHubId)} in {city}</em>
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
