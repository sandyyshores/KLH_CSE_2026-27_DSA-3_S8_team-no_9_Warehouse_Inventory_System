import Orders from './Scheduler.jsx'
import Counts from './Audits.jsx'

export default function Floor({ go, tab, setTab }) {
  return (
    <>
      <div className="seg">
        <button className={tab === 'picks' ? 'on' : ''} onClick={() => setTab('picks')}>Picks</button>
        <button className={tab === 'counts' ? 'on' : ''} onClick={() => setTab('counts')}>Counts</button>
      </div>
      {tab === 'picks' ? <Orders go={go} /> : <Counts go={go} />}
    </>
  )
}
