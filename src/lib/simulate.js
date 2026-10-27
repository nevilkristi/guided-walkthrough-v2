// Illustrative 26-week supply model for the "Your turn" step.
// Calibrated so the real paths land near reported outcomes:
//   Ericsson (wait-and-see)            -> ~7M phones short, ~$400M lost sales
//   Nokia (escalate, on-site, lock, redesign) -> minor delays
// Shares and lead times are teaching assumptions, not case data.

export const WEEKS = 26;
const WEEKLY_DEMAND = 470_000; // phones' worth of chips per week
const PRICE_PER_PHONE = 57; // USD of lost sales per missing phone

export const MAX_PICKS = 4; // Nokia's real path used four moves
export const PATHS = {
  nokia: [1, 2, 5, 4],
  ericsson: [6],
};

// Alternate supply each move can unlock: share of plan, weeks to ramp after acting.
const ALT_SUPPLY = {
  3: { share: 0.2, ramp: 2 },
  4: { share: 0.35, ramp: 4 },
  5: { share: 0.5, ramp: 1, needsEarly: true },
  7: { share: 0.15, ramp: 12 },
};

// Indicative spend per Cost rating in the case data, $M.
const COST_M = {
  Low: 5,
  'Low- Medium': 10,
  'Low-Med': 10,
  Medium: 20,
  'Medium-High': 40,
  High: 80,
  'Very High': 200,
};

const clamp01 = (x) => Math.max(0, Math.min(1, x));

function ramp(t, start, length) {
  if (t <= start) return 0;
  return length <= 0 ? 1 : clamp01((t - start) / length);
}

export function simulate(picks, decisionsById) {
  const has = (n) => picks.includes(n);
  const notes = [];

  // When do you act? Escalation means you know on day 3; on-site engineers a bit later.
  const actWeek = has(1) ? 0.5 : has(2) ? 1.5 : 4;

  // Philips' own recovery: months, faster with your engineers helping on-site.
  const philipsStart = has(2) ? 5 : 8;
  const philipsFull = has(2) ? 16 : 22;

  const alts = [];
  for (const n of picks) {
    const alt = ALT_SUPPLY[n];
    if (!alt) continue;
    if (alt.needsEarly && actWeek > 1) {
      notes.push({ tone: 'bad', text: '“Sorry, all our spare capacity is already booked.” You asked too late, so locking up capacity gave you nothing.' });
      continue;
    }
    alts.push(alt);
  }

  const curve = [];
  let shortWeeks = 0;
  for (let w = 0; w < WEEKS; w++) {
    const t = w + 0.5;
    const philips = ramp(t, philipsStart, philipsFull - philipsStart);
    const alt = alts.reduce((sum, a) => sum + a.share * ramp(t, actWeek, a.ramp), 0);
    const supply = clamp01(philips + alt);
    curve.push(supply);
    shortWeeks += 1 - supply;
  }

  const phonesShort = Math.round(shortWeeks * WEEKLY_DEMAND);
  let lostSales = phonesShort * PRICE_PER_PHONE;
  const spend = picks.reduce((sum, n) => sum + (COST_M[decisionsById[n]?.Cost] ?? 0) * 1e6, 0);

  if (has(8)) {
    const recovered = Math.round(lostSales * 0.25);
    lostSales -= recovered;
    notes.push({ tone: 'mixed', text: `Insurance recovers about $${fmtM(recovered)}, but it doesn’t produce a single chip.` });
  }
  if (has(7)) notes.push({ tone: 'mixed', text: 'Ramping your own fab is slow (about 12 weeks) and quality is uncertain.' });
  if (has(9)) notes.push({ tone: 'good', text: 'SCRM won’t help this crisis, but it lowers your risk from the next one.' });
  if (has(10)) notes.push({ tone: 'mixed', text: 'Restructuring is a long-term fix. It is what Ericsson ended up doing anyway.' });
  if (has(6) && picks.length === 1) notes.push({ tone: 'bad', text: 'You waited, like Ericsson. The “one week” turned into months.' });

  return { curve, phonesShort, lostSales, spend, notes, actWeek };
}

export function fmtM(usd) {
  return `${Math.round(usd / 1e6).toLocaleString('en-US')}M`;
}

export function fmtPhones(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  return `${Math.round(n / 1e3)}k`;
}
