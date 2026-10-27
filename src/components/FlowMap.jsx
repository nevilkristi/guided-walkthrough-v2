import { useState } from 'react';
import { nodeSource } from '../data/story.js';

// Node centres in a 680x340 viewBox; every node is NODE_W x NODE_H.
const NODE_W = 116;
const NODE_H = 52;
const NODES = {
  fab: { x: 70, y: 190, title: 'Philips Fab 22', sub: 'Albuquerque · supplier' },
  logistics: { x: 230, y: 190, title: 'Logistics', sub: 'JIT inbound' },
  nokia: { x: 420, y: 95, title: 'Nokia', sub: 'Espoo · manufacturer' },
  ericsson: { x: 420, y: 285, title: 'Ericsson', sub: 'Stockholm · manufacturer' },
  customers: { x: 610, y: 190, title: 'Customers', sub: 'Operators & retail' },
  alt: { x: 230, y: 40, title: 'Alternate fabs', sub: 'US · Japan · Philips' },
};

const EDGES = {
  fl: 'M128 190 L172 190',
  ln: 'M288 190 C 325 190, 325 95, 362 95',
  le: 'M288 190 C 325 190, 325 285, 362 285',
  nc: 'M478 95 C 515 95, 515 190, 552 190',
  ec: 'M478 285 C 515 285, 515 190, 552 190',
  an: 'M288 40 C 325 40, 325 90, 362 90',
  ae: 'M288 48 C 340 60, 310 270, 362 278',
};

const base = {
  nodes: { fab: 'ok', logistics: 'ok', nokia: 'ok', ericsson: 'ok', customers: 'ok', alt: 'off' },
  edges: { fl: 'flow', ln: 'flow', le: 'flow', nc: 'flow', ec: 'flow', an: 'off', ae: 'off' },
  badges: {},
};

function scene(clock, nodes = {}, edges = {}, badges = {}, extra = {}) {
  return {
    clock,
    nodes: { ...base.nodes, ...nodes },
    edges: { ...base.edges, ...edges },
    badges,
    ...extra,
  };
}

const afterFire = { fl: 'cut', ln: 'slow', le: 'slow' };

export const SCENES = {
  normal: scene('Early 2000 · business as usual'),
  risk: scene('Early 2000 · business as usual', { fab: 'risk' }, {}, { fab: 'Single source · no buffer' }),
  fire: scene('17 Mar 2000 · 8 PM', { fab: 'fire' }, { fl: 'cut' }, { fab: 'Clean room contaminated' }, { bolt: true }),
  call: scene('Day 1', { fab: 'hit' }, afterFire, { fab: '“About a week”' }),
  day3: scene('Day 3', { fab: 'hit', nokia: 'alert', ericsson: 'alert' }, afterFire, {
    nokia: 'Deliveries below plan',
    ericsson: 'Deliveries below plan',
  }),
  'nokia-escalate': scene('Day 3', { fab: 'hit', nokia: 'win', ericsson: 'alert' }, afterFire, {
    nokia: 'Escalated · daily updates',
  }),
  'ericsson-wait': scene('Day 3', { fab: 'hit', nokia: 'win', ericsson: 'idle' }, afterFire, {
    nokia: 'Escalated · daily updates',
    ericsson: 'Waiting for next update',
  }),
  months: scene('Week 2', { fab: 'hit', nokia: 'win', ericsson: 'idle' }, { fl: 'cut', ln: 'cut', le: 'cut' }, {
    fab: 'Months, not a week',
    nokia: 'Engineers on-site',
    ericsson: 'Still waiting',
  }),
  'nokia-reroute': scene(
    'Weeks 2–4',
    { fab: 'hit', nokia: 'win', ericsson: 'idle', alt: 'win' },
    { fl: 'cut', ln: 'cut', le: 'cut', an: 'new', ec: 'slow' },
    { alt: 'Capacity locked by Nokia', nokia: 'Redesigned for alt chips' },
  ),
  'ericsson-starved': scene(
    'Weeks later',
    { fab: 'hit', nokia: 'win', ericsson: 'starved', alt: 'win' },
    { fl: 'cut', ln: 'cut', le: 'cut', an: 'flow', ec: 'cut' },
    { alt: 'Fully booked', ericsson: '~7M phones short' },
  ),
  outcome: scene(
    'End of 2000',
    { fab: 'hit', nokia: 'win', ericsson: 'starved', alt: 'win' },
    { fl: 'cut', ln: 'cut', le: 'cut', an: 'flow', ec: 'cut' },
    { nokia: 'Minor delays · gained share', ericsson: '~$400M lost' },
  ),
  jv: scene(
    'Oct 2001',
    { fab: 'hit', nokia: 'win', ericsson: 'jv', alt: 'ok' },
    { fl: 'idle', ln: 'idle', le: 'idle', an: 'flow', ec: 'idle' },
    { fab: '~$40M loss · closed 2003', ericsson: 'Exits standalone handsets' },
    { relabel: { ericsson: { title: 'Sony Ericsson', sub: 'Joint venture · 2001' } } },
  ),
  lesson: scene(
    'After: a resilient network',
    { alt: 'ok' },
    { an: 'flow', ae: 'flow' },
    { fab: 'Audited BCP', alt: 'Pre-qualified second source' },
  ),
};

