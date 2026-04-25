/**
 * Post-build script: copy docs/wiki and docs/presentation into dist/
 * so Vercel can serve them as static files alongside the SPA.
 */
const fs = require('fs');
const path = require('path');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`[copy-docs] source missing: ${src} — skipping`);
    return 0;
  }
  fs.mkdirSync(dest, { recursive: true });
  let count = 0;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      count += copyRecursive(s, d);
    } else {
      fs.copyFileSync(s, d);
      count += 1;
    }
  }
  return count;
}

const root = path.resolve(__dirname, '..');
const dist = path.resolve(__dirname, 'dist');

const wikiCount = copyRecursive(path.join(root, 'docs/wiki'), path.join(dist, 'wiki'));
const presCount = copyRecursive(path.join(root, 'docs/presentation'), path.join(dist, 'presentation'));

console.log(`[copy-docs] wrote ${wikiCount} wiki files and ${presCount} presentation files into dist/`);
