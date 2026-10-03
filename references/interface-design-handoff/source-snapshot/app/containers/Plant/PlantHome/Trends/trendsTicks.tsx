import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Text } from 'recharts';
import { CHART_TICK } from '~/utils/chartColors';

const useBeforePaint = typeof window === 'undefined' ? useEffect : useLayoutEffect;

type Anchor = 'start' | 'middle' | 'end';

type TickProps = {
  x?: number;
  y?: number;
  width?: number;
  index?: number;
  textAnchor?: Anchor;
  payload?: { value: number; coordinate?: number };
  tickFormatter?: (value: number, index: number) => string;
  color?: string;
};

export const edgeShift = (offset: number, plotWidth: number, labelWidth: number) => {
  const half = labelWidth / 2;
  if (plotWidth <= labelWidth) return plotWidth / 2 - offset;
  if (offset < half) return half - offset;
  if (plotWidth - offset < half) return plotWidth - half - offset;
  return 0;
};

export const LABEL_GAP = 8;

type Span = { x: number; width: number };

export const crowds = (own: Span, others: Span[]) =>
  others.some((other) => own.x < other.x + other.width + LABEL_GAP && other.x < own.x + own.width + LABEL_GAP);

export const TimeTick = ({
  domain,
  x,
  y,
  width = 0,
  index = 0,
  payload,
  tickFormatter,
  color = CHART_TICK,
}: TickProps & { domain: [number, number] | null }) => {
  const node = useRef<SVGTextElement>(null);
  const [shift, setShift] = useState(0);
  const [crowded, setCrowded] = useState(false);
  const value = payload?.value ?? Number.NaN;
  const label = tickFormatter ? tickFormatter(value, index) : String(value);

  useBeforePaint(() => {
    const text = node.current;
    if (!text || !domain || typeof text.getComputedTextLength !== 'function') return;
    const [start, end] = domain;
    if (!(end > start)) return;
    const next = edgeShift(((value - start) / (end - start)) * width, width, text.getComputedTextLength());
    if (Math.abs(next - shift) > 0.5) {
      setShift(next);
      return;
    }
    const siblings = [...(text.closest('.recharts-cartesian-axis-ticks')?.querySelectorAll('text') ?? [])];
    const nowCrowded =
      next !== 0 && crowds(text.getBBox(), siblings.filter((other) => other !== text).map((other) => other.getBBox()));
    if (nowCrowded !== crowded) setCrowded(nowCrowded);
  });

  return (
    <text
      ref={node}
      x={payload?.coordinate ?? x}
      y={y}
      dx={shift}
      dy="0.71em"
      textAnchor="middle"
      fill={color}
      visibility={crowded ? 'hidden' : undefined}
      className="recharts-cartesian-axis-tick-value"
    >
      {label}
    </text>
  );
};

export const categorySlot = (axisWidth: number, count: number) => Math.max(axisWidth / Math.max(count, 1) - LABEL_GAP, 0);

export const CategoryTick = ({
  count,
  x,
  y,
  width = 0,
  index = 0,
  payload,
  tickFormatter,
  color = CHART_TICK,
}: TickProps & { count: number }) => (
  <Text
    x={payload?.coordinate ?? x}
    y={y}
    width={categorySlot(width, count)}
    textAnchor="middle"
    verticalAnchor="start"
    fill={color}
    className="recharts-cartesian-axis-tick-value"
  >
    {tickFormatter ? tickFormatter(payload?.value ?? Number.NaN, index) : String(payload?.value ?? '')}
  </Text>
);

export const TICK_GAP = 8;

export const fittedWidth = (labelWidths: number[]) =>
  labelWidths.length ? Math.ceil(Math.max(...labelWidths)) + TICK_GAP : null;

export type AxisRegistry = {
  report: (axis: string, key: string, width: number) => void;
  drop: (axis: string, key: string) => void;
};

export type AxisFit = { width: number; peak: number };

export const createAxisRegistry = (onFit: (axis: string, fit: AxisFit) => void): AxisRegistry => {
  const labels = new Map<string, Map<string, number>>();
  const settle = (axis: string) => {
    const sizes = labels.get(axis) ?? new Map<string, number>();
    const width = fittedWidth([...sizes.values()]);
    if (width === null) return;
    const values = [...sizes.keys()].map((key) => Math.abs(Number(key))).filter(Number.isFinite);
    onFit(axis, { width, peak: Math.max(0, ...values) });
  };

  return {
    report: (axis, key, width) => {
      labels.set(axis, (labels.get(axis) ?? new Map<string, number>()).set(key, width));
      settle(axis);
    },
    drop: (axis, key) => {
      labels.get(axis)?.delete(key);
      settle(axis);
    },
  };
};

export const useFittedAxes = <K extends string>(fallback: Record<K, number>) => {
  const [widths, setWidths] = useState(fallback);
  const [peaks, setPeaks] = useState<Partial<Record<K, number>>>({});
  const registry = useRef<AxisRegistry | null>(null);

  if (!registry.current) {
    registry.current = createAxisRegistry((axis, { width, peak }) => {
      setWidths((prev) =>
        Math.abs((prev as Record<string, number>)[axis] - width) <= 1 ? prev : ({ ...prev, [axis]: width } as Record<K, number>),
      );
      setPeaks((prev) => ((prev as Record<string, number>)[axis] === peak ? prev : { ...prev, [axis]: peak }));
    });
  }

  return { widths, peaks, registry: registry.current };
};

export const ValueTick = ({
  axis,
  registry,
  x,
  y,
  index = 0,
  textAnchor = 'end',
  payload,
  tickFormatter,
  color = CHART_TICK,
}: TickProps & { axis: string; registry: AxisRegistry }) => {
  const node = useRef<SVGTextElement>(null);
  const value = payload?.value ?? Number.NaN;
  const label = tickFormatter ? tickFormatter(value, index) : String(value);

  useBeforePaint(() => {
    const text = node.current;
    if (!text || typeof text.getComputedTextLength !== 'function') return undefined;
    const key = String(value);
    registry.report(axis, key, text.getComputedTextLength());
    return () => registry.drop(axis, key);
  }, [axis, registry, label, value]);

  return (
    <text ref={node} x={x} y={y} dy="0.355em" textAnchor={textAnchor} fill={color} className="recharts-cartesian-axis-tick-value">
      {label}
    </text>
  );
};
