import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { products as seedProducts, orders as seedOrders, warehouses, buyers } from './data/seed.js'
import { addHubQty, emptyHubs, hubQty, sumHubs } from './lib/stock.js'

const StoreContext = createContext(null)
const STORAGE_KEY = 'meridian-ledger-v2'

function cloneList(list) {
  return (list || []).map((x) => (x && typeof x === 'object' ? { ...x } : x))
}

function maxOrderSeq(orders) {
  let max = 2416
  for (const o of orders || []) {
    const n = Number(String(o.id || '').replace(/\D/g, ''))
    if (Number.isFinite(n) && n > max) max = n
  }
  return max
}

function withHubs(p, seed) {
  const base = seed ? { ...seed, ...p, id: seed.id, sku: seed.sku } : { ...p }
  if (p?.byHub && typeof p.byHub === 'object') {
    const byHub = { ...emptyHubs(), ...p.byHub }
    return { ...base, byHub, qty: sumHubs(byHub) }
  }
  if (seed?.byHub && (p?.qty == null || p.qty === seed.qty)) {
    return { ...base, byHub: { ...seed.byHub }, qty: seed.qty }
  }
  const byHub = emptyHubs()
  const home = base.warehouseId || warehouses[0].id
  byHub[home] = base.qty || 0
  return { ...base, byHub, qty: base.qty || 0 }
}

function hydrateProducts(saved) {
  const seedById = new Map(seedProducts.map((p) => [p.id, p]))
  if (!saved?.length) return seedProducts.map((p) => withHubs(p, p))
  const seen = new Set()
  const out = seedProducts.map((seed) => {
    seen.add(seed.id)
    const s = saved.find((x) => x.id === seed.id)
    return withHubs(s || seed, seed)
  })
  for (const s of saved) {
    if (s?.id && !seen.has(s.id)) out.unshift(withHubs(s, seedById.get(s.id)))
  }
  return out
}

function readSnap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data || data.v !== 2) return null
    return data
  } catch {
    return null
  }
}

function writeSnap(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 2, ...data }))
  } catch { /* quota */ }
}

function qtyStamp(products) {
  return (products || []).map((p) => {
    const hubs = p.byHub ? Object.values(p.byHub).join('.') : ''
    return `${p.id}:${p.qty}:${hubs}`
  }).join('|')
}

