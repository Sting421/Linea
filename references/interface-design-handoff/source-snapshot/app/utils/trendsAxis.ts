import {
  addDays,
  addHours,
  addMonths,
  addYears,
  format,
  startOfDay,
  startOfHour,
  startOfMonth,
  startOfYear,
} from 'date-fns';
import type { Locale } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { formatChartValue, formatCompactValue } from './chartFormat';
import { CHART_BASELINE, CHART_CURSOR, CHART_GRID_DOT, CHART_TICK } from './chartColors';

export const AXIS_KEY = 't';

export const BUCKET_START = 'bucketStart' as const;

export type Bucketed<T> = T & { [BUCKET_START]?: number };

export const DAY_MS = 86400000;

export const TICK_COUNT = 6;

export const STACKED_CHART_HEIGHT = 260;

export const AXIS_GUTTER = 48;

export const AXIS_Y_WIDTH = 76;

export const STACK_MARGIN = { top: 16, right: 24, left: 24, bottom: 8 };

export const X_AXIS_STYLE = { stroke: CHART_BASELINE, tickLine: false, tickMargin: 6, tick: { fill: CHART_TICK } };

export const Y_AXIS_STYLE = { axisLine: false, tickLine: false, tick: { fill: CHART_TICK } };

export const BAR_GRID = { stroke: CHART_GRID_DOT, strokeDasharray: '1 4', strokeLinecap: 'round' as const };

export const BAR_CURSOR = { fill: CHART_CURSOR, radius: 8 };

export const TOOLTIP_OFFSET = 24;

export const periodShare = (rows: Record<string, unknown>[], axis: TrendsAxis | undefined) => {
  const domain = axis?.domain;
  const times = rows
    .map((row) => row[AXIS_KEY])
    .filter((t): t is number => typeof t === 'number' && Number.isFinite(t))
    .sort((a, b) => a - b);
  if (!domain || domain[1] <= domain[0] || times.length < 2) return 0;
  const gaps = times
    .slice(1)
    .map((t, index) => t - times[index])
    .sort((a, b) => a - b);
  return gaps[Math.floor(gaps.length / 2)] / (domain[1] - domain[0]);
};

type GridAxis = { xAxis?: { scale?: ((value: unknown) => number) & { step?: () => number; bandwidth?: () => number } } };

export const periodBoundaries =
  (rows: Record<string, unknown>[]) =>
  ({ xAxis }: GridAxis): number[] => {
    const scale = xAxis?.scale;
    if (!scale) return [];
    const xs = rows.map((row) => row[AXIS_KEY]).filter((t): t is number => Number.isFinite(t)).map((t) => scale(t));
    return xs.slice(1).map((x, index) => (xs[index] + x) / 2);
  };

export const bandBoundaries =
  (categories: unknown[]) =>
  ({ xAxis }: GridAxis): number[] => {
    const scale = xAxis?.scale;
    if (!scale || !scale.step || !scale.bandwidth) return [];
    const gap = (scale.step() - scale.bandwidth()) / 2;
    return categories.slice(1).map((category) => scale(category) - gap);
  };

export const unitTick = (unit: string) => (value: number) => `${formatCompactValue(value)} ${unit}`;

const scaledTick =
  (units: readonly [string, string, string]) =>
  (peak = 0) => {
    const step = Math.abs(peak) >= 1_000_000 ? 2 : Math.abs(peak) >= 1_000 ? 1 : 0;
    return (value: number) => `${formatChartValue(value / 1_000 ** step)} ${units[step]}`;
  };

export const energyTick = scaledTick(['kWh', 'MWh', 'GWh']);

export const powerTick = scaledTick(['kW', 'MW', 'GW']);

export const X_AXIS_HEIGHT = 30;

export const TRENDS_CHART_HEIGHT = STACKED_CHART_HEIGHT + AXIS_GUTTER;

export type TickUnit = 'hour' | 'day' | 'month' | 'year';

export type TrendsAxis = {
  domain: [number, number] | null;
  ticks: number[];
  tickUnit: TickUnit;
  headingFormat: string;
};

const TICK_SLACK_MS = 1000;

const TICK_STEPS: Record<TickUnit, number[]> = {
  hour: [1, 2, 3, 4, 6, 12],
  day: [1, 2, 3, 5, 7, 10, 14, 15, 30],
  month: [1, 2, 3, 4, 6, 12],
  year: [1, 2, 5, 10, 20, 50],
};

const UNIT_START: Record<TickUnit, (date: Date) => Date> = {
  hour: startOfHour,
  day: startOfDay,
  month: startOfMonth,
  year: startOfYear,
};

const UNIT_ADD: Record<TickUnit, (date: Date, amount: number) => Date> = {
  hour: addHours,
  day: addDays,
  month: addMonths,
  year: addYears,
};

export type DateForm = 'full' | 'short';

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

export const TRENDS_LOCALE: Locale = {
  ...enUS,
  localize: {
    ...enUS.localize,
    month: (month, options) => (options?.width === 'abbreviated' ? SHORT_MONTHS[month] : enUS.localize.month(month, options)),
  },
};

const TICK_FORMAT: Record<DateForm, Record<TickUnit, string>> = {
  full: { hour: 'HH:mm', day: 'MMM d', month: 'MMM yyyy', year: 'yyyy' },
  short: { hour: 'HH:mm', day: 'MMM d', month: 'MMM ’yy', year: '’yy' },
};

export const tickUnitFor = (spanMs: number): TickUnit => {
  if (spanMs <= 2 * DAY_MS) return 'hour';
  if (spanMs <= 90 * DAY_MS) return 'day';
  if (spanMs <= 3 * 366 * DAY_MS) return 'month';
  return 'year';
};

