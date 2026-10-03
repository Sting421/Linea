import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import StatusDonut, { DISPLAY_ORDER, DONUT_SIZE, StatusCounts, statusView } from './index';
import { statusToHex } from '~/utils/status';

const counts = (overrides: Partial<StatusCounts> = {}): StatusCounts => ({
  normal: 96,
  warning: 7,
  offline: 4,
  fault: 3,
  anomaly: 2,
  ...overrides,
});

const ZERO = { normal: 0, warning: 0, offline: 0, fault: 0, anomaly: 0 };

const view = (over: Partial<StatusCounts> = {}, unavailable = 0, populationLabel = 'plants') =>
  statusView(counts(over), { unavailable, populationLabel });

describe('statusView', () => {
  it('lists one slice per canonical status in display order, in the token colours', () => {
    const { slices } = view();

    expect(DISPLAY_ORDER).toEqual(['normal', 'warning', 'offline', 'fault', 'anomaly']);
    expect(slices.map((slice) => slice.key)).toEqual(['normal', 'warning', 'offline', 'fault', 'anomaly']);
    for (const slice of slices) expect(slice.color).toBe(statusToHex(slice.key as (typeof DISPLAY_ORDER)[number]));
  });

  it('keeps a slice for a status with nothing in it, so anomaly is shown at zero', () => {
    const { slices } = view({ anomaly: 0, offline: 0 });

    expect(slices.map((slice) => slice.key)).toEqual(DISPLAY_ORDER);
    expect(slices.find((slice) => slice.key === 'anomaly')?.value).toBe(0);
  });

  it('puts the countable total at the centre and the population words under it', () => {
    expect(view().centre).toBe('112');
    expect(view().caption).toBe('plants');
    expect(view({}, 0, 'in the fleet').caption).toBe('in the fleet');
  });

  it('qualifies the caption with the population when some plants have no status', () => {
    expect(view({}, 9, 'in the fleet').caption).toBe('of 121 in the fleet');
    expect(view({}, 9).caption).toBe('of 121 plants');
  });

  it('formats a legend figure as the bare number, a zero as 0', () => {
    expect(view().legendValue('fault')).toBe('3');
    expect(view({ anomaly: 0 }).legendValue('anomaly')).toBe('0');
    expect(view({ normal: 1845 }).legendValue('normal')).toBe('1,845');
  });

  it('reads a hovered status into the centre as its count and its name', () => {
    expect(view().centreFor('fault')).toEqual({ value: '3', caption: 'Fault' });
    expect(view({ anomaly: 0 }).centreFor('anomaly')).toEqual({ value: '0', caption: 'Anomaly' });
  });

  it('reads nothing into the centre for no status, or for a key that is not one', () => {
    expect(view().centreFor(null)).toBeNull();
    expect(view().centreFor('unknown')).toBeNull();
  });
});

