import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import PreviewCard, { previewCardDelta, previewCardMode, previewCardNote } from './index';

const countOf = (haystack: string, needle: string) => haystack.split(needle).length - 1;

describe('previewCardMode', () => {
  it('resolves a present value', () => {
    expect(previewCardMode('live', 49.98)).toBe('value');
    expect(previewCardMode('live', '$1,284')).toBe('value');
  });

  // zero is data, not absence - the single most important line of the resolver
  it('treats zero as a value, not empty', () => {
    expect(previewCardMode('live', 0)).toBe('value');
  });

  it('resolves absent values to empty', () => {
    expect(previewCardMode('live', null)).toBe('empty');
    expect(previewCardMode('live', undefined)).toBe('empty');
    expect(previewCardMode('live', '')).toBe('empty');
  });

  it('lets placeholder win over a stray value', () => {
    expect(previewCardMode('placeholder', 1284)).toBe('placeholder');
  });
});

describe('previewCardNote', () => {
  it('notes the placeholder and empty modes and nothing in value mode', () => {
    expect(previewCardNote('placeholder', 'No data yet')).toBe('Not yet available');
    expect(previewCardNote('empty', 'No events in range')).toBe('No events in range');
    expect(previewCardNote('value', 'No data yet')).toBeNull();
  });
});

describe('previewCardDelta', () => {
  it('formats an upward delta as good', () => {
    expect(previewCardDelta(4.2)).toEqual({ text: '↑ 4.2%', good: true });
  });

  it('formats a downward delta as bad, dropping the sign from the text', () => {
    expect(previewCardDelta(-4.2)).toEqual({ text: '↓ 4.2%', good: false });
  });

  // zero counts as up/good, matching StatTile's `delta >= 0`
  it('treats zero as up', () => {
    expect(previewCardDelta(0)).toEqual({ text: '↑ 0%', good: true });
  });

  // for metrics where falling is the win (outages, curtailment, cost)
  it('inverts good/bad without changing the arrow direction', () => {
    expect(previewCardDelta(4.2, true)).toEqual({ text: '↑ 4.2%', good: false });
    expect(previewCardDelta(-4.2, true)).toEqual({ text: '↓ 4.2%', good: true });
  });

  it('renders nothing for absent or non-finite deltas', () => {
    expect(previewCardDelta(null)).toBeNull();
    expect(previewCardDelta(undefined)).toBeNull();
    expect(previewCardDelta(Number.NaN)).toBeNull();
  });
});

describe('PreviewCard delta chip', () => {
  it('renders an up chip on the good token pair', () => {
    const html = renderToStaticMarkup(<PreviewCard title="Estimated savings" value="$1,284" delta={4.2} />);
    expect(html).toContain('↑ 4.2%');
    expect(html).toContain('bg-hue-green-50 text-hue-green-700');
  });

  it('renders a down chip on the bad token pair', () => {
    const html = renderToStaticMarkup(<PreviewCard title="Estimated savings" value="$1,284" delta={-4.2} />);
    expect(html).toContain('↓ 4.2%');
    expect(html).toContain('bg-hue-red-50 text-hue-red-700');
  });

  it('honours invertDelta for metrics where down is the win', () => {
    const html = renderToStaticMarkup(<PreviewCard title="Outages" value={3} delta={-20} invertDelta />);
    expect(html).toContain('↓ 20%');
    expect(html).toContain('bg-hue-green-50 text-hue-green-700');
  });

  // a delta beside an em dash is meaningless - it is derived from data that isn't there
  it('suppresses the chip outside value mode', () => {
    const empty = renderToStaticMarkup(<PreviewCard title="Events" value={null} delta={4.2} />);
    const placeholder = renderToStaticMarkup(<PreviewCard title="Financial" state="placeholder" delta={4.2} />);
    expect(empty).not.toContain('4.2%');
    expect(placeholder).not.toContain('4.2%');
  });

  it('renders no chip when no delta is supplied', () => {
    const html = renderToStaticMarkup(<PreviewCard title="Grid condition" value={49.98} />);
    expect(html).not.toContain('rounded-full px-[9px]');
  });
});

