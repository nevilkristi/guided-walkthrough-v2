// Pulls one case object out of the live site's single-file bundle so the
// prototype runs on exactly the same data as the production walkthrough.
//
//   curl -sL https://learn-supply-chain.vercel.app/ -o site.html
//   node scripts/extract-case.mjs site.html FIB-001 src/data/fib001.json
import fs from 'node:fs';

const [, , src, id = 'FIB-001', out = `src/data/${id.toLowerCase().replace('-', '')}.json`] = process.argv;
if (!src) {
  console.error('usage: node scripts/extract-case.mjs <site.html> [CASE-ID] [out.json]');
  process.exit(1);
}

const html = fs.readFileSync(src, 'utf8');
const match = html.match(/JSON\.parse\(`(\[\{"id":"FIB-[\s\S]*?\}\])`\)/);
if (!match) {
  console.error('Case data block not found in bundle.');
  process.exit(1);
}

// The data sits inside a template literal, so undo template-literal escaping.
const raw = match[1].replace(/\\`/g, '`').replace(/\\\$/g, '$').replace(/\\\\/g, '\\');
const cases = JSON.parse(raw);
const found = cases.find((c) => c.id === id);
if (!found) {
  console.error(`${id} not found. Available: ${cases.map((c) => c.id).join(', ')}`);
  process.exit(1);
}

fs.writeFileSync(out, JSON.stringify(found, null, 2) + '\n');
console.log(`Wrote ${out} (${cases.length} cases in bundle)`);
