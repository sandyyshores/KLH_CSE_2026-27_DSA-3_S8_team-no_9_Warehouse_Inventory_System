import { warehouses } from '../data/seed.js'
import { shopSearch } from './shopSearch.js'

export function emptyHubs() {
  return Object.fromEntries(warehouses.map((w) => [w.id, 0]))
}

export function sumHubs(byHub) {
  return Object.values(byHub || {}).reduce((s, n) => s + (Number(n) || 0), 0)
}

export function hubQty(p, hubId) {
  if (!hubId) return p?.qty || 0
  if (p?.byHub && p.byHub[hubId] != null) return Math.max(0, Number(p.byHub[hubId]) || 0)
  return p?.qty || 0
}

export function addHubQty(p, hubId, delta) {
  const byHub = { ...emptyHubs(), ...(p.byHub || {}) }
  const id = hubId || p.warehouseId || warehouses[0].id
  byHub[id] = Math.max(0, (Number(byHub[id]) || 0) + delta)
  return { ...p, byHub, qty: sumHubs(byHub) }
}

export function setHubQty(p, hubId, qty) {
  const byHub = { ...emptyHubs(), ...(p.byHub || {}) }
  byHub[hubId || p.warehouseId || warehouses[0].id] = Math.max(0, qty)
  return { ...p, byHub, qty: sumHubs(byHub) }
}

export function atHub(p, hubId) {
  return { ...p, qty: hubQty(p, hubId) }
}

export function splitAcrossHubs(qty, homeId, salt = 0) {
  const byHub = emptyHubs()
  const n = Math.max(0, Math.floor(qty) || 0)
  if (n === 0) return byHub
  const home = homeId && byHub[homeId] != null ? homeId : warehouses[0].id
  if (n <= 4) {
    byHub[home] = n
    return byHub
  }
  const others = warehouses.filter((w) => w.id !== home)
  const dry = others[Math.abs(salt) % others.length].id
  const homeShare = Math.max(1, Math.round(n * 0.42))
  byHub[home] = homeShare
  let left = n - homeShare
  const wet = others.filter((w) => w.id !== dry)
  wet.forEach((w, i) => {
    if (left <= 0) return
    const share = i === wet.length - 1 ? left : Math.max(0, Math.floor(left / (wet.length - i)))
    byHub[w.id] = share
    left -= share
  })
  if (left > 0) byHub[home] += left
  return byHub
}

export function substitutes(product, products, hubId, limit = 3) {
  if (!product) return []
  const pool = products.filter((p) => p.id !== product.id)
  const sameCat = pool.filter((p) => p.category === product.category && hubQty(p, hubId) > 0)
  const ranked = sameCat.length ? sameCat : pool.filter((p) => hubQty(p, hubId) > 0)
  const found = shopSearch(product.name, ranked).results
    .filter((p) => p.id !== product.id && hubQty(p, hubId) > 0)
  const seen = new Set()
  const out = []
  for (const p of [...found, ...ranked]) {
    if (seen.has(p.id)) continue
    seen.add(p.id)
    out.push(p)
    if (out.length >= limit) break
  }
  return out
}

export function hubsWithStock(p, exceptId) {
  return warehouses.filter((w) => w.id !== exceptId && hubQty(p, w.id) > 0)
}