const NODE_INFO_ALT =
  'Philips’ other fabs plus spare US and Japanese chip capacity. Whoever books it first gets it (decisions 3–5).';

const STATE_LABEL = {
  ok: 'Operating normally',
  risk: 'Hidden risk',
  fire: 'On fire',
  hit: 'Disrupted',
  alert: 'Warning signs',
  win: 'Acting',
  idle: 'Waiting',
  starved: 'Starved of chips',
  jv: 'Restructured',
};

export default function FlowMap({ sceneId, caseData }) {
  const s = SCENES[sceneId] ?? SCENES.normal;
  const [selected, setSelected] = useState(null);

  const info = (() => {
    if (!selected) return null;
    const node = { ...NODES[selected], ...(s.relabel?.[selected] ?? {}) };
    const text =
      selected === 'alt'
        ? NODE_INFO_ALT
        : caseData.normal_flow_nodes?.[nodeSource[selected]]?.description ?? '';
    return { ...node, text, state: STATE_LABEL[s.nodes[selected]] };
  })();

  return (
    <figure className="flowmap" aria-label={`Supply chain map: ${s.clock}`}>
      <div className="flowmap-head">
        <span className="clock">{s.clock}</span>
        <ul className="flowmap-legend" aria-label="Legend">
          <li><i className="lg flow" /> flowing</li>
          <li><i className="lg slow" /> thinning</li>
          <li><i className="lg cut" /> cut</li>
        </ul>
      </div>

      <svg viewBox="0 0 680 340" role="group">
        {Object.entries(EDGES).map(([id, d]) => {
          const state = s.edges[id];
          if (state === 'off') return null;
          return (
            <g key={id} className={`edge ${state}`}>
              <path d={d} className="edge-base" />
              {(state === 'flow' || state === 'slow' || state === 'new') && <path d={d} className="edge-dots" />}
            </g>
          );
        })}

        {Object.entries(NODES).map(([id, n]) => {
          const state = s.nodes[id];
          if (state === 'off') return null;
          const label = { ...n, ...(s.relabel?.[id] ?? {}) };
          const badge = s.badges[id];
          const x = n.x - NODE_W / 2;
          const y = n.y - NODE_H / 2;
          return (
            <g
              key={id}
              className={`node ${state} ${selected === id ? 'selected' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={`${label.title}: ${STATE_LABEL[state]}${badge ? `. ${badge}` : ''}`}
              onClick={() => setSelected(selected === id ? null : id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelected(selected === id ? null : id);
                }
              }}
            >
              {state === 'fire' && <circle cx={n.x} cy={n.y} r="44" className="fire-glow" />}
              <rect x={x} y={y} width={NODE_W} height={NODE_H} rx="10" className="node-box" />
              <text x={n.x} y={n.y - 4} className="node-title">{label.title}</text>
              <text x={n.x} y={n.y + 13} className="node-sub">{label.sub}</text>
              {badge && (
                <text x={n.x} y={n.y + NODE_H / 2 + 16} className="node-badge">{badge}</text>
              )}
            </g>
          );
        })}

        {s.bolt && (
          <path
            className="bolt"
            d="M92 92 L72 132 L88 132 L74 160 L108 120 L90 120 L104 92 Z"
            aria-hidden="true"
          />
        )}
      </svg>

      <figcaption className="flowmap-info" aria-live="polite">
        {info ? (
          <>
            <strong>{info.title}</strong> <span className="muted">· {info.state}</span>
            <p>{info.text}</p>
          </>
        ) : (
          <span className="muted">Tap any node on the map for details.</span>
        )}
      </figcaption>
    </figure>
  );
}
