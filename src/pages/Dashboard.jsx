import hero from '../assets/warehouse-hero.jpg'
import { useStore } from '../store.jsx'
import { categories } from '../data/seed.js'
import { inr } from '../lib/format.js'
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

export default function Home({ go }) {
  const { stats, products, activity, orders, setHighlightSku } = useStore()
  const hour = new Date().getHours()
  const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const featured = [...products].sort((a, b) => b.demandScore - a.demandScore).slice(0, 8)
  const openOrders = orders?.length || 16

  return (
    <>
      <div className="h-hero">
        <div className="welcome">
          <h1>{hello}.</h1>
          <p>Hyderabad hub is humming. Search the catalog like a storefront, keep bins honest, and reorder only what you actually need.</p>
        </div>
        <div className="hero-shot" style={{ backgroundImage: `url(${hero})` }} />
      </div>

      <div className="stats">
        <button className="stat clicky" onClick={() => go('search', '')}>
          <div className="k">Products</div>
          <div className="v">{stats.skus}</div>
          <div className="s">{stats.units.toLocaleString('en-IN')} units on hand</div>
        </button>
        <button className="stat clicky" onClick={() => go('stock')}>
          <div className="k">Stock value</div>
          <div className="v">{inr(stats.value)}</div>
          <div className="s">open the bin list</div>
        </button>
        <button className={`stat clicky ${stats.lowCount ? 'warn' : ''}`} onClick={() => go('reorder')}>
          <div className="k">Need attention</div>
          <div className="v">{stats.lowCount}</div>
          <div className="s">{stats.stockout} out of stock</div>
        </button>
        <button className="stat clicky" onClick={() => go('orders')}>
          <div className="k">Open orders</div>
          <div className="v">{openOrders}</div>
          <div className="s">plan today’s picks</div>
        </button>
      </div>

      <div className="section"><h2>Next up</h2></div>
      <div className="nexts">
        <button className="card next" onClick={() => go('reorder')}>
          <b>Build a buy list</b>
          <span>{stats.lowCount} SKUs under min stock</span>
        </button>
        <button className="card next" onClick={() => go('orders')}>
          <b>Plan picks</b>
          <span>{openOrders} customer orders waiting</span>
        </button>
        <button className="card next" onClick={() => go('counts')}>
          <b>Walk a count</b>
          <span>Fair sample of bins for today</span>
        </button>
        <button className="card next" onClick={() => go('supply')}>
          <b>Supplier week</b>
          <span>Who ships to which hub</span>
        </button>
      </div>

      <div className="section">
        <h2>Shop by aisle</h2>
      </div>
      <div className="cats">
        {categories.map((c) => (
          <button className="cat" key={c} onClick={() => go('search', c)}>
            <div className="ico">{ICO[c] || '·'}</div>
            <span>{c}</span>
          </button>
        ))}
      </div>

      <div className="section">
        <h2>Moving fast</h2>
        <button className="link" onClick={() => go('search', '')}>See all</button>
      </div>
      <div className="grid-cards">
        {featured.map((p) => (
          <ProductCard key={p.id} p={p} onClick={() => go('search', p.name)} />
        ))}
      </div>

      <div className="row2" style={{ marginTop: 28 }}>
        <div className="card">
          <div className="section" style={{ marginTop: 0 }}>
            <h2>Running low</h2>
            <button className="link" onClick={() => go('reorder')}>Reorder</button>
          </div>
          {stats.low.slice(0, 6).map((p) => {
            const pct = Math.min(100, Math.round((p.qty / Math.max(1, p.minStock)) * 100))
            return (
              <button
                className="low-row click-row"
                key={p.id}
                onClick={() => { setHighlightSku(p.sku); go('reorder') }}
              >
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: 650 }}>{p.name}</div>
                  <div className="faint" style={{ fontSize: 12 }}>{p.sku} · {p.location}</div>
                  <div className="bar"><i style={{ width: `${pct}%` }} /></div>
                </div>
                <div className="st low">{p.qty} / {p.minStock}</div>
              </button>
            )
          })}
        </div>
        <div className="card">
          <div className="section" style={{ marginTop: 0 }}><h2>Floor notes</h2></div>
          {activity.slice(0, 6).map((a, i) => (
            <div className="low-row" key={i}>
              <div style={{ flex: 1 }}>{a.text}</div>
              <div className="faint" style={{ fontSize: 12 }}>
                {new Date(a.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