describe('PreviewCard rendering', () => {
  it('renders the headline value and unit in live mode', () => {
    const html = renderToStaticMarkup(
      <PreviewCard title="Grid condition" value={49.98} unit="Hz" href="/grid" caption="Rolling 24h" />,
    );
    expect(html).toContain('49.98');
    expect(html).toContain('Hz');
    expect(html).toContain('Rolling 24h');
    expect(html).not.toContain('\u2014');
  });

  // a large standalone figure uses the font's proportional numerals - tabular gives every
  // digit the width of a zero, which reads loose at display sizes. Both DS templates
  // (StatTile, EvolvedStatBox) set tabular on the delta chip only, never on the value.
  it('sets proportional numerals on the headline and tabular only on the delta chip', () => {
    const plain = renderToStaticMarkup(<PreviewCard title="Grid condition" value={121} unit="Hz" />);
    expect(plain).not.toContain('tabular-nums');

    const withDelta = renderToStaticMarkup(<PreviewCard title="Grid condition" value={121} unit="Hz" delta={4.2} />);
    expect(countOf(withDelta, 'tabular-nums')).toBe(1);
  });

  it('says the empty label in words and draws no stand-in figure when live data is absent', () => {
    const html = renderToStaticMarkup(<PreviewCard title="Grid condition" value={null} href="/grid" />);
    expect(html).not.toContain('\u2014');
    expect(html).not.toContain('text-display-xl');
    expect(html).toContain('No data yet');
    expect(html).toContain('M3 3v18h18');
  });

  it('accepts a domain-specific empty label', () => {
    const html = renderToStaticMarkup(
      <PreviewCard title="Events" value={null} href="/events" emptyLabel="No events in range" />,
    );
    expect(html).toContain('No events in range');
    expect(html).not.toContain('No data yet');
  });

  it('renders the placeholder on the same solid card and suppresses a stray value', () => {
    const html = renderToStaticMarkup(
      <PreviewCard title="Financial impact" state="placeholder" value={1284} href="/financial" />,
    );
    expect(html).not.toContain('border-dashed');
    expect(html).toContain('bg-white');
    expect(html).toContain('Not yet available');
    expect(html).not.toContain('\u2014');
    expect(html).not.toContain('1284');
  });

  it('is the house card in every mode, with its edge from the shadow and not from a border', () => {
    const modes = [
      <PreviewCard key="v" title="Grid share" value={1} />,
      <PreviewCard key="e" title="Grid share" value={null} />,
      <PreviewCard key="p" title="Grid share" state="placeholder" />,
    ];

    for (const card of modes) {
      const html = renderToStaticMarkup(card);

      expect(html).toContain('rounded-[14px] bg-white px-[1.125rem] py-5 shadow-500');
      expect(html).not.toContain('border-dashed');
      expect(html).not.toContain('bg-hue-ink-50');
      expect(html).not.toMatch(/class="[^"]*\bborder\b[^"]*shadow-500/);
    }
  });

  it('heads the card with a one line title in the card header face and colour', () => {
    const html = renderToStaticMarkup(<PreviewCard title="Grid share" value={1} />);

    expect(html).toContain('truncate font-display text-lg font-semibold leading-6 text-hue-sky-900');
  });

  it('truncates a linked title on the anchor, since ellipsis does nothing on an inline span inside it', () => {
    const html = renderToStaticMarkup(<PreviewCard title="Grid share" value={1} href="/grid" />);

    expect(html).toMatch(/<a [^>]*class="-mx-1 min-w-0 truncate [^"]*"/);
    expect(html).not.toMatch(/<span class="truncate/);
    expect(html).toContain('font-display text-lg font-semibold leading-6 text-hue-sky-900');
  });
});

describe('PreviewCard deep-link', () => {
  // the title and the arrow are two separate hit areas so the dead space between them
  // is NOT clickable - but only ONE of them is exposed to assistive tech and the
  // keyboard, so the card is still announced as a single link with a single tab stop
  it('renders two hit areas but only one accessible link', () => {
    const html = renderToStaticMarkup(<PreviewCard title="Grid condition" value={49.98} href="/grid" />);
    expect(countOf(html, '<a ')).toBe(2);
    expect(countOf(html, 'href="/grid"')).toBe(2);
    expect(html).toContain('aria-label="View Grid condition"');
    expect(html).toContain('focus-visible:outline-hue-sky-500');
    // the arrow duplicate is decorative: hidden from AT, removed from the tab order
    expect(countOf(html, 'aria-hidden="true" tabindex="-1"')).toBe(1);
    expect(countOf(html, 'aria-label=')).toBe(1);
  });

  it('accepts an explicit link label', () => {
    const html = renderToStaticMarkup(
      <PreviewCard title="Events" value={12} href="/events" linkLabel="View all fleet events" />,
    );
    expect(html).toContain('aria-label="View all fleet events"');
  });

  // a disabled deep-link must not be a focusable dead control
  it('renders no anchor, no arrow and no pill at all when href is absent', () => {
    const html = renderToStaticMarkup(<PreviewCard title="Grid condition" value={49.98} />);
    expect(html).not.toContain('<a ');
    expect(html).not.toContain('href=');
    expect(html).not.toContain('tabindex');
    expect(html).not.toContain('aria-disabled');
    expect(html).not.toContain('<svg');
    expect(html).not.toContain('rounded-full bg-hue-sky-50');
    expect(html).not.toMatch(/Coming|Area \d/);
  });

  it('treats an empty href string as disabled', () => {
    const html = renderToStaticMarkup(<PreviewCard title="Grid condition" value={49.98} href="" />);
    expect(html).not.toContain('<a ');
    expect(html).not.toContain('Coming');
  });

  it('shows exactly one note for a placeholder with no link', () => {
    const html = renderToStaticMarkup(<PreviewCard title="Financial impact" state="placeholder" />);
    expect(countOf(html, 'Not yet available')).toBe(1);
    expect(html).not.toContain('Coming');
  });

  it('renders without a router context', () => {
    expect(() => renderToStaticMarkup(<PreviewCard title="Grid condition" href="/grid" />)).not.toThrow();
  });
});

describe('PreviewCard sparkline slot', () => {
  const spark = <span>SPARKMARK</span>;

  // slot occupancy and state are independent axes - all four combinations must render
  it('renders the slot in a fixed-height container in live mode', () => {
    const html = renderToStaticMarkup(<PreviewCard title="Grid condition" value={49.98} sparkline={spark} />);
    expect(html).toContain('SPARKMARK');
    expect(html).toContain('-mx-0.5 h-14 min-w-0 overflow-hidden');
  });

  // the container must CLIP, not merely size - oversized injected content otherwise
  // overflows into the footer and breaks card-to-card uniformity
  it('clips oversized injected content to the fixed slot height', () => {
    const html = renderToStaticMarkup(
      <PreviewCard title="Grid condition" value={49.98} sparkline={<div className="h-96">tall</div>} />,
    );
    expect(html).toContain('-mx-0.5 h-14 min-w-0 overflow-hidden');
  });

  it('draws no sparkline outside value mode, where there is no figure for it to belong to', () => {
    const placeholder = renderToStaticMarkup(
      <PreviewCard title="Financial impact" state="placeholder" sparkline={spark} />,
    );
    const empty = renderToStaticMarkup(<PreviewCard title="Grid share" value={null} sparkline={spark} />);

    expect(placeholder).not.toContain('SPARKMARK');
    expect(empty).not.toContain('SPARKMARK');
  });

  it('renders live mode correctly with the slot empty', () => {
    const html = renderToStaticMarkup(<PreviewCard title="Grid condition" value={49.98} />);
    expect(html).toContain('49.98');
    expect(html).not.toContain('-mx-0.5 h-14 min-w-0 overflow-hidden');
  });

  it('renders placeholder mode correctly with the slot empty', () => {
    const html = renderToStaticMarkup(<PreviewCard title="Financial impact" state="placeholder" />);
    expect(html).not.toContain('border-dashed');
    expect(html).toContain('bg-white');
    expect(html).not.toContain('-mx-0.5 h-14 min-w-0 overflow-hidden');
  });
});

// Tailwind's content glob covers this file, so any bare class-name literal here is
// scanned and emitted as a real (but unused) utility. Build the strings at runtime so
// the assertions cannot leak dead CSS into the bundle.
const HOVER_GATE = ['[@media(hover:hover)', 'and', '(pointer:fine)]'].join('_');
const cardHover = (util: string) => [`${HOVER_GATE}:group-hover`, 'card:' + util].join('/');
const linkFocus = (util: string) => ['group-focus-within', 'link:' + util].join('/');

describe('PreviewCard conventions', () => {
  // the whole card is the hover target when it links; a disabled card stays inert
  it('scopes hover to the card and focus to the link, only when the card links somewhere', () => {
    const linked = renderToStaticMarkup(<PreviewCard title="Grid condition" value={1} href="/grid" />);
    const unlinked = renderToStaticMarkup(<PreviewCard title="Grid condition" value={1} />);
    expect(linked).toContain('group/card');
    expect(linked).toContain('group/link');
    expect(linked).toContain(cardHover('border-hue-sky-500'));
    expect(linked).toContain(linkFocus('border-hue-sky-500'));
    expect(unlinked).not.toContain('group/card');
    expect(unlinked).not.toContain(cardHover('border-hue-sky-500'));
  });

  // reduced motion drops the movement but KEEPS the colour change, which still
  // communicates the affordance - it is fewer and gentler animations, not zero
  it('drops only the movement under reduced motion', () => {
    const html = renderToStaticMarkup(<PreviewCard title="Grid condition" value={1} href="/grid" />);
    expect(html).toContain('motion-reduce:transform-none');
    expect(html).not.toContain('motion-reduce:transition-none');
  });

  // touch devices fire hover on tap; every hover cue is gated behind a real pointer,
  // so a tap never leaves a half-applied state (tinted title, no circle)
  it('gates every hover cue behind a fine pointer', () => {
    const html = renderToStaticMarkup(<PreviewCard title="Grid condition" value={1} href="/grid" />);
    for (const util of ['border-hue-sky-500', 'bg-hue-sky-50', 'translate-x-1', 'text-hue-sky-800']) {
      expect(html).toContain(cardHover(util));
    }
    expect(html).not.toMatch(/(?<!\)\]:)group-hover\/card/);
  });

  it('marks the arrow decorative, and draws it only on a card that links somewhere', () => {
    const linked = renderToStaticMarkup(<PreviewCard title="Grid condition" value={1} href="/grid" />);
    const unlinked = renderToStaticMarkup(<PreviewCard title="Grid condition" value={1} />);
    expect(linked).toContain('<svg viewBox="0 0 16 16"');
    expect(linked).toContain('aria-hidden="true"');
    expect(unlinked).not.toContain('<svg');
  });

  it('passes through className without a double space', () => {
    const html = renderToStaticMarkup(<PreviewCard title="Grid condition" value={1} className="col-span-2" />);
    expect(html).toContain('col-span-2');
    expect(html).not.toMatch(/class="[^"]*\s{2}/);
  });

  // tokens only - fails if anyone reintroduces an arbitrary hex like text-[#17222E]
  it('emits no hardcoded hex colors', () => {
    const html = renderToStaticMarkup(
      <PreviewCard
        title="Grid condition"
        value={49.98}
        unit="Hz"
        caption="Rolling 24h"
        href="/grid"
        sparkline={<span>x</span>}
      />,
    );
    expect(html).not.toMatch(/#[0-9A-Fa-f]{3,8}\b/);
  });
});

