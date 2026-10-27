import { useEffect, useMemo, useRef, useState } from 'react';
import caseData from './data/fib001.json';
import { chapters, steps } from './data/story.js';
import { PATHS, simulate } from './lib/simulate.js';
import FlowMap from './components/FlowMap.jsx';
import ComicPanel from './components/ComicPanel.jsx';
import StepBody from './components/StepBody.jsx';
import Rationale from './components/Rationale.jsx';

const allDecisions = caseData.decision_blocks.flatMap((b) => b.decisions);
const decisionsById = Object.fromEntries(allDecisions.map((d) => [d.decision_no, d]));
const companyDecisions = caseData.decision_blocks[0].decisions;

export default function App() {
  const [active, setActive] = useState(0);
  const [picks, setPicks] = useState([]);
  const [you, setYou] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const stepRefs = useRef([]);

  const baseline = useMemo(
    () => ({
      nokia: simulate(PATHS.nokia, decisionsById),
      ericsson: simulate(PATHS.ericsson, decisionsById),
    }),
    [],
  );
  const results = { you, ...baseline };

  // The last step whose top has passed 45% of the viewport drives the sticky stage.
  // Measured on scroll (rAF-throttled) so tall steps and fast jumps never skip a scene.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.45;
      let current = 0;
      stepRefs.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= line) current = i;
      });
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const goTo = (id) => {
    const i = steps.findIndex((s) => s.id === id || s.chapter === id);
    stepRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const ctx = {
    decisionsById,
    companyDecisions,
    picks,
    setPicks,
    results,
    prediction,
    setPrediction,
    goTo,
    run: () => setYou(simulate(picks, decisionsById)),
    reset: () => {
      setYou(null);
      setPicks([]);
    },
  };

  const step = steps[active];
  const chapterIndex = chapters.findIndex((c) => c.id === step.chapter);

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-mark">FIB</span>
            <span>
              <b>Case {caseData.id}</b> <span className="muted">· Guided walkthrough v2 (prototype)</span>
            </span>
          </div>
          <a className="why-link" href="#why">Why v2?</a>
        </div>
        <nav className="rail" aria-label="Chapters">
          {chapters.map((c, i) => (
            <button
              key={c.id}
              className={`rail-item ${i < chapterIndex ? 'done' : ''} ${i === chapterIndex ? 'current' : ''}`}
              aria-current={i === chapterIndex ? 'step' : undefined}
              onClick={() => goTo(c.id)}
            >
              <span className="rail-dot">{i < chapterIndex ? '✓' : i + 1}</span>
              <span className="rail-label">{c.title}</span>
            </button>
          ))}
        </nav>
        <div className="progress" aria-hidden="true">
          <span style={{ width: `${((active + 1) / steps.length) * 100}%` }} />
        </div>
      </header>

      <section className="hero">
        <div className="hero-meta">
          <span className="pill">{caseData.industry}</span>
          <span className="pill disruption">{caseData.nature}</span>
        </div>
        <h1>{caseData.name}</h1>
        <p className="hero-sub">{caseData.brand_group}</p>
        <p className="muted">{caseData.scale}</p>
        <ul className="how">
          <li><b>Scroll the story.</b> The map and the comic panel on the right follow you step by step.</li>
          <li><b>Watch the system.</b> Chips flow, the disruption spreads, then the chain reroutes.</li>
          <li><b>Make the call.</b> Run your own strategy before you see what Nokia and Ericsson did.</li>
        </ul>
        <button className="btn primary" onClick={() => goTo('flow')}>Start the walkthrough ↓</button>
      </section>

      <main className="story">
        <div className="steps">
          {steps.map((s, i) => (
            <article
              key={s.id}
              id={s.id}
              ref={(el) => (stepRefs.current[i] = el)}
              data-index={i}
              className={`step kind-${s.kind} ${i === active ? 'is-active' : ''}`}
            >
              <div className="step-meta">
                <span className="kicker">{s.kicker}</span>
                <span className="muted">Step {i + 1} of {steps.length}</span>
              </div>
              <h2>{s.heading}</h2>
              <div className="only-mobile">
                <ComicPanel panel={s.panel} caption={s.heading} compact />
              </div>
              <p className="lead">{s.lead}</p>
              {s.stat && (
                <div className="stat">
                  <span className="stat-value">{s.stat.value}</span>
                  <span className="stat-label">{s.stat.label}</span>
                </div>
              )}
              <StepBody step={s} caseData={caseData} ctx={ctx} />
            </article>
          ))}
        </div>

        <aside className="stage" aria-label="Live view">
          <FlowMap sceneId={step.scene} caseData={caseData} />
          <div className="only-desktop">
            <ComicPanel panel={step.panel} caption={step.heading} />
          </div>
        </aside>
      </main>

      <Rationale />

      <footer className="footer">
        Case data and comic panels: Future Industry in a Box (learn-supply-chain.vercel.app). The flow map, the
        simulator and the scrollytelling layout are a prototype by Nevil Sandeep.
      </footer>
    </>
  );
}
