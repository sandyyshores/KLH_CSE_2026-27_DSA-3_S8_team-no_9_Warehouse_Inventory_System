import { useMemo, useState } from 'react'
import { useStore } from '../store.jsx'
import { categories } from '../data/seed.js'
import { shopSearch } from '../lib/shopSearch.js'
import { productImage } from '../data/images.js'
import { inr, stockLabel } from '../lib/format.js'
import ProductCard from '../components/ProductCard.jsx'

const ICO = {
  Electronics: '⌁',
  Fasteners: '⬡',
  Packaging: '▣',
  Apparel: '◈',
  Automotive: '⚙',
  Pharma: '+',
  FMCG: '◎',
  Industrial: '▣',
}

export default function Catalog({ go }) {
  const {
    products, searchQuery, setSearchQuery, stats,
    recentSearches, pinRestock, setHighlightSku, showToast,
  } = useStore()
  const [cat, setCat] = useState('All')
  const [stock, setStock] = useState('any')
  const [sort, setSort] = useState('rel')
  const [open, setOpen] = useState(null)

  const browsing = !searchQuery.trim() && cat === 'All' && stock === 'any'
  const found = useMemo(() => shopSearch(searchQuery, products), [searchQuery, products])

  const rows = useMemo(() => {
    let list = found.results
    if (cat !== 'All') list = list.filter((p) => p.category === cat)
    if (stock === 'in') list = list.filter((p) => p.qty > 0)
    if (stock === 'low') list = list.filter((p) => p.qty < p.minStock)
    const next = [...list]
    if (sort === 'price') next.sort((a, b) => a.unitCost - b.unitCost)
    if (sort === 'stock') next.sort((a, b) => b.qty - a.qty)
    if (sort === 'name') next.sort((a, b) => a.name.localeCompare(b.name))
    return next
  }, [found, cat, stock, sort])

  const featured = useMemo(
    () => [...products].sort((a, b) => b.demandScore - a.demandScore).slice(0, 8),
    [products],
  )

  const live = open ? products.find((p) => p.id === open.id) || open : null

  function addToReorder(p) {
    pinRestock(p.id)
    setHighlightSku(p.sku)
    setOpen(null)
    showToast(`Added ${p.name} to reorder`)
    go('reorder')
  }

  return (
    <>
      {browsing ? (
        <>
          <div className="shop-head">
            <h2>What’s in the building</h2>
            <p>Search a name or SKU — misspellings still work.</p>
          </div>
          <div className="cats">
            {categories.map((c) => (
              <button className="cat" key={c} onClick={() => setCat(c)}>
                <div className="ico">{ICO[c] || '·'}</div>
                <span>{c}</span>
              </button>
            ))}
          </div>
          <div className="section">
            <h2>Moving today</h2>
            <button className="link" onClick={() => setCat('Electronics')}>Browse aisle</button>
          </div>
          <div className="grid-cards">
            {featured.map((p) => (
              <ProductCard key={p.id} p={p} onClick={() => setOpen(p)} />
            ))}
          </div>
          {stats.low.length > 0 && (
            <>
              <div className="section" style={{ marginTop: 28 }}>
                <h2>Running low</h2>
                <button className="link" onClick={() => go('reorder')}>Buying</button>
              </div>
              <div className="grid-cards">
                {stats.low.slice(0, 4).map((p) => (
                  <ProductCard key={p.id} p={p} onClick={() => setOpen(p)} />
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div className="section">
            <h2>
              {searchQuery ? `Results for “${searchQuery}”` : cat !== 'All' ? cat : 'Catalog'}
            </h2>
            <span className="muted">{rows.length}</span>
          </div>

          {found.correction && (
            <div className="didyou">
              Showing results for <b>{found.correction}</b>
            </div>
          )}

          <div className="toolbar">
            {recentSearches.slice(0, 5).map((s) => (
              <button key={s} className="chip" onClick={() => setSearchQuery(s)}>{s}</button>
            ))}
          </div>

          <div className="toolbar">
            <button className={`chip ${cat === 'All' ? 'on' : ''}`} onClick={() => setCat('All')}>All</button>
            {categories.map((c) => (
              <button key={c} className={`chip ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>{c}</button>
            ))}
            <div style={{ flex: 1 }} />
            <select value={stock} onChange={(e) => setStock(e.target.value)}>
              <option value="any">Any stock</option>
              <option value="in">In stock</option>
              <option value="low">Low / out</option>
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="rel">Relevance</option>
              <option value="price">Price</option>
              <option value="stock">Stock</option>
              <option value="name">Name</option>
            </select>
          </div>

          {rows.length === 0 && (
            <div className="card">
              <p className="help">Nothing matched. Try a broader word — typos are fine.</p>
            </div>
          )}

          <div className="grid-cards">
            {rows.map((p) => (
              <ProductCard key={p.id} p={p} onClick={() => setOpen(p)} />
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
                <div className="sku">{live.sku} · {live.location}</div>
                <h3 className="product-title">{live.name}</h3>
                <div className="stars">★ {live.rating} · {live.reviews} this month</div>
                <div style={{ margin: '14px 0 10px' }}>
                  <span className="price lg">{inr(live.unitCost)}</span>
                  <span className="mrp">{inr(live.mrp)}</span>
                </div>
                <div className={`st ${stockLabel(live).k}`}>{stockLabel(live).t} · min {live.minStock}</div>
                <p className="help" style={{ marginTop: 12 }}>
                  {live.category} · {live.warehouseId}
                </p>
                <div className="toolbar" style={{ marginBottom: 0 }}>
                  <button className="btn primary" onClick={() => addToReorder(live)}>Add to reorder</button>
                  <button className="btn" onClick={() => { go('stock'); setOpen(null) }}>Open in stock</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