// The templates put the display face on the figure and leave the label in the inherited sans -
// StatTile at 38px/700, the Area 1 preview tile at 30px/700, and StatTile on the delta badge too.
// The label is a deliberate divergence: StatCard's heading went onto font-display earlier in this
// PBI's sibling, and two cards sitting in the same screen with different headings read as an
// oversight rather than a choice. The 2026-07-28 note recording the repo as declaring no fontFamily
// stopped being true when !1001 shipped font-display, and is negated in a1-work-items.md.
describe('PreviewCard display face', () => {
  it('sets it on the label and the figure', () => {
    const html = renderToStaticMarkup(<PreviewCard title="Grid share" value={27.6} unit="%" caption="of fleet supply" />);

    expect(countOf(html, 'font-display')).toBe(2);
  });

  it('sets it on the delta badge as well, which is where StatTile puts it', () => {
    const html = renderToStaticMarkup(<PreviewCard title="Grid share" value={27.6} unit="%" delta={4.2} />);

    expect(countOf(html, 'font-display')).toBe(3);
  });

  // the empty line sits where the figure sits and takes the display face with it
  it('keeps label and empty line on it in placeholder mode, where there is no delta', () => {
    const html = renderToStaticMarkup(<PreviewCard title="Financial impact" state="placeholder" />);

    expect(countOf(html, 'font-display')).toBe(2);
  });

  it('leaves the unit and caption in the inherited sans', () => {
    const html = renderToStaticMarkup(
      <PreviewCard title="Grid share" value={27.6} unit="%" caption="of fleet supply" />,
    );

    expect(countOf(html, 'font-display')).toBe(2);
  });
});

