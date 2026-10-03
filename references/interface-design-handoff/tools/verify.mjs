import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const slash = value => value.split(path.sep).join('/');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const readJson = relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8').replace(/^\uFEFF/, ''));
const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const full = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(full) : [slash(path.relative(root, full))];
});
const files = walk(root);
const present = new Set(files);
const manifest = readJson('manifest.json');
const origins = readJson('source-origins.json');
const failures = [];
const listed = new Set();

function localTarget(from, target) {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(target)) return null;
  const clean = decodeURIComponent(target.replace(/&amp;/g, '&').split(/[?#]/)[0]);
  if (!clean) return null;
  if (clean.startsWith('/') || /^[a-z]:/i.test(clean)) return '__absolute_local_path__';
  const resolved = path.resolve(root, path.dirname(from), clean);
  const relative = slash(path.relative(root, resolved));
  if (relative.startsWith('../') || path.isAbsolute(relative)) return '__outside_pack__';
  return relative;
}

assert(present.has('README.md'), 'Positive control requires the actual README');
assert.equal(localTarget('SESSION-PROMPT.md', 'README.md'), 'README.md');
assert(!present.has(localTarget('README.md', '__handoff_missing_control__.md')), 'Missing-link control failed');
const control = fs.readFileSync(path.join(root, 'README.md'));
assert.notEqual(hash(control), hash(Buffer.concat([control, Buffer.from('changed')])), 'Changed-byte control failed');
assert.equal(localTarget('README.md', '../outside.md'), '__outside_pack__');

for (const entry of manifest.files) {
  if (listed.has(entry.path)) failures.push('Duplicate manifest entry: ' + entry.path);
  listed.add(entry.path);
  if (!present.has(entry.path)) { failures.push('Missing file: ' + entry.path); continue; }
  const bytes = fs.readFileSync(path.join(root, entry.path));
  if (bytes.length !== entry.bytes || hash(bytes) !== entry.sha256) failures.push('Integrity mismatch: ' + entry.path);
}
for (const relative of files) {
  if (relative !== 'manifest.json' && !listed.has(relative)) failures.push('Unlisted file: ' + relative);
}
for (const entry of origins) {
  if (!present.has(entry.path)) { failures.push('Missing source copy: ' + entry.path); continue; }
  if (entry.mode === 'verbatim' && hash(fs.readFileSync(path.join(root, entry.path))) !== entry.sourceSha256) {
    failures.push('Source copy mismatch: ' + entry.path);
  }
}

let guideLinks = 0;
let galleryLinks = 0;
function checkLink(from, target, kind) {
  const local = localTarget(from, target);
  if (local === null) return;
  if (kind === 'guide') guideLinks++; else galleryLinks++;
  if (!present.has(local)) failures.push('Missing local target: ' + from + ' -> ' + target);
}
for (const relative of files) {
  if (relative.endsWith('.md') && (!relative.includes('/') || relative.startsWith('skills/'))) {
    const content = fs.readFileSync(path.join(root, relative), 'utf8').replace(/```[\s\S]*?```/g, '');
    for (const match of content.matchAll(/\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
      checkLink(relative, match[1], 'guide');
    }
  }
  if (relative.startsWith('visual-reference/') && /\.(html|css)$/.test(relative)) {
    const content = fs.readFileSync(path.join(root, relative), 'utf8');
    if (relative.endsWith('.html')) {
      for (const match of content.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/g)) {
        checkLink(relative, match[1], 'gallery');
      }
    }
    for (const match of content.matchAll(/url\(\s*["']?([^\s)'"<>]+)["']?\s*\)/g)) {
      checkLink(relative, match[1], 'gallery');
    }
  }
}
const result = {
  command: 'node tools/verify.mjs',
  controls: 'README present; fabricated local target missing; changed bytes detected; path escape detected',
  filesChecked: manifest.files.length,
  sourceCopiesAndExcerpts: origins.length,
  authoredGuideAndSkillLinksChecked: guideLinks,
  galleryLocalReferencesChecked: galleryLinks,
  failures,
  scope: 'Package hashes, source-copy fidelity, guide/skill local links, gallery static asset references. No browser or application tests.'
};
console.log(JSON.stringify(result, null, 2));
process.exitCode = failures.length ? 1 : 0;
