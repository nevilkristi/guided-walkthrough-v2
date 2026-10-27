import { useState } from 'react';

const DIMENSIONS = ['Cost', 'Resilience Gain', 'Feasibility', 'Speed', 'Sustainability'];

// Single series (Overall score out of 5), sorted high to low; hover or focus a bar for its breakdown.
export default function ScoresChart({ scores, decisionsById }) {
  const rows = [...scores].sort((a, b) => b.Overall - a.Overall);
  const [active, setActive] = useState(rows[0]?.decision_no);
  const current = rows.find((r) => r.decision_no === active);

  return (
    <div className="chart scores">
      <div className="chart-title">Overall score by decision (out of 5), from the case analysis</div>
      <ul className="bars">
        {rows.map((r) => (
          <li key={r.decision_no}>
            <button
              className={`bar-row ${active === r.decision_no ? 'active' : ''}`}
              onMouseEnter={() => setActive(r.decision_no)}
              onFocus={() => setActive(r.decision_no)}
              onClick={() => setActive(r.decision_no)}
            >
              <span className="bar-label">
                #{r.decision_no} {decisionsById[r.decision_no]?.Description}
              </span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: `${(r.Overall / 5) * 100}%` }} />
              </span>
              <span className="bar-value">{r.Overall.toFixed(1)}</span>
            </button>
          </li>
        ))}
      </ul>
      {current && (
        <dl className="breakdown" aria-live="polite">
          {DIMENSIONS.map((k) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{current[k]}/5</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