describe('PreviewCard figure, eyebrow and caption', () => {
  const full = (
    <PreviewCard
      title="Grid Share"
      value="18.4%"
      eyebrow="of fleet supply"
      caption="Today"
      sparkline={<span>SPARKMARK</span>}
    />
  );

  it('sets the figure on the display scale, with the percent inside it and no separate unit', () => {
    const html = renderToStaticMarkup(full);

    expect(html).toContain('font-display text-display-xl font-bold text-hue-ink-900">18.4%</span>');
    expect(html).not.toContain('text-[38px]');
  });

  it('puts the eyebrow in the display face, uppercase, under the figure and over the caption', () => {
    const html = renderToStaticMarkup(full);

    expect(html).toContain(
      'block font-display text-eyebrow font-semibold uppercase text-hue-ink-500">of fleet supply</span>',
    );
    expect(html.indexOf('18.4%')).toBeLessThan(html.indexOf('of fleet supply'));
    expect(html.indexOf('of fleet supply')).toBeLessThan(html.indexOf('>Today<'));
  });

  it('puts the caption in the body face at the floor of small text contrast', () => {
    const html = renderToStaticMarkup(full);

    expect(html).toContain('block text-label text-hue-ink-600">Today</span>');
    expect(html).not.toContain('text-hue-ink-500">Today');
  });

  it('draws an eyebrow only when it is given one', () => {
    const html = renderToStaticMarkup(<PreviewCard title="Grid Share" value="18.4%" caption="Today" />);

    expect(html).not.toContain('uppercase');
    expect(countOf(html, 'font-display')).toBe(2);
  });

  it('gives the figure only the width it needs, up to three fifths of the card, and the sparkline all the rest', () => {
    const html = renderToStaticMarkup(full);

    expect(html).toContain('grid flex-1 grid-cols-[fit-content(60%)_minmax(0,1fr)] items-center gap-x-4');
    expect(html).not.toContain('fit-content(50%)');
    expect(html).toContain('[@container(min-width:_560px)]:gap-x-8');
    expect(html).not.toContain('minmax(0,3fr)');
    expect(html).not.toContain('11fr');
    expect(countOf(html, 'text-display-xl')).toBe(1);
  });

  it('gives the sparkline a taller slot from a wide card, so a long line does not go flat', () => {
    const html = renderToStaticMarkup(full);

    expect(html).toContain('-mx-0.5 h-14 min-w-0 overflow-hidden [@container(min-width:_560px)]:h-16');
  });

  it('keeps the figure alone on the card when there is no sparkline to put beside it', () => {
    const html = renderToStaticMarkup(<PreviewCard title="Grid Share" value="18.4%" caption="Today" />);

    expect(html).toContain('flex flex-1 items-center');
    expect(html).not.toContain('grid-cols-[fit-content');
  });
});

