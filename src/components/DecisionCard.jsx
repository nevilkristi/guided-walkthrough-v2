const CHIPS = ['Cost', 'Lead Time', 'Risk', 'Customer satisfaction'];

// Rough sentiment per rating so chips read at a glance; the text label is always shown.
function tone(field, value = '') {
  const v = value.toLowerCase();
  switch (field) {
    case 'Cost':
      return v.startsWith('low') ? 'good' : v.includes('high') ? 'bad' : 'mid';
    case 'Lead Time':
      return /improved|fast|best/.test(v) ? 'good' : /poor|slow/.test(v) ? 'bad' : 'mid';
    case 'Risk':
      return /^low|reduced|redcued/.test(v) ? 'good' : /high/.test(v) ? 'bad' : 'mid';
    default:
      return /protected/.test(v) ? 'good' : /low|not helped/.test(v) ? 'bad' : 'mid';
  }
}

export default function DecisionCard({ d, actor, selectable, selected, disabled, onToggle }) {
  // Selectable cards are labels wrapping a real checkbox, so keyboard and screen readers work natively.
  const Tag = selectable ? 'label' : 'article';
  return (
    <Tag className={`decision ${actor ?? ''} ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}>
      {selectable && (
        <input type="checkbox" className="sr-only" checked={selected} disabled={disabled} onChange={onToggle} />
      )}
      <div className="decision-head">
        <span className="decision-no">#{d.decision_no}</span>
        {/* In the simulator, hide "(Nokia)" tags so the reveal isn't spoiled. */}
        <span className="decision-title">{selectable ? d.Description.replace(/\s*\(Nokia\)/, '') : d.Description}</span>
        {selectable && <span className="decision-check" aria-hidden="true">{selected ? '✓' : '+'}</span>}
      </div>
      <p className="decision-action">{d.Action}</p>
      <ul className="chips">
        {CHIPS.map((f) => (
          <li key={f} className={`chip ${tone(f, d[f])}`}>
            <span className="chip-k">{f === 'Customer satisfaction' ? 'Customers' : f}</span> {d[f]}
          </li>
        ))}
      </ul>
      {!selectable && (
        <p className="best-when">
          <span className="muted">Best when:</span> {d['Best when']}
        </p>
      )}
    </Tag>
  );
}
