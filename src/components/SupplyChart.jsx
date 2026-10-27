import { useRef, useState } from 'react';
import { WEEKS } from '../lib/simulate.js';

const W = 600;
const H = 250;
const M = { top: 14, right: 16, bottom: 30, left: 40 };
const IW = W - M.left - M.right;
const IH = H - M.top - M.bottom;
const LABEL_WEEK = 5; // where the paths diverge most, so direct labels sit there

const x = (w) => M.left + (w / (WEEKS - 1)) * IW;
const y = (v) => M.top + (1 - v) * IH;

export default function SupplyChart({ series }) {
  const [hover, setHover] = useState(null);
  const svgRef = useRef(null);

  const onMove = (e) => {
    const box = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * W;
    const w = Math.round(((px - M.left) / IW) * (WEEKS - 1));
    setHover(Math.max(0, Math.min(WEEKS - 1, w)));
  };

  // Direct labels, nudged upward (bottom first) so they never overlap or fall below the axis.
  const labels = series
    .map((s) => ({ ...s, ly: y(s.values[LABEL_WEEK]) }))
    .sort((a, b) => b.ly - a.ly);
  for (let i = 1; i < labels.length; i++) {
    if (labels[i - 1].ly - labels[i].ly < 14) labels[i].ly = labels[i - 1].ly - 14;
  }
  // "You" is first in the series list; paint it last so it stays on top of an identical path.
  const paintOrder = [...series].reverse();

  return (
    <div className="chart">
      <div className="chart-title">Chip supply, % of plan · weeks after the fire</div>
      <ul className="chart-legend">
        {series.map((s) => (
          <li key={s.id}>
            <svg width="22" height="8" aria-hidden="true">
              <line x1="1" y1="4" x2="21" y2="4" stroke={s.color} strokeWidth="2.5" strokeDasharray={s.dash} strokeLinecap="round" />
            </svg>
            {s.label}
          </li>
        ))}
      </ul>

      <div className="chart-plot">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Line chart of chip supply over ${WEEKS} weeks for ${series.map((s) => s.label).join(', ')}`}
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
          onTouchStart={(e) => onMove(e.touches[0])}
          onTouchMove={(e) => onMove(e.touches[0])}
        >
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <g key={v}>
              <line x1={M.left} x2={W - M.right} y1={y(v)} y2={y(v)} className="grid" />
              <text x={M.left - 8} y={y(v) + 4} className="axis" textAnchor="end">{v * 100}%</text>
            </g>
          ))}
          {[0, 4, 8, 12, 16, 20, 25].map((w) => (
            <text key={w} x={x(w)} y={H - 8} className="axis" textAnchor="middle">
              {w === 0 ? 'Fire' : `wk ${w}`}
            </text>
          ))}

          {paintOrder.map((s) => (
            <path
              key={s.id}
              d={s.values.map((v, w) => `${w ? 'L' : 'M'}${x(w).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')}
              fill="none"
              stroke={s.color}
              strokeWidth={s.id === 'you' ? 2.5 : 2}
              strokeDasharray={s.dash}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}

          {labels.map((s) => (
            <text key={s.id} x={x(LABEL_WEEK) + 8} y={s.ly - 4} className="direct-label">{s.label}</text>
          ))}

          {hover !== null && (
            <g pointerEvents="none">
              <line x1={x(hover)} x2={x(hover)} y1={M.top} y2={M.top + IH} className="crosshair" />
              {series.map((s) => (
                <circle key={s.id} cx={x(hover)} cy={y(s.values[hover])} r="4.5" fill={s.color} className="hover-dot" />
              ))}
            </g>
          )}
          <rect x={M.left} y={M.top} width={IW} height={IH} fill="transparent" />
        </svg>

        {hover !== null && (
          <div className="tooltip" style={{ left: `${(x(hover) / W) * 100}%` }}>
            <div className="tooltip-h">Week {hover + 1}</div>
            {series.map((s) => (
              <div key={s.id} className="tooltip-row">
                <i style={{ background: s.color }} /> {s.label} <b>{Math.round(s.values[hover] * 100)}%</b>
              </div>
            ))}
          </div>
        )}
      </div>

      <details className="table-view">
        <summary>Show as table</summary>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Week</th>
                {series.map((s) => <th key={s.id}>{s.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {series[0].values.map((_, w) =>
                w % 2 === 0 ? (
                  <tr key={w}>
                    <td>{w + 1}</td>
                    {series.map((s) => <td key={s.id}>{Math.round(s.values[w] * 100)}%</td>)}
                  </tr>
                ) : null,
              )}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