describe('PreviewCard loading', () => {
  const loading = renderToStaticMarkup(<PreviewCard title="Grid Share" loading loadingLabel="Loading this range." />);

  it('marks the card busy and says so in words', () => {
    expect(loading).toContain('aria-busy="true"');
    expect(loading).toContain('Loading this range.');
    expect(renderToStaticMarkup(<PreviewCard title="Grid Share" value="1%" />)).not.toContain('aria-busy');
  });

  it('draws the eventual content as skeleton blocks in the geometry the loaded card takes', () => {
    expect(countOf(loading, 'motion-safe:animate-pulse')).toBe(3);
    expect(loading).toContain('h-10 w-28');
    expect(loading).toContain('h-[0.825rem] w-24');
    expect(loading).toContain('grid flex-1 grid-cols-[fit-content(60%)_minmax(0,1fr)]');
    expect(loading).toContain('-mx-0.5 h-14 min-w-0 overflow-hidden');
    expect(loading).toContain('bg-hue-ink-100');
  });

  it('hides every skeleton block from assistive tech and draws no fake figure', () => {
    expect(countOf(loading, 'aria-hidden="true"')).toBe(3);
    expect(loading).not.toContain('text-display-xl');
    expect(loading.replace(/<[^>]*>/g, '')).toBe('Grid ShareLoading this range.');
  });

  it('keeps the title row and the card shell, so only the body changes when the data lands', () => {
    expect(loading).toContain('>Grid Share<');
    expect(loading).toContain('rounded-[14px] bg-white px-[1.125rem] py-5 shadow-500');
  });

  it('draws neither the delta chip nor the empty note while loading', () => {
    const withValue = renderToStaticMarkup(<PreviewCard title="Grid Share" value="12%" delta={4.2} loading />);
    const without = renderToStaticMarkup(<PreviewCard title="Grid Share" value={null} loading />);

    expect(renderToStaticMarkup(<PreviewCard title="Grid Share" value="12%" delta={4.2} />)).toContain('4.2%');
    expect(withValue).not.toContain('4.2%');
    expect(withValue).not.toContain('>12%<');
    expect(without).not.toContain('No data yet');
  });

  it('stands the pulse down under reduced motion by drawing it only where motion is safe', () => {
    expect(loading).not.toMatch(/(?<!motion-safe:)animate-pulse/);
  });
});
