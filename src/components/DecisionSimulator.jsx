import DecisionCard from './DecisionCard.jsx';
import SupplyChart from './SupplyChart.jsx';
import { MAX_PICKS, fmtM, fmtPhones } from '../lib/simulate.js';

export const SERIES_STYLE = {
  you: { label: 'You', color: '#4C5FD5' },
  nokia: { label: 'Nokia', color: '#0E9384' },
  ericsson: { label: 'Ericsson', color: '#E1604A', dash: '7 5' },
};

const WAIT = 6;

export function buildSeries(results) {
  return Object.entries(results)
    .filter(([, r]) => r)
    .map(([id, r]) => ({ id, ...SERIES_STYLE[id], values: r.curve }));
}

export default function DecisionSimulator({ decisions, picks, onPicks, results, onRun, onReset }) {
  const ran = Boolean(results.you);

  const toggle = (n) => {
    if (ran) return;
    if (picks.includes(n)) return onPicks(picks.filter((p) => p !== n));
    // Waiting is the absence of action, so it can't be combined with anything.
    if (n === WAIT) return onPicks([WAIT]);
    const next = picks.filter((p) => p !== WAIT);
    if (next.length >= MAX_PICKS) return;
    onPicks([...next, n]);
  };

  return (
    <div className="sim">
      <div className="sim-grid">
        {decisions.map((d) => {
          const selected = picks.includes(d.decision_no);
          const full = picks.filter((p) => p !== WAIT).length >= MAX_PICKS && d.decision_no !== WAIT;
          return (
            <DecisionCard
              key={d.decision_no}
              d={d}
              selectable
              selected={selected}
              disabled={ran || (!selected && full)}
              onToggle={() => toggle(d.decision_no)}
            />
          );
        })}
      </div>

      {!ran ? (
        <div className="sim-run">
          <span className="muted">
            {picks.length ? `${picks.length} of ${MAX_PICKS} picked` : `Pick up to ${MAX_PICKS} moves`}
          </span>
          <button className="btn primary" disabled={!picks.length} onClick={onRun}>
            Run the next 26 weeks →
          </button>
        </div>
      ) : (
        <SimResult results={results} onReset={onReset} />
      )}
    </div>
  );
}

function SimResult({ results, onReset }) {
  const { you, nokia, ericsson } = results;
  const rows = [
    { k: 'Phones short', f: (r) => fmtPhones(r.phonesShort) },
    { k: 'Lost sales', f: (r) => `$${fmtM(r.lostSales)}` },
    { k: 'Mitigation spend', f: (r) => `$${fmtM(r.spend)}` },
  ];
  const closer = Math.abs(you.phonesShort - nokia.phonesShort) <= Math.abs(you.phonesShort - ericsson.phonesShort);

  return (
    <div className="sim-result" aria-live="polite">
      <p className={`verdict ${closer ? 'good' : 'bad'}`}>
        {closer
          ? 'Your path looks like Nokia’s: you acted on your own data and got to scarce capacity in time.'
          : 'Your path looks like Ericsson’s: by the time you moved, the shortage had already set in.'}
      </p>

      <div className="table-scroll">
        <table className="compare">
          <thead>
            <tr>
              <th />
              <th>You</th>
              <th>Nokia’s path</th>
              <th>Ericsson’s path</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.k}>
                <th scope="row">{r.k}</th>
                <td><b>{r.f(you)}</b></td>
                <td>{r.f(nokia)}</td>
                <td>{r.f(ericsson)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {you.notes.length > 0 && (
        <ul className="notes">
          {you.notes.map((n) => <li key={n.text} className={n.tone}>{n.text}</li>)}
        </ul>
      )}

      <SupplyChart series={buildSeries(results)} />

      <p className="fineprint">
        An illustrative model calibrated to the reported outcomes (Ericsson ≈ 7M phones, ≈ $400M). The shares and ramp
        times are teaching assumptions, not case data.
      </p>
      <div className="sim-run">
        <button className="btn" onClick={onReset}>Try a different strategy</button>
        <span className="muted">Keep scrolling to see what really happened ↓</span>
      </div>
    </div>
  );
}