describe('StatusDonut component', () => {
  it('renders all five statuses with labels, counts, and the fleet total', () => {
    const html = renderToStaticMarkup(<StatusDonut counts={counts()} />);
    for (const key of DISPLAY_ORDER) {
      expect(html).toContain(key.charAt(0).toUpperCase() + key.slice(1));
    }
    expect(html).toContain('>96<');
    expect(html).toContain('>112<');
    expect(html).toContain('plants');
  });

  it('keeps all five legend rows, with a zero read as 0 and no disabled look', () => {
    const html = renderToStaticMarkup(<StatusDonut counts={counts({ anomaly: 0, offline: 0 })} />);

    expect(html).toContain('Anomaly');
    expect(html).toContain('Offline');
    expect(html.match(/role="listitem"/g)).toHaveLength(5);
    expect(html.match(/>0</g)).toHaveLength(2);
    expect(html).not.toContain('opacity-[0.38]');
  });

  it('renders the empty state at zero total', () => {
    const html = renderToStaticMarkup(<StatusDonut counts={counts(ZERO)} />);
    expect(html).toContain('No data');
    expect(html).not.toContain('aria-label="Status breakdown donut"');
  });

  it('qualifies the centre with the population when some entities have no status', () => {
    const html = renderToStaticMarkup(<StatusDonut counts={counts()} unavailable={9} />);
    expect(html).toContain('>112<');
    expect(html).toContain('of 121 plants');
  });

  it('gives the excluded count its own row, with its hint', () => {
    const html = renderToStaticMarkup(<StatusDonut counts={counts()} unavailable={9} />);
    expect(html).toContain('No status');
    expect(html).toContain('>9<');
    expect(html.match(/role="tooltip"/g)).toHaveLength(1);
  });

  it('says nothing at all when every entity has a status', () => {
    const html = renderToStaticMarkup(<StatusDonut counts={counts()} />);
    expect(html).not.toContain('No status');
    expect(html).not.toContain('of 112 plants');
    expect(html).not.toContain('role="tooltip"');
    expect(html).toContain('>112<');
  });

  describe('with its own words for what it counts', () => {
    const words = { populationLabel: 'in the fleet' };

    it('names the population when some plants have no status', () => {
      const html = renderToStaticMarkup(<StatusDonut counts={counts()} unavailable={9} {...words} />);

      expect(html).toContain('>112<');
      expect(html).toContain('of 121 in the fleet');
      expect(html).not.toContain('of 121 plants');
    });

    it('names the population alone when every plant has a status', () => {
      const html = renderToStaticMarkup(<StatusDonut counts={counts()} {...words} />);

      expect(html).toContain('>112<');
      expect(html).toContain('in the fleet');
      expect(html).not.toContain('of 112');
    });

    it('keeps the entity label on the no status row and its hint', () => {
      const html = renderToStaticMarkup(<StatusDonut counts={counts()} unavailable={9} {...words} />);

      expect(html).toContain('9 plants have no status');
    });
  });

  it('is the house card, with its edge from the shadow and its title in the card header face', () => {
    const html = renderToStaticMarkup(<StatusDonut counts={counts()} title="Fleet Status" />);

    expect(html).toContain('rounded-[14px] bg-white px-[1.125rem] py-5 shadow-500');
    expect(html).toContain('truncate text-lg font-semibold leading-6 text-hue-sky-900');
    expect(html).not.toMatch(/class="[^"]*font-display[^"]*\bborder\b/);
    expect(html).not.toContain('max-w-[480px]');
  });
});

describe('the Fleet Status donut as a readout, the way the Overview donuts are', () => {
  const source = readFileSync('app/components/StatusDonut/index.tsx', 'utf8').split(String.fromCharCode(13)).join('');
  const html = renderToStaticMarkup(
    <StatusDonut counts={counts()} unavailable={9} title="Fleet Status" help="Every plant, grouped by status." />,
  );

  it('draws the ring with the gradient, the outline, the entrance and the centre swap, each as its own prop', () => {
    for (const prop of [
      'hovered={hovered}',
      'gradient',
      'faded={0}',
      'entrance',
      'outline',
      'focusCentre={view.centreFor(hovered)}',
    ]) {
      expect(source).toContain(`            ${prop}\n`);
    }
  });

  it('puts the legend in its panel below the ring', () => {
    expect(source.indexOf('<Donut')).toBeLessThan(source.indexOf('<LegendPanel'));
    expect(source.indexOf('<LegendPanel')).toBeLessThan(source.indexOf('<ChartLegend'));
    expect(html.indexOf('role="group"')).toBeLessThan(html.indexOf('bg-hue-ink-50'));
  });

  it('offers no filter control, and nothing in the card is pressable but the two hints', () => {
    expect(html).not.toContain('Clear filter');
    expect(html).not.toContain('Filter by status');
    expect(html).not.toContain('aria-pressed');
    expect(html).not.toContain('role="button"');
    expect(html).not.toContain('tabindex');
    expect(html.match(/<button/g)).toHaveLength(2);
  });

  it('carries its help in the title row, as every other chart card does', () => {
    const noHelp = renderToStaticMarkup(<StatusDonut counts={counts()} title="Fleet Status" />);

    expect(html).toContain('About Fleet Status');
    expect(html).toContain('Every plant, grouped by status.');
    expect(noHelp).not.toContain('About Fleet Status');
    expect(html.indexOf('About Fleet Status')).toBeLessThan(html.indexOf('role="group"'));
  });

  it('lets the card size the ring from its own width, by container query', () => {
    expect(DONUT_SIZE).toBe('size-48 [@container(min-width:_340px)]:size-52');
    expect(html).toContain(DONUT_SIZE);
    expect(html).toContain('flex flex-1 items-center justify-center py-1');
    expect(html).toContain('mx-auto mt-3 w-full max-w-sm');
    expect(html).not.toContain('width="172"');
    expect(html).toContain('size-full');
  });

  it('reads the status under the pointer, in the centre, through the ring and the legend alike', () => {
    expect(source).toContain('onHover={(key) => setHovered(isStatus(key) ? key : null)}');
    expect(source).toContain('onFocus={(key) => setHovered(isStatus(key) ? key : null)}');
    expect(source).toContain('focused={hovered}');
  });

  it('lays the legend in two columns once the card is wide enough for them, and in one again when it sits beside the ring', () => {
    expect(html).toContain(
      'grid grid-cols-1 gap-x-6 gap-y-1 [@container(min-width:_300px)]:grid-cols-2 [@container(min-width:_440px)]:grid-cols-1',
    );
  });

  it('sets the ring and the legend side by side from a wide card, so a wide card is not a tall one', () => {
    expect(html).toContain('[@container(min-width:_440px)]:flex-row');
    expect(html).toContain('[@container(min-width:_440px)]:flex-1');
    expect(html).toContain('[@container(min-width:_440px)]:max-w-xs');
    expect(html).toContain('[@container(min-width:_440px)]:flex-none');
  });
});
