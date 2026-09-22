import { createContext, useContext, useMemo, useRef, useState } from 'react'
import { products as seedProducts, orders as seedOrders } from './data/seed.js'

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [products, setProducts] = useState(seedProducts)
  const [orders] = useState(seedOrders)
  const [audits, setAudits] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState(['wireless mouse', 'battery', 'nitrile'])
  const [activity, setActivity] = useState([
    { text: 'Hyderabad hub is live', ts: Date.now() - 1000 * 60 * 18 },
    { text: '12 items are running low', ts: Date.now() - 1000 * 60 * 11 },
    { text: 'Afternoon pick wave is waiting', ts: Date.now() - 1000 * 60 * 4 },
  ])

  const [reorderCap, setReorderCap] = useState(25000)
  const [reorderResult, setReorderResult] = useState(null)
  const [pinnedRestockIds, setPinnedRestockIds] = useState([])
  const [highlightSku, setHighlightSku] = useState(null)
  const [supplierFlow, setSupplierFlow] = useState(null)
  const [supplierMatch, setSupplierMatch] = useState(null)
  const [scheduleResult, setScheduleResult] = useState(null)
  const [auditK, setAuditK] = useState(8)
  const [auditDrawn, setAuditDrawn] = useState(null)
  const [auditRows, setAuditRows] = useState(null)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  function showToast(text) {
    setToast({ text, ts: Date.now() })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }

  function log(text) {
    setActivity((a) => [{ text, ts: Date.now() }, ...a].slice(0, 20))
  }

  function rememberSearch(q) {
    const t = (q || '').trim()
    if (!t) return
    setRecentSearches((list) => [t, ...list.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 8))
  }

  function pinRestock(id) {
    setPinnedRestockIds((ids) => (ids.includes(id) ? ids : [...ids, id]))
    setReorderResult(null)
  }

  function bumpQty(id, delta) {
    setProducts((list) => list.map((p) => (
      p.id === id ? { ...p, qty: Math.max(0, p.qty + delta) } : p
    )))
  }

  function upsertProduct(p) {
    setProducts((list) => {
      const i = list.findIndex((x) => x.id === p.id)
      if (i === -1) {
        return [{
          ...p,
          id: `P-${String(list.length + 1).padStart(3, '0')}`,
          rating: 4.5,
          reviews: 0,
          mrp: Math.round((p.unitCost || 0) * 1.18),
        }, ...list]
      }
      const next = list.slice()
      next[i] = { ...next[i], ...p }
      return next
    })
    log(`Updated ${p.sku}`)
    showToast(`Saved ${p.sku}`)
  }

  function deleteProduct(id) {
    setProducts((list) => list.filter((p) => p.id !== id))
    log('Removed a SKU from the catalog')
    showToast('Product removed')
  }

  function applyRestock(selected) {
    const ids = new Set(selected.map((s) => s.id))
    setProducts((list) =>
      list.map((p) => {
        if (!ids.has(p.id)) return p
        const item = selected.find((s) => s.id === p.id)
        return { ...p, qty: p.qty + item.restockQty }
      }),
    )
    setPinnedRestockIds((ids) => ids.filter((id) => !selected.some((s) => s.id === id)))
    setReorderResult(null)
    log(`Placed replenishment for ${selected.length} items`)
    showToast(`Placed ${selected.length} purchase order${selected.length === 1 ? '' : 's'}`)
  }

  function applyAuditCounts(rows) {
    const clean = rows
      .map((r) => {
        const counted = Number(r.counted)
        return { ...r, counted, delta: counted - r.book }
      })
      .filter((r) => Number.isFinite(r.counted))
    const map = new Map(clean.map((r) => [r.product.id, r.counted]))
    setProducts((list) => list.map((p) => (map.has(p.id) ? { ...p, qty: map.get(p.id) } : p)))
    const mismatches = clean.filter((r) => r.delta !== 0).length
    setAudits((a) => [
      { id: `AUD-${Date.now()}`, ts: Date.now(), rows: clean, discrepancies: mismatches },
      ...a,
    ])
    log(`Posted a cycle count · ${clean.length} SKUs`)
    showToast(mismatches ? `Posted count · ${mismatches} mismatch${mismatches === 1 ? '' : 'es'}` : 'Posted count · all matched')
  }

  const stats = useMemo(() => {
    const skus = products.length
    const units = products.reduce((s, p) => s + p.qty, 0)
    const value = products.reduce((s, p) => s + p.qty * p.unitCost, 0)
    const low = products.filter((p) => p.qty < p.minStock)
    const stockout = products.filter((p) => p.qty === 0)
    return { skus, units, value, lowCount: low.length, stockout: stockout.length, low }
  }, [products])

  return (
    <StoreContext.Provider value={{
      products, orders, audits, activity, stats, toast, showToast,
      searchQuery, setSearchQuery, recentSearches, rememberSearch,
      reorderCap, setReorderCap,
      reorderResult, setReorderResult,
      pinnedRestockIds, pinRestock,
      highlightSku, setHighlightSku,
      supplierFlow, setSupplierFlow,
      supplierMatch, setSupplierMatch,
      scheduleResult, setScheduleResult,
      auditK, setAuditK,
      auditDrawn, setAuditDrawn,
      auditRows, setAuditRows,
      bumpQty, upsertProduct, deleteProduct, applyRestock, applyAuditCounts, log,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore outside provider')
  return ctx
}
