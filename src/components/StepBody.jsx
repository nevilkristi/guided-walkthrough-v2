import DecisionCard from './DecisionCard.jsx';
import DecisionSimulator, { buildSeries } from './DecisionSimulator.jsx';
import SupplyChart from './SupplyChart.jsx';
import ScoresChart from './ScoresChart.jsx';

const NODE_TAG = { Supplier: 'fab', Logistics: 'logistics', Manufacturer: 'oem', Customer: 'customers' };

export default function StepBody({ step, caseData, ctx }) {
  switch (step.kind) {
    case 'flow':
      return (
        <ol className="flow-steps">
          {caseData.normal_flow_steps.map((s) => (
            <li key={s.step}>
              <span className={`node-tag ${NODE_TAG[s.node] ?? ''}`}>{s.node}</span>
              {s.process}
            </li>
          ))}
        </ol>
      );

    case 'kpis':
      return (
        <dl className="kpis">
          {caseData.kpis.map((k) => (
            <div key={k.label} className={k.label === 'Risk' ? 'kpi flagged' : 'kpi'}>
              <dt>{k.label}</dt>
              <dd>{k.value}</dd>
            </div>
          ))}
        </dl>
      );

    case 'disruption':
      return (
        <>
          <dl className="facts">
            {caseData.disruption
              .filter((d) => step.disruption.includes(d.label))
              .map((d) => (
                <div key={d.label}>
                  <dt>{d.label}</dt>
                  <dd>{d.value}</dd>
                </div>
              ))}
          </dl>
          {step.decisions && <Decisions nos={step.decisions} ctx={ctx} />}
        </>
      );

    case 'predict':
      return (
        <div className="predict">
          <p className="predict-q">{step.question}</p>
          <div className="predict-options" role="group" aria-label={step.question}>
            {step.options.map((o) => (
              <button
                key={o.id}
                className={`btn ${ctx.prediction === o.id ? 'primary' : ''}`}
                aria-pressed={ctx.prediction === o.id}
                onClick={() => ctx.setPrediction(o.id)}
              >
                {o.label}
              </button>
            ))}
          </div>
          {ctx.prediction && (
            <p className="muted">Locked in. We’ll check your prediction once the story plays out.</p>
          )}
        </div>
      );

    case 'simulator':
      return (
        <DecisionSimulator
          decisions={ctx.companyDecisions}
          picks={ctx.picks}
          onPicks={ctx.setPicks}
          results={ctx.results}
          onRun={ctx.run}
          onReset={ctx.reset}
        />
      );

    case 'decision':
      return <Decisions nos={step.decisions} actor={step.actor} ctx={ctx} />;

    case 'compare':
      return <Compare ctx={ctx} />;

    case 'lesson':
      return <Lesson step={step} caseData={caseData} ctx={ctx} />;

    default:
      return null;
  }
}

function Decisions({ nos, actor, ctx }) {
  return (
    <div className="decision-list">
      {nos.map((n) => ctx.decisionsById[n] && <DecisionCard key={n} d={ctx.decisionsById[n]} actor={actor} />)}
    </div>
  );
}

const PREDICTION_FEEDBACK = {
  ericsson: 'You predicted Ericsson. Correct: the same message, read two different ways, led to opposite outcomes.',
  nokia: 'You predicted Nokia. It was actually Ericsson. Nokia’s early escalation turned the same shock into minor delays.',
  same: 'You predicted “about the same”. In fact the outcomes were opposite, and the difference was how fast each one acted.',
};

function Compare({ ctx }) {
  const { results, prediction } = ctx;
  return (
    <>
      {prediction && (
        <p className={`verdict ${prediction === 'ericsson' ? 'good' : 'bad'}`}>{PREDICTION_FEEDBACK[prediction]}</p>
      )}
      <div className="duo">
        <div className="duo-card nokia">
          <div className="duo-name">Nokia</div>
          <div className="duo-big">Minor delays</div>
          <p>Kept shipping and grew market share.</p>
        </div>
        <div className="duo-card ericsson">
          <div className="duo-name">Ericsson</div>
          <div className="duo-big">~$400M lost</div>
          <p>About 7M phones short, the T36 launch delayed, and lost market share.</p>
        </div>
      </div>
      <SupplyChart series={buildSeries(results)} />
      {!results.you && (
        <p className="muted">
          Tip: go back to <button className="linkish" onClick={() => ctx.goTo('sim')}>Your turn</button> to add your own
          line to this chart.
        </p>
      )}
    </>
  );
}

function Lesson({ step, caseData, ctx }) {
  const recommended = caseData.decision_blocks[1];
  return (
    <>
      <ol className="lessons">
        {step.lessons.map((l) => (
          <li key={l.n}>
            <span className="lesson-n">{l.n}</span>
            <div>
              <strong>{l.title}</strong>
              <p>{l.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <ScoresChart scores={caseData.decision_scores} decisionsById={ctx.decisionsById} />
      {recommended && (
        <details className="recommended">
          <summary>{recommended.source}: {recommended.decisions.length} moves that would have prevented this</summary>
          <div className="decision-list">
            {recommended.decisions.map((d) => <DecisionCard key={d.decision_no} d={d} actor="rec" />)}
          </div>
        </details>
      )}
    </>
  );
}
