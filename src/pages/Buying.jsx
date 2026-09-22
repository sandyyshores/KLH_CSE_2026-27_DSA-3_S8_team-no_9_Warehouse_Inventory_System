import Reorder from './Restock.jsx'
import Suppliers from './Network.jsx'

export default function Buying({ go, tab, setTab }) {
  return (
    <>
      <div className="seg">
        <button className={tab === 'buy' ? 'on' : ''} onClick={() => setTab('buy')}>Buy list</button>
        <button className={tab === 'supply' ? 'on' : ''} onClick={() => setTab('supply')}>Suppliers</button>
      </div>
      {tab === 'buy' ? <Reorder go={go} /> : <Suppliers go={go} />}
    </>
  )
}
