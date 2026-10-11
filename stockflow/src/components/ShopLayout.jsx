import { useEffect, useMemo, useRef, useState } from 'react'
import logo from '../assets/logo.png'
import { useStore } from '../store.jsx'
import { suggestProducts } from '../lib/shopSearch.js'
import { productImage } from '../data/images.js'
import { inr } from '../lib/format.js'
import { navigate } from '../lib/nav.js'
import { buyers, warehouses } from '../data/seed.js'
import ShopCatalog from '../pages/shop/ShopCatalog.jsx'
import ShopCart from '../pages/shop/ShopCart.jsx'
import ShopOrders from '../pages/shop/ShopOrders.jsx'

export default function ShopLayout() {
  const {
    products, shopQuery, setShopQuery, rememberSearch, toast,
    cartCount, buyer, setBuyer, deliverHubId, setDeliverHubId,
  } = useStore()
  const [page, setPage] = useState('shop')
  const [draft, setDraft] = useState(shopQuery)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const searchRef = useRef(null)
  const wrapRef = useRef(null)

  const suggestions = useMemo(
    () => (open ? suggestProducts(draft, products, 6) : []),
    [draft, products, open],
  )

  useEffect(() => {
    function onClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => { setActive(0) }, [draft])

  function goShop() {
    setPage('shop')
    setOpen(false)
  }

  function onSearchKey(e) {
    if (e.key === 'ArrowDown' && suggestions.length) {
      e.preventDefault()
      setActive((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp' && suggestions.length) {
      e.preventDefault()
      setActive((i) => (i - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === 'Escape') setOpen(false)
  }

  const Page = page === 'cart' ? ShopCart : page === 'orders' ? ShopOrders : ShopCatalog

  return (
    <div className="app shop-app">
      <header className="topbar">
        <button className="brand" onClick={() => { setShopQuery(''); setDraft(''); goShop() }}>
          <img src={logo} alt="" />
          <div>
            <div className="word">Meridian</div>
            <small>Wholesale</small>
          </div>
        </button>
        <div className="search-wrap" ref={wrapRef}>
          <form className="searchbar" onSubmit={(e) => { e.preventDefault(); setShopQuery(draft); rememberSearch(draft); goShop(); setOpen(false) }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9a9288" strokeWidth="2"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 5 5" /></svg>
            <input
              ref={searchRef}
              value={draft}
              onChange={(e) => { const v = e.target.value; setDraft(v); setShopQuery(v); goShop(); setOpen(true) }}
              onFocus={() => { if (draft.trim()) setOpen(true) }}
              onKeyDown={onSearchKey}
              placeholder="Search the catalog…"
              autoComplete="off"
            />
            <button className="go" type="submit">Search</button>
          </form>
          {open && suggestions.length > 0 && (
            <ul className="suggest">
              {suggestions.map((p, i) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className={i === active ? 'on' : ''}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      setDraft(p.name)
                      setShopQuery(p.name)
                      rememberSearch(p.name)
                      goShop()
                    }}
                  >
                    <img src={productImage(p)} alt="" />
                    <span>
                      <b>{p.name}</b>
                      <em>{p.category}</em>
                    </span>
                    <strong>{inr(p.mrp)}</strong>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="header-actions">
          <select className="buyer-select" value={deliverHubId} onChange={(e) => setDeliverHubId(e.target.value)} title="Deliver to">
            {warehouses.map((w) => <option key={w.id} value={w.id}>{w.city}</option>)}
          </select>
          <select className="buyer-select" value={buyer} onChange={(e) => setBuyer(e.target.value)}>
            {buyers.map((b) => <option key={b}>{b}</option>)}
          </select>
          <button className="status-pill" onClick={() => setPage('orders')}>Orders</button>
          <button className="status-pill cart-pill" onClick={() => setPage('cart')}>
            Cart {cartCount ? <i>{cartCount}</i> : null}
          </button>
        </div>
      </header>
      <nav className="subnav">
        <button className={page === 'shop' ? 'on' : ''} onClick={goShop}>Shop</button>
        <button className={page === 'cart' ? 'on' : ''} onClick={() => setPage('cart')}>Cart</button>
        <button className={page === 'orders' ? 'on' : ''} onClick={() => setPage('orders')}>My orders</button>
        <span className="subnav-spacer" />
        <button className="ghost-nav" onClick={() => navigate('/admin')}>Warehouse →</button>
      </nav>
      <main className="content">
        <Page go={setPage} />
      </main>
      {toast && <div className="toast">{toast.text}</div>}
    </div>
  )
}
