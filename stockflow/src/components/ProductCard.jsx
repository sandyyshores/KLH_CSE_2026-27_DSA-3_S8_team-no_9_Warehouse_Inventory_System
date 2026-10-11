import { productImage } from '../data/images.js'
import { inr, stockLabel } from '../lib/format.js'

export default function ProductCard({ p, onClick, shop = false, place }) {
  const st = stockLabel(p, { place, shop })
  const price = shop ? p.mrp : p.unitCost
  return (
    <button className="pcard" onClick={onClick} type="button">
      <div className="ph">
        <img src={productImage(p)} alt="" />
        <span className={`flag ${st.k}`}>{st.t}</span>
      </div>
      <div className="bd">
        <div className="nm">{p.name}</div>
        <div className="sku">{shop ? p.category : `${p.sku} · ${p.location}`}</div>
        <div className="stars">★ {p.rating} <span className="faint">{p.reviews}</span></div>
        {p._why === 'close' && <span className="why">close match</span>}
        <div className="meta">
          <span className="price">{inr(price)}</span>
          <span className={`st ${st.k}`}>{p.qty}</span>
        </div>
      </div>
    </button>
  )
}
