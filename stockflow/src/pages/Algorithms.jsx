import { course, team } from '../data/seed.js'

const ROWS = [
  ['Exact product lookup', 'O(n·m) linear scan', 'O(n+m) KMP / Rabin–Karp', 'Single pass'],
  ['Fuzzy / typo search', 'Not available', 'O(n·m) Wagner–Fischer', 'New capability'],
  ['Optimal restocking', 'Manual / greedy', 'O(n·W) 0/1 Knapsack DP', 'Provably optimal'],
  ['Max procurement flow', 'Manual allocation', 'O(V·E²) Edmonds–Karp', 'Capacity-aware'],
  ['Supplier assignment', 'Ad-hoc', 'O(V·E) Kuhn matching', 'Maximum pairs'],
  ['NP-hard order scheduling', 'Not available', '2-approx matching + LPT', 'Bounded ratio'],
  ['Randomized stock audits', 'Judgement sample', 'O(n) reservoir sampling', 'Uniform, streaming'],
]

const OBJECTIVES = [
  'Typo-tolerant product search (KMP, Rabin–Karp, Edit Distance)',
  'Cost-optimal restocking under budget / space (0/1 Knapsack)',
  'Supplier flow-network with Ford–Fulkerson / Edmonds–Karp and min-cut bottlenecks',
  'Bipartite matching for supplier–warehouse assignment',
  'NP-hard order scheduling via a matching-based 2-approximation',
  'Reservoir sampling for unbiased cycle counts',
]

export default function Algorithms() {
  return (
    <>
      <div className="hud">
        <div className="kicker" style={{ color: 'var(--copper)' }}>{course.code}</div>
        <h3 style={{ fontFamily: 'var(--display)', letterSpacing: '0.08em', margin: '8px 0' }}>{course.title}</h3>
        <p className="help">
          {course.name} · under {course.guide}. The website is the working artefact: every method in the
          proposal runs live against the Meridian DC catalog.
        </p>
        <div className="chips">
          {team.map((m) => <span className="badge" key={m.id}>{m.name} · {m.id}</span>)}
        </div>
      </div>

      <div className="hud" style={{ padding: 0 }}>
        <div className="section-h" style={{ padding: '14px 14px 0' }}>
          <h3>Results vs traditional WMS</h3>
          <span>from the project brief</span>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Operation</th>
                <th>Traditional</th>
                <th>Implemented here</th>
                <th>Gain</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r[0]}>
                  <td>{r[0]}</td>
                  <td className="muted">{r[1]}</td>
                  <td className="sku">{r[2]}</td>
                  <td>{r[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid g-2">
        <div className="hud">
          <div className="section-h"><h3>Objectives</h3></div>
          <ol className="help" style={{ margin: 0, paddingLeft: 18 }}>
            {OBJECTIVES.map((o) => <li key={o} style={{ marginBottom: 8 }}>{o}</li>)}
          </ol>
        </div>
        <div className="hud">
          <div className="section-h"><h3>Future scope (from brief)</h3></div>
          <ul className="help" style={{ margin: 0, paddingLeft: 18 }}>
            <li>Suffix automaton / suffix array catalog index</li>
            <li>Min-cost max-flow procurement</li>
            <li>Dinic’s algorithm for larger supplier nets</li>
            <li>Predictive restocking on top of the DP model</li>
            <li>Parallel reservoir / prefix-sum multi-DC audits</li>
          </ul>
        </div>
      </div>
    </>
  )
}
