import { useEffect, useMemo, useRef, useState } from 'react'
import logo from '../assets/logo.png'
import { useStore } from '../store.jsx'
import { suggestProducts } from '../lib/shopSearch.js'
import { productImage } from '../data/images.js'
import { inr } from '../lib/format.js'
import Catalog from '../pages/SearchLab.jsx'
import Inventory from '../pages/Inventory.jsx'
import Buying from '../pages/Buying.jsx'
import Floor from '../pages/Floor.jsx'

const NAV = [
  { id: 'search', label: 'Catalog' },
  { id: 'stock', label: 'Stock' },
  { id: 'buying', label: 'Buying' },
  { id: 'floor', label: 'Floor' },
]

export default function Layout() {
  const { searchQuery, setSearchQuery, rememberSearch, toast, stats, orders, products } = useStore()
  const [page, setPage] = useState('search')
  const [buyingTab, setBuyingTab] = useState('buy')
  const [floorTab, setFloorTab] = useState('picks')
  const [draft, setDraft] = useState(searchQuery)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const searchRef = useRef(null)
  const wrapRef = useRef(null)

  const suggestions = useMemo(
    () => (open ? suggestProducts(draft, products, 6) : []),
    [draft, products, open],
  )

  useEffect(() => {
    function onKey(e) {
      if (e.key !== '/') return
      const tag = (e.target.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return
      e.preventDefault()
      searchRef.current?.focus()
      searchRef.current?.select()
    }
    function onClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onClick)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onClick)
    }
  }, [])

  useEffect(() => { setActive(0) }, [draft])

  function runSearch(q) {
    const text = (q ?? draft).trim()
    setDraft(text)
    setSearchQuery(text)
    if (text) rememberSearch(text)
    setPage('search')
    setOpen(false)
  }

  function pick(p) {
    runSearch(p.name)
  }

  function onSearchKey(e) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp') && draft.trim()) {
      setOpen(true)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!suggestions.length) return
      setActive((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!suggestions.length) return
      setActive((i) => (i - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  function go(id, q) {
    if (typeof q === 'string') {
      setDraft(q)
      setSearchQuery(q)
      if (q) rememberSearch(q)
    }
    setOpen(false)
    if (id === 'home' || id === 'search') setPage('search')
    else if (id === 'reorder' || id === 'buying') {
      setBuyingTab('buy')
      setPage('buying')
    } else if (id === 'supply') {
      setBuyingTab('supply')
      setPage('buying')
    } else if (id === 'orders' || id === 'floor') {
      setFloorTab('picks')
      setPage('floor')
    } else if (id === 'counts') {
      setFloorTab('counts')
      setPage('floor')
    } else setPage(id)
  }

  const Page = {
    search: Catalog,
    stock: Inventory,
    buying: Buying,
    floor: Floor,
  }[page]

  const pageProps = page === 'buying'
    ? { go, tab: buyingTab, setTab: setBuyingTab }
    : page === 'floor'
      ? { go, tab: floorTab, setTab: setFloorTab }
      : { go }

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={() => go('search', '')}>
          <img src={logo} alt="" />
          <div>
            <div className="word">Meridian</div>
            <small>Inventory</small>
          </div>
        </button>
        <div className="search-wrap" ref={wrapRef}>
          <form className="searchbar" onSubmit={(e) => { e.preventDefault(); runSearch() }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9a9288" strokeWidth="2"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 5 5" /></svg>
            <input
              ref={searchRef}
              value={draft}
              onChange={(e) => {
                const v = e.target.value
                setDraft(v)
                setSearchQuery(v)
                setPage('search')
                setOpen(true)
              }}
              onFocus={() => { if (draft.trim()) setOpen(true) }}
              onKeyDown={onSearchKey}
              placeholder="Search products, SKUs…"
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
                    onMouseDown={(e) => { e.preventDefault(); pick(p) }}
                  >
                    <img src={productImage(p)} alt="" />
                    <span>
                      <b>{p.name}</b>
                      <em>{p.sku}</em>
                    </span>
                    <strong>{inr(p.unitCost)}</strong>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="header-actions">
          <button className={`status-pill ${stats.lowCount ? 'warn' : ''}`} onClick={() => go('reorder')}>
            {stats.lowCount} low
          </button>
          <button className="status-pill" onClick={() => go('orders')}>
            {orders.length} picks
          </button>
          <button className="status-pill" onClick={() => go('counts')}>count</button>
        </div>
      </header>
      <nav className="subnav">
        {NAV.map((n) => (
          <button key={n.id} className={page === n.id ? 'on' : ''} onClick={() => go(n.id)}>
            {n.label}
          </button>
        ))}
      </nav>
      <main className="content">
        <Page {...pageProps} />
      </main>
      {toast && <div className="toast">{toast.text}</div>}
    </div>
  )
}
