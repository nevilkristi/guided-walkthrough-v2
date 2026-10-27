const ROWS = [
  {
    feature: 'Live flow map',
    principle: 'Dual coding & signalling',
    why: 'Learners see the structure of the chain and the ripple of the disruption, instead of reconstructing it from text. This answers the student request for a “real-time flowchart”.',
  },
  {
    feature: 'Comic panel synced to each step',
    principle: 'Contiguity',
    why: 'The story view (comic) and the system view (map) sit side by side, so readers no longer switch between two separate modes.',
  },
  {
    feature: 'Predict, then the “Your turn” simulator',
    principle: 'Generation effect · retrieval',
    why: 'Committing to a prediction and a strategy before the reveal makes the outcome stick. The result is graded against the real paths.',
  },
  {
    feature: 'Week-by-week supply chart and numbers',
    principle: 'Quantitative intuition',
    why: 'Comics explain the what and the why well; the chart adds the how much (the cost of waiting), which was a gap in the feedback.',
  },
  {
    feature: 'Chapters, progress rail, steps that stay visible',
    principle: 'Segmenting',
    why: 'Short, labelled chunks with constant orientation. This keeps the current walkthrough’s rule that nothing you have read disappears.',
  },
];

export default function Rationale() {
  return (
    <section className="rationale" id="why">
      <h2>Why a v2 of the guided walkthrough?</h2>
      <p className="lead">
        The current walkthrough already uses the right data. This prototype changes how it is shown. Every feature
        reuses the existing case JSON unchanged, so the same pattern scales to all 21 case files.
      </p>
      <div className="table-scroll">
        <table className="rationale-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>Learning principle</th>
              <th>Why it helps</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.feature}>
                <th scope="row">{r.feature}</th>
                <td>{r.principle}</td>
                <td>{r.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3>How this could be evaluated</h3>
      <p>
        Run an A/B comparison between walkthrough v1 and v2 on the same case. Measure a pre/post concept quiz, the
        accuracy of predictions, the time spent per step, and a short engagement scale like the one in the student
        feedback form.
      </p>
    </section>
  );
}