export const headingFormatFor = (spanMs: number): string => {
  if (spanMs <= 2 * DAY_MS) return 'MMM d, HH:mm';
  if (spanMs <= 120 * DAY_MS) return 'MMM d';
  return 'MMM ’yy';
};

const firstBoundary = (startMs: number, unit: TickUnit, step: number): Date => {
  const from = startMs - TICK_SLACK_MS;
  let boundary = UNIT_START[unit](new Date(from));

  if (boundary.getTime() < from) boundary = UNIT_ADD[unit](boundary, 1);
  while (unit === 'hour' && boundary.getHours() % step) boundary = addHours(boundary, 1);

  return boundary;
};

const boundaries = (startMs: number, endMs: number, unit: TickUnit, step: number, limit: number): number[] => {
  const ticks: number[] = [];

  for (let at = firstBoundary(startMs, unit, step); at.getTime() <= endMs && ticks.length < limit; at = UNIT_ADD[unit](at, step)) {
    ticks.push(Math.max(at.getTime(), startMs));
  }

  return ticks;
};

export const calendarTicks = (startMs: number, endMs: number, unit: TickUnit): number[] => {
  const fitting = TICK_STEPS[unit]
    .map((step) => boundaries(startMs, endMs, unit, step, TICK_COUNT + 1))
    .find((ticks) => ticks.length <= TICK_COUNT);

  return fitting && fitting.length >= 2 ? fitting : [startMs, endMs];
};

export const toEpoch = (value: unknown): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || value.trim() === '') return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const buildTrendsAxis = (startMs: number, endMs: number): TrendsAxis => {
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
    return { domain: null, ticks: [], tickUnit: 'hour', headingFormat: headingFormatFor(0) };
  }

  const span = endMs - startMs;
  const tickUnit = tickUnitFor(span);

  return {
    domain: [startMs, endMs],
    ticks: calendarTicks(startMs, endMs, tickUnit),
    tickUnit,
    headingFormat: headingFormatFor(span),
  };
};

const HOUR_MS = 3600000;

const FIXED_BUCKET_MS: Record<string, number> = { minute: 60000, hour: HOUR_MS, day: DAY_MS, week: 7 * DAY_MS };

const smallestGap = (times: number[]): number | null =>
  [...times]
    .sort((a, b) => a - b)
    .reduce<number | null>((gap, time, index, sorted) => {
      const step = index ? time - sorted[index - 1] : 0;
      return step > 0 && (gap === null || step < gap) ? step : gap;
    }, null);

export const bucketEnd = (t: number, truncKey: unknown, spacing: number | null = null): number => {
  if (typeof truncKey === 'string' && FIXED_BUCKET_MS[truncKey]) return t + FIXED_BUCKET_MS[truncKey];

  const stamp = new Date(t);
  if (truncKey === 'month') return Date.UTC(stamp.getUTCFullYear(), stamp.getUTCMonth() + 1, 1);
  if (truncKey === 'year') return Date.UTC(stamp.getUTCFullYear() + 1, 0, 1);

  return spacing ? t + spacing : t;
};

export const clipToWindow = <T extends Record<string, any>>(
  rows: T[],
  window: [number, number] | null,
  { truncKey, bucketed }: { truncKey?: unknown; bucketed: boolean },
): Bucketed<T>[] => {
  if (!window) return rows;

  const [start, end] = window;
  const times = rows.map((row) => row[AXIS_KEY]).filter((t): t is number => Number.isFinite(t));
  const spacing = bucketed ? smallestGap(times) : null;

  return rows.flatMap((row) => {
    const t = row[AXIS_KEY];

    if (!Number.isFinite(t) || t > end) return [];

    const stop = bucketed ? bucketEnd(t, truncKey, spacing) : t;

    if (stop <= t) return t >= start ? [{ ...row, [BUCKET_START]: t }] : [];
    if (stop <= start) return [];

    return [{ ...row, [BUCKET_START]: t, [AXIS_KEY]: (Math.max(t, start) + Math.min(stop, end)) / 2 }];
  });
};

export const bucketHeadingFormatter = (axis: TrendsAxis | undefined) => {
  const heading = axisHeadingFormatter(axis);

  return (value: number, datum?: Record<string, unknown>) => {
    const stamp = datum?.[BUCKET_START];
    return heading(typeof stamp === 'number' ? stamp : value);
  };
};

export const axisDomain = (axis: TrendsAxis | undefined): [number, number] | ['dataMin', 'dataMax'] =>
  axis?.domain ?? ['dataMin', 'dataMax'];

export const axisTicks = (axis: TrendsAxis | undefined): number[] | undefined =>
  axis?.ticks?.length ? axis.ticks : undefined;

export const axisTickFormatter = (axis: TrendsAxis | undefined, form: DateForm = 'full') => (value: number) => {
  if (!Number.isFinite(value)) return '';

  const date = new Date(value);
  const unit = axis?.tickUnit ?? 'hour';
  const options = form === 'short' ? { locale: TRENDS_LOCALE } : undefined;

  if (unit === 'hour' && format(date, 'HH:mm') === '00:00') return format(date, 'MMM d', options);

  return format(date, TICK_FORMAT[form][unit], options);
};

export const axisHeadingFormatter = (axis: TrendsAxis | undefined) => (value: number) =>
  Number.isFinite(value) ? format(new Date(value), axis?.headingFormat ?? 'MMM d, HH:mm', { locale: TRENDS_LOCALE }) : '';
