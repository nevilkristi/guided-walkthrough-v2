# Guided Walkthrough v2 (prototype) for FIB-001

A next step for the *Future Industry in a Box* guided walkthrough, built on the Philips Albuquerque fire case (Nokia vs Ericsson).

- **Live flow map**: the supply chain as an animated network, which changes scene as you scroll (normal → fire → ripple → reroute → fallout).
- **Comic panels in sync**: each step shows its matching panel from the existing comic.
- **Predict + decision simulator**: commit to a prediction and a strategy, then compare your 26-week outcome with the real Nokia and Ericsson paths.
- **Same data**: `src/data/fib001.json` is copied unchanged from the production bundle, using `scripts/extract-case.mjs`.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

`src/data/story.js` is the only case-specific layer: step → chapter, comic panel and map scene. The simulator's shares and ramp times in `src/lib/simulate.js` are teaching assumptions, calibrated to the reported outcomes.
