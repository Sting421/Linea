import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config';

// Every Tailwind utility family whose numeric keys come from theme('spacing').
// Closed list on purpose: an unlisted prefix is ignored, so this guard misses
// rather than false-alarms. Families on their own scales (leading, z, border,
// rounded, text, tracking, order, opacity, duration, grid-cols, col-span) are
// excluded because a spacing lookup would judge them wrongly.
const SPACING_PREFIXES = [
  'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml', 'ms', 'me',
  'p', 'px', 'py', 'pt', 'pr', 'pb', 'pl', 'ps', 'pe',
  'gap', 'gap-x', 'gap-y',
  'space-x', 'space-y',
  'w', 'h', 'size',
  'min-w', 'min-h', 'max-w', 'max-h',
  'top', 'right', 'bottom', 'left', 'start', 'end',
  'inset', 'inset-x', 'inset-y',
  'translate-x', 'translate-y',
  'scroll-m', 'scroll-mx', 'scroll-my', 'scroll-mt', 'scroll-mr', 'scroll-mb', 'scroll-ml',
  'scroll-p', 'scroll-px', 'scroll-py', 'scroll-pt', 'scroll-pr', 'scroll-pb', 'scroll-pl',
  'indent', 'basis',
];

// Longest first, so `gap-x` wins over `gap` and `min-w` over `m`.
const MATCH_ORDER = [...SPACING_PREFIXES].sort((a, b) => b.length - a.length);

// vitest runs from the project root, so this resolves to app/ regardless of
// where inside app/ this file sits.
const PROJECT_ROOT = process.cwd();
const APP_DIR = path.join(PROJECT_ROOT, 'app');

const sourceFiles = (dir: string, found: string[] = []): string[] => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) sourceFiles(full, found);
    else if (/\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) found.push(full);
  }
  return found;
};

// `lg:w-68` -> `w-68`, `[&:hover]:mt-4` -> `mt-4` (the final colon is the variant
// separator in both), `!mt-4` -> `mt-4`, `-mt-4` -> `mt-4`.
const stripModifiers = (token: string): string => {
  let bare = token.slice(token.lastIndexOf(':') + 1);
  if (bare.startsWith('!')) bare = bare.slice(1);
  if (bare.startsWith('-')) bare = bare.slice(1);
  return bare;
};

const spacingKeyOf = (token: string): string | null => {
  const bare = stripModifiers(token);
  const prefix = MATCH_ORDER.find((candidate) => bare.startsWith(`${candidate}-`));
  if (!prefix) return null;

  const key = bare.slice(prefix.length + 1);
  // Bare numbers only. Arbitrary values (`w-[526px]`), fractions (`w-1/2`) and
  // keywords (`min-h-screen`) are all valid without being spacing keys.
  return /^\d+(\.\d+)?$/.test(key) ? key : null;
};

describe('spacing scale', () => {
  it('has no class referencing a spacing key that does not exist', () => {
    // The cast is only needed because tailwind.config.ts declares `darkMode: ''`,
    // which does not satisfy Tailwind's own Config type. Pre-existing, and it does
    // not affect the spacing scale.
    const config = tailwindConfig as unknown as Parameters<typeof resolveConfig>[0];
    const scale = resolveConfig(config).theme.spacing as Record<string, string>;
    const offenders: string[] = [];

    for (const file of sourceFiles(APP_DIR)) {
      const relative = path.relative(PROJECT_ROOT, file).replace(/\\/g, '/');

      fs.readFileSync(file, 'utf8')
        .split(/\r?\n/)
        .forEach((line, index) => {
          for (const token of line.split(/[\s"'`{}()<>,;=]+/)) {
            if (!token) continue;
            const key = spacingKeyOf(token);
            if (key !== null && scale[key] === undefined) {
              offenders.push(`${token} — ${relative}:${index + 1}`);
            }
          }
        });
    }

    expect(offenders.join('\n')).toBe('');
  });

  // Guards the guard: if the prefix matching or the token stripping breaks, the
  // assertion above passes vacuously.
  it('recognises the spacing keys that are in use', () => {
    expect(spacingKeyOf('mt-15')).toBe('15');
    expect(spacingKeyOf('lg:w-68')).toBe('68');
    expect(spacingKeyOf('space-x-29')).toBe('29');
    expect(spacingKeyOf('!-mt-4')).toBe('4');
    expect(spacingKeyOf('[&:hover]:gap-x-2.5')).toBe('2.5');
    expect(spacingKeyOf('gap-12.1')).toBe('12.1');
    expect(spacingKeyOf('min-h-0')).toBe('0');
  });

  it('ignores classes that are not spacing lookups', () => {
    expect(spacingKeyOf('w-[526px]')).toBeNull();
    expect(spacingKeyOf('w-1/2')).toBeNull();
    expect(spacingKeyOf('min-h-screen')).toBeNull();
    expect(spacingKeyOf('basis-3/5')).toBeNull();
    expect(spacingKeyOf('grid-cols-2')).toBeNull();
    expect(spacingKeyOf('leading-6')).toBeNull();
    expect(spacingKeyOf('z-50')).toBeNull();
    expect(spacingKeyOf('text-2xl')).toBeNull();
    expect(spacingKeyOf('shadow-500')).toBeNull();
  });
});