export function StoreProvider({ children }) {
  const [products, setProducts] = useState(() => hydrateProducts(readSnap()?.products))
  const [orders, setOrders] = useState(() => {
    const snap = readSnap()
    const raw = snap?.orders?.length ? snap.orders : seedOrders
    return raw.map((o, i) => ({
      ...o,
      hubId: o.hubId || warehouses[i % warehouses.length].id,
      status: o.status || 'open',
    }))
  })
  const [buyerOrders, setBuyerOrders] = useState(() => cloneList(readSnap()?.buyerOrders))
  const [inbound, setInbound] = useState(() => cloneList(readSnap()?.inbound))
  const [cart, setCart] = useState(() => cloneList(readSnap()?.cart))
  const [buyer, setBuyerState] = useState(() => {
    const b = readSnap()?.buyer
    return buyers.includes(b) ? b : buyers[0]
  })
  const [deliverHubId, setDeliverHubState] = useState(() => {
    const id = readSnap()?.deliverHubId
    return warehouses.some((w) => w.id === id) ? id : warehouses[0].id
  })
  const [audits, setAudits] = useState(() => cloneList(readSnap()?.audits))
  const [searchQuery, setSearchQuery] = useState('')
  const [shopQuery, setShopQuery] = useState('')
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
  const orderSeq = useRef((() => {
    const snap = readSnap()
    return snap?.orderSeq || maxOrderSeq(snap?.orders || seedOrders)
  })())
  const tabId = useRef(`t-${Math.random().toString(36).slice(2)}`)
  const channelRef = useRef(null)
  const latest = useRef({})
  latest.current = { products, orders, buyerOrders, inbound, cart, buyer, deliverHubId, audits }

  function persist(patch) {
    const next = {
      products: patch.products ?? latest.current.products,
      orders: patch.orders ?? latest.current.orders,
      buyerOrders: patch.buyerOrders ?? latest.current.buyerOrders,
      inbound: patch.inbound ?? latest.current.inbound,
      cart: patch.cart ?? latest.current.cart,
      buyer: patch.buyer ?? latest.current.buyer,
      deliverHubId: patch.deliverHubId ?? latest.current.deliverHubId,
      audits: patch.audits ?? latest.current.audits,
      orderSeq: orderSeq.current,
    }
    latest.current = next
    writeSnap(next)
    try {
      channelRef.current?.postMessage({ v: 2, tabId: tabId.current, ...next })
    } catch { /* ignore */ }
  }

  function applyLedger(data) {
    if (!data || !Array.isArray(data.products)) return
    if (qtyStamp(data.products) === qtyStamp(latest.current.products)
      && (data.orders || []).length === (latest.current.orders || []).length
      && (data.buyerOrders || []).length === (latest.current.buyerOrders || []).length
      && (data.inbound || []).length === (latest.current.inbound || []).length) return
    const nextProducts = hydrateProducts(data.products)
    setProducts(nextProducts)
    if (Array.isArray(data.orders)) setOrders(cloneList(data.orders))
    if (Array.isArray(data.buyerOrders)) setBuyerOrders(cloneList(data.buyerOrders))
    if (Array.isArray(data.inbound)) setInbound(cloneList(data.inbound))
    if (Array.isArray(data.audits)) setAudits(cloneList(data.audits))
    if (data.orderSeq) orderSeq.current = data.orderSeq
    latest.current = {
      ...latest.current,
      products: nextProducts,
      orders: Array.isArray(data.orders) ? cloneList(data.orders) : latest.current.orders,
      buyerOrders: Array.isArray(data.buyerOrders) ? cloneList(data.buyerOrders) : latest.current.buyerOrders,
      inbound: Array.isArray(data.inbound) ? cloneList(data.inbound) : latest.current.inbound,
      audits: Array.isArray(data.audits) ? cloneList(data.audits) : latest.current.audits,
    }
    setReorderResult(null)
    setScheduleResult(null)
  }

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

  function setBuyer(v) {
    setBuyerState(v)
    persist({ buyer: v })
  }

  function setDeliverHubId(v) {
    setDeliverHubState(v)
    persist({ deliverHubId: v })
  }

  function bumpQty(id, delta, hubId) {
    setProducts((list) => {
      const next = list.map((p) => (
        p.id === id ? addHubQty(p, hubId || p.warehouseId, delta) : p
      ))
      persist({ products: next })
      return next
    })
  }

  function addToCart(product, qty = 1) {
    const n = Math.max(1, qty)
    setCart((c) => {
      const i = c.findIndex((x) => x.id === product.id)
      const next = i === -1
        ? [...c, { id: product.id, qty: n }]
        : c.map((x, idx) => (idx === i ? { ...x, qty: x.qty + n } : x))
      persist({ cart: next })
      return next
    })
    showToast(`Added ${product.name}`)
  }

  function setCartQty(id, qty) {
    const n = Math.max(0, qty)
    setCart((c) => {
      const next = n === 0 ? c.filter((x) => x.id !== id) : c.map((x) => (x.id === id ? { ...x, qty: n } : x))
      persist({ cart: next })
      return next
    })
  }

  function placeOrder(hubId) {
    const dest = hubId || deliverHubId
    const hub = warehouses.find((w) => w.id === dest) || warehouses[0]
    let nextProducts = products.map((p) => ({ ...p, byHub: { ...emptyHubs(), ...(p.byHub || {}) } }))
    const lines = []
    for (const line of cart) {
      const p = nextProducts.find((x) => x.id === line.id)
      if (!p) continue
      const have = hubQty(p, hub.id)
      if (have <= 0) continue
      const take = Math.min(line.qty, have)
      nextProducts = nextProducts.map((x) => (x.id === p.id ? addHubQty(x, hub.id, -take) : x))
      const live = nextProducts.find((x) => x.id === p.id)
      lines.push({
        productId: p.id,
        sku: p.sku,
        name: p.name,
        qty: take,
        price: p.mrp,
        hubId: hub.id,
      })
      void live
    }

    if (!lines.length) {
      showToast(`Nothing in stock at ${hub.city}`)
      return null
    }

    const pickJobs = lines.map((ln) => {
      orderSeq.current += 1
      return {
        id: `ORD-${orderSeq.current}`,
        sku: ln.sku,
        qty: ln.qty,
        processingMin: Math.max(12, Math.round(ln.qty * 1.8 + 10)),
        priority: ln.qty >= 20 ? 'high' : ln.qty >= 8 ? 'med' : 'low',
        customer: buyer,
        productName: ln.name,
        hubId: hub.id,
        status: 'open',
        fresh: true,
      }
    })

    const ticket = {
      id: `SO-${Date.now().toString().slice(-6)}`,
      customer: buyer,
      hubId: hub.id,
      hubName: hub.name,
      city: hub.city,
      lines,
      total: lines.reduce((s, l) => s + l.price * l.qty, 0),
      status: 'placed',
      ts: Date.now(),
      pickIds: pickJobs.map((j) => j.id),
    }

    const pulse = {
      id: ticket.id,
      customer: buyer,
      city: hub.city,
      hubId: hub.id,
      summary: lines.map((l) => `${l.qty}× ${l.name}`).join(' · '),
      ts: Date.now(),
      pickIds: ticket.pickIds,
    }

    const nextOrders = [...pickJobs, ...orders]
    const nextBuyerOrders = [ticket, ...buyerOrders]
    const nextInbound = [pulse, ...inbound].slice(0, 8)
    setProducts(nextProducts)
    setOrders(nextOrders)
    setBuyerOrders(nextBuyerOrders)
    setInbound(nextInbound)
    setCart([])
    setScheduleResult(null)
    setReorderResult(null)
    persist({ products: nextProducts, orders: nextOrders, buyerOrders: nextBuyerOrders, inbound: nextInbound, cart: [] })
    log(`${buyer} ordered ${lines.length} line(s) → ${hub.city}`)
    showToast(`Order ${ticket.id} placed · ${hub.city}`)
    return ticket
  }

  function cancelOrder(ticketId) {
    const ticket = buyerOrders.find((o) => o.id === ticketId)
    if (!ticket || ticket.status === 'cancelled') return
    const hubId = ticket.hubId || deliverHubId
    let nextProducts = products
    for (const ln of ticket.lines || []) {
      nextProducts = nextProducts.map((p) => (
        p.id === ln.productId || p.sku === ln.sku
          ? addHubQty(p, hubId, ln.qty)
          : p
      ))
    }
    const drop = new Set(ticket.pickIds || [])
    const nextOrders = orders.filter((o) => !drop.has(o.id))
    const nextBuyerOrders = buyerOrders.map((o) => (
      o.id === ticketId ? { ...o, status: 'cancelled' } : o
    ))
    const nextInbound = inbound.filter((x) => x.id !== ticketId)
    setProducts(nextProducts)
    setOrders(nextOrders)
    setBuyerOrders(nextBuyerOrders)
    setInbound(nextInbound)
    setScheduleResult(null)
    persist({ products: nextProducts, orders: nextOrders, buyerOrders: nextBuyerOrders, inbound: nextInbound })
    log(`${ticket.customer} cancelled ${ticket.id}`)
    showToast(`Cancelled ${ticket.id} · stock restored`)
  }

  function dismissInbound(id) {
    const nextInbound = inbound.filter((x) => x.id !== id)
    setInbound(nextInbound)
    persist({ inbound: nextInbound })
  }

  function packOrder(id) {
    const nextOrders = orders.map((o) => (
      o.id === id ? { ...o, status: 'packed', packedAt: Date.now() } : o
    ))
    setOrders(nextOrders)
    setScheduleResult(null)
    persist({ orders: nextOrders })
    const job = nextOrders.find((o) => o.id === id)
    log(`Packed ${id}`)
    showToast(job ? `Packed ${job.productName}` : `Packed ${id}`)
  }

  function transferStock(id, fromId, toId, qty) {
    if (!fromId || !toId || fromId === toId) {
      showToast('Pick two different hubs')
      return false
    }
    const n = Math.max(1, Math.floor(Number(qty) || 0))
    let moved = 0
    setProducts((list) => {
      const next = list.map((p) => {
        if (p.id !== id) return p
        const take = Math.min(n, hubQty(p, fromId))
        moved = take
        if (!take) return p
        return addHubQty(addHubQty(p, fromId, -take), toId, take)
      })
      persist({ products: next })
      return next
    })
    if (!moved) {
      showToast('Nothing to move from that hub')
      return false
    }
    const from = warehouses.find((w) => w.id === fromId)?.city || fromId
    const to = warehouses.find((w) => w.id === toId)?.city || toId
    log(`Moved ${moved} from ${from} → ${to}`)
    showToast(`Moved ${moved} · ${from} → ${to}`)
    return true
  }

  function resetDemo() {
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
    window.location.reload()
  }

  function upsertProduct(p) {
    setProducts((list) => {
      const i = list.findIndex((x) => x.id === p.id)
      let next
      if (i === -1) {
        const byHub = emptyHubs()
        const home = p.warehouseId || warehouses[0].id
        byHub[home] = p.qty || 0
        next = [{
          ...p,
          id: `P-${String(list.length + 1).padStart(3, '0')}`,
          rating: 4.5,
          reviews: 0,
          mrp: Math.round((p.unitCost || 0) * 1.18),
          byHub,
          qty: sumHubs(byHub),
        }, ...list]
      } else {
        const cur = list[i]
        const delta = (p.qty ?? cur.qty) - cur.qty
        let merged = { ...cur, ...p, byHub: { ...emptyHubs(), ...(cur.byHub || {}) } }
        if (delta && !p.byHub) merged = addHubQty(merged, p.warehouseId || cur.warehouseId, delta)
        merged.qty = sumHubs(merged.byHub)
        next = list.slice()
        next[i] = merged
      }
      persist({ products: next })
      return next
    })
    log(`Updated ${p.sku}`)
    showToast(`Saved ${p.sku}`)
  }

  function deleteProduct(id) {
    setProducts((list) => {
      const next = list.filter((p) => p.id !== id)
      persist({ products: next })
      return next
    })
    log('Removed a SKU from the catalog')
    showToast('Product removed')
  }

  function applyRestock(selected) {
    const ids = new Set(selected.map((s) => s.id))
    setProducts((list) => {
      const next = list.map((p) => {
        if (!ids.has(p.id)) return p
        const item = selected.find((s) => s.id === p.id)
        return addHubQty(p, p.warehouseId, item.restockQty)
      })
      persist({ products: next })
      return next
    })
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
    const nextAudits = [
      { id: `AUD-${Date.now()}`, ts: Date.now(), rows: clean, discrepancies: clean.filter((r) => r.delta !== 0).length },
      ...latest.current.audits,
    ]
    setProducts((list) => {
      const next = list.map((p) => {
        if (!map.has(p.id)) return p
        const counted = map.get(p.id)
        const delta = counted - p.qty
        return addHubQty(p, p.warehouseId, delta)
      })
      persist({ products: next, audits: nextAudits })
      return next
    })
    const mismatches = clean.filter((r) => r.delta !== 0).length
    setAudits(nextAudits)
    log(`Posted a cycle count · ${clean.length} SKUs`)
    showToast(mismatches ? `Posted count · ${mismatches} mismatch${mismatches === 1 ? '' : 'es'}` : 'Posted count · all matched')
  }

  useEffect(() => {
    let ch = null
    try {
      ch = new BroadcastChannel('meridian-ledger')
      channelRef.current = ch
      ch.onmessage = (ev) => {
        const data = ev.data
        if (!data || data.tabId === tabId.current) return
        applyLedger(data)
      }
    } catch { /* unsupported */ }

    function onStorage(e) {
      if (e.key !== STORAGE_KEY || !e.newValue) return
      try { applyLedger(JSON.parse(e.newValue)) } catch { /* ignore */ }
    }
    function pull() { applyLedger(readSnap()) }
    function onVisible() { if (!document.hidden) pull() }

    window.addEventListener('storage', onStorage)
    window.addEventListener('focus', pull)
    document.addEventListener('visibilitychange', onVisible)
    persist({})
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('focus', pull)
      document.removeEventListener('visibilitychange', onVisible)
      ch?.close()
      channelRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stats = useMemo(() => {
    const skus = products.length
    const units = products.reduce((s, p) => s + p.qty, 0)
    const value = products.reduce((s, p) => s + p.qty * p.unitCost, 0)
    const low = products.filter((p) => p.qty < p.minStock)
    const stockout = products.filter((p) => p.qty === 0)
    return { skus, units, value, lowCount: low.length, stockout: stockout.length, low }
  }, [products])

  const cartCount = cart.reduce((s, l) => s + l.qty, 0)
  const cartLines = cart.map((l) => {
    const p = products.find((x) => x.id === l.id)
    return p ? { ...l, product: p, atHub: hubQty(p, deliverHubId) } : null
  }).filter(Boolean)
  const deliverHub = warehouses.find((w) => w.id === deliverHubId) || warehouses[0]

  return (
    <StoreContext.Provider value={{
      products, orders, buyerOrders, inbound, cart, cartLines, cartCount,
      buyer, setBuyer, deliverHubId, setDeliverHubId, deliverHub,
      audits, activity, stats, toast, showToast,
      searchQuery, setSearchQuery, shopQuery, setShopQuery, recentSearches, rememberSearch,
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
      bumpQty, addToCart, setCartQty, placeOrder, cancelOrder, dismissInbound, resetDemo,
      packOrder, transferStock,
      upsertProduct, deleteProduct, applyRestock, applyAuditCounts, log,
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
