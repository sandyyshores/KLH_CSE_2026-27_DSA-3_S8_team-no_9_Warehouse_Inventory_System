# Warehouse Inventory System

**Meridian** — a wholesale shop and a warehouse console that share one live catalogue.

Built for **Data Structures and Algorithms-3 (25CS2103E)**, AY 2026–27. Every syllabus technique is a warehouse action, not a disconnected lab screen.

Two URLs, one ledger:

| URL | Who | What they see |
|-----|-----|----------------|
| `/` or `/shop` | Buyer | Selling price (MRP), search, cart, deliver-to hub, orders |
| `/admin` | Warehouse | Catalog, Stock, Buying, Floor — unit cost, bins, picks |

Checkout cuts quantity at the chosen hub immediately. Cancel restores it. Packed completes a pick. Both sides stay in sync across refresh and across two browser tabs.

![Shop](docs/screenshots/shop_home.png)

![Warehouse catalog](docs/screenshots/admin_catalog.png)

## Implemented

### Shop (`/`)

- [x] Catalogue with photographs, category chips, live hub counts
- [x] Search as you type — grid filters plus optional typeahead
- [x] Enter / Search uses the **typed** query (`ssd` lists both SSDs); click a row only if you want that SKU
- [x] Product sheet, add to cart **without** cutting stock
- [x] Deliver-to hub (Hyderabad, Mumbai, Chennai, Gurugram, Bengaluru) — not a street form
- [x] Place order cuts that hub’s quantity and inserts Floor pick jobs
- [x] My orders, with cancel that restores stock
- [x] Buyer sees MRP, never warehouse unit cost

### Warehouse (`/admin`)

- [x] **Catalog** — same cards as the shop, unit cost and on-hand
- [x] **Stock** — cards with +/−, Edit / Move / Reorder, hub chips, List toggle
- [x] **Buying → Buy list** — 0/1 knapsack under a typed spend cap, Place POs
- [x] **Buying → Suppliers** — Edmonds–Karp max-flow and Kuhn matching
- [x] **Floor → Picks** — dock Gantt (2-approx for P‖Cmax), Packed, print pick list
- [x] **Floor → Counts** — reservoir sample of SKUs, post counted qty back to the book
- [x] Hub-to-hub transfer, inbound pulse when a shop order lands
- [x] Reset demo

### Shared ledger

- [x] `localStorage` snapshot (`meridian-ledger-v2`)
- [x] `BroadcastChannel` so `/` and `/admin` in two tabs agree
- [x] Hub-level `byHub` quantities (five Indian hubs)
- [x] No names, roll numbers, or project guide in the UI

## Algorithms (DSA-3)

Each file in `src/algorithms/` is a pure function a viva can open on its own.

| Problem | Technique | File | Where it runs |
|---------|-----------|------|----------------|
| Exact SKU / name lookup | Knuth–Morris–Pratt | `kmp.js` | Shop + Catalog search |
| Exact lookup (rolling hash) | Rabin–Karp | `rabinKarp.js` | Search fallback |
| Typos | Wagner–Fischer edit distance (threshold 3) | `editDistance.js` | Fuzzy search |
| Restock under a rupee cap | 0/1 knapsack DP | `knapsack.js` | Buying → Buy list |
| Supplier capacity into hubs | Edmonds–Karp max-flow | `edmondsKarp.js` | Buying → Suppliers |
| Supplier ↔ hub assignment | Kuhn bipartite matching | `matching.js` | Buying → Suppliers |
| Pick makespan on *m* docks | Matching-based 2-approx for P‖Cmax + LPT | `scheduler.js` | Floor → Picks |
| Unbiased cycle-count sample | Vitter’s reservoir algorithm R | `reservoir.js` | Floor → Counts |

Search pipeline: **KMP → Rabin–Karp → edit distance**. Exact hits win; otherwise fuzzy.

## Demo catalogue

- ~48 SKUs across Electronics, Fasteners, Packaging, Apparel, Automotive, Pharma, FMCG, Industrial
- 5 hubs, 6 suppliers, 4 docks
- Seed data in `src/data/seed.js`

## Run locally

Needs Node.js 20+.

```bash
cd stockflow
npm install
npm run dev
```

Then open:

- Shop — http://localhost:5173/
- Warehouse — http://localhost:5173/admin

`npm run build` / `npm run preview` for a production build.

There is no backend, database, login, or payment. Everything lives in the browser so a sale on `/` is visible on `/admin` in the same process.

## Project layout

```
src/
  algorithms/     KMP, Rabin–Karp, edit distance, knapsack,
                  Edmonds–Karp, Kuhn, scheduler, reservoir
  components/     ShopLayout, Layout (four admin tabs), ProductCard
  pages/          Catalog, Stock, Buying, Floor
  pages/shop/     Shop, Cart, Orders
  lib/            shopSearch.js, stock.js (byHub arithmetic)
  data/           seed catalogue, hubs, suppliers, docks
  store.jsx       shared ledger, persist, BroadcastChannel
```

## Two-minute viva script

1. On `/`, type `ssd` — both NVMe SSDs appear; Enter does not steal the highlighted suggestion.
2. Add tape (or anything in stock), Place order to Hyderabad.
3. Open `/admin` → Floor — the pick is on the dock board.
4. Packed greys the row. Stock +/− and Place POs show on the shop.
5. Move units Hyderabad → Mumbai. Reset demo restores seed.

Flow / matching is one click: Buying → Suppliers.

## Documentation

`Warehouse_Inventory_System_Project_Documentation.docx` follows the department 2026–27 format (cover, declaration, certificate, chapters 1–7, IEEE references). Chapter 5 uses screenshots of this running app.

## Team

| Name | Roll |
|------|------|
| Santhosh Pendyala | 2520030330 |
| Haadi Hasil | 2520030297 |
| Sashank Chivukula | 2520030405 |

Team 9 · Section S8 · KLH CSE · 25CS2103E · 2026–27

## Tech stack

- React 19 + Vite 8
- JavaScript (ES modules) — no TypeScript, no UI kit
- Persistence: `localStorage` + `BroadcastChannel`
- Lint: Oxlint

## Not in this build

The original proposal listed Java, hash-table indexing, BST/AVL range queries, and a min-heap for low-stock. Those were replaced by the DSA-3 set above so shop and warehouse can share one process in the browser. Low-stock is a threshold on hub quantity, not a heap.
