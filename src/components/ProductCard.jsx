import { productImage } from '../data/images.js'
import { inr, stockLabel } from '../lib/format.js'

export default function ProductCard({ p, onClick }) {
  const st = stockLabel(p)
  return (
    <button className="pcard" onClick={onClick} type="button">
      <div className="ph">
        <img src={productImage(p)} alt="" />
        <span className={`flag ${st.k}`}>{st.t}</span>
      </div>
      <div className="bd">
        <div className="nm">{p.name}</div>
        <div className="sku">{p.sku} · {p.location}</div>
        <div className="stars">★ {p.rating} <span className="faint">{p.reviews}</span></div>
        {p._why === 'close' && <span className="why">close match</span>}
        <div className="meta">
          <div>
            <span className="price">{inr(p.unitCost)}</span>
            <span className="mrp">{inr(p.mrp)}</span>
          </div>
        </div>
      </div>
    </button>
  )
}
