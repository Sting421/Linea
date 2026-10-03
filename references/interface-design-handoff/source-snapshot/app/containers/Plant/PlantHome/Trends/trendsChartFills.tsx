import { useId } from 'react';

export const tint = (hex: string, amount: number) => {
  const channels = [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));
  if (hex.length !== 7 || channels.some(Number.isNaN)) return hex;

  return `#${channels
    .map((channel) => Math.round(channel + (255 - channel) * amount))
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`;
};

export const useGradientPrefix = () => `trends${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

const safe = (key: string) => key.replace(/[^a-zA-Z0-9]/g, '-');

export const gradientFill = (prefix: string, key: string) => `url(#${prefix}-${safe(key)})`;

export type GradientKind = 'solid' | 'wash';

export type GradientSeries = { key: string; color: string; kind?: GradientKind; from?: number; to?: number };

const STOPS: Record<GradientKind, { top: number; base: number }> = {
  solid: { top: 0, base: 0.35 },
  wash: { top: 0.55, base: 0.15 },
};

export const SeriesGradients = ({ prefix, series }: { prefix: string; series: GradientSeries[] }) => (
  <defs>
    {series.map(({ key, color, kind = 'solid', from, to }) => {
      const stops = STOPS[kind];
      const top = from ?? stops.top;
      const base = to ?? stops.base;

      return (
        <linearGradient
          key={key}
          id={`${prefix}-${safe(key)}`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0%"
          x2="0"
          y2="100%"
        >
          {kind === 'solid'
            ? [
                <stop key="a" offset="0%" stopColor={tint(color, top)} />,
                <stop key="b" offset="25%" stopColor={tint(color, top)} />,
                <stop key="c" offset="100%" stopColor={tint(color, base)} />,
              ]
            : [
                <stop key="a" offset="0%" stopColor={color} stopOpacity={top} />,
                <stop key="b" offset="25%" stopColor={color} stopOpacity={top} />,
                <stop key="c" offset="100%" stopColor={color} stopOpacity={base} />,
              ]}
        </linearGradient>
      );
    })}
  </defs>
);

const SQUIRCLE = 0.2;

export const BAR_RADIUS = 4;

export const squircleTopPath = (x: number, y: number, width: number, height: number, radius = BAR_RADIUS) => {
  const r = Math.max(0, Math.min(radius, width / 2, Math.abs(height)));
  const toward = height < 0 ? -1 : 1;
  const k = r * SQUIRCLE;
  const right = x + width;
  const base = y + height;

  if (r === 0) return `M${x},${base}L${x},${y}L${right},${y}L${right},${base}Z`;

  return [
    `M${x},${base}`,
    `L${x},${y + toward * r}`,
    `C${x},${y + toward * k} ${x + k},${y} ${x + r},${y}`,
    `L${right - r},${y}`,
    `C${right - k},${y} ${right},${y + toward * k} ${right},${y + toward * r}`,
    `L${right},${base}`,
    'Z',
  ].join('');
};

export const stackTop = (
  datum: Record<string, unknown> | undefined,
  key: string,
  stack: string[],
  hidden: string[] = [],
) => stack.slice(stack.indexOf(key) + 1).every((above) => hidden.includes(above) || !(Number(datum?.[above]) > 0));

type BarShapeProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fillOpacity?: number;
  payload?: Record<string, unknown>;
};

type SeriesBarOptions = {
  fill: string;
  round?: boolean | ((payload?: Record<string, unknown>) => boolean);
  inset?: boolean;
};

export const seriesBar = ({ fill, round = true, inset = false }: SeriesBarOptions) => {
  const SeriesBarShape = (shape: unknown) => {
    const { x = 0, y = 0, width = 0, height = 0, fillOpacity, payload } = shape as BarShapeProps;
    const left = inset ? x + 1 : x;
    const drawn = inset ? Math.max(width - 2, 0) : width;

    if (!height || drawn <= 0) return <g />;

    const rounded = typeof round === 'function' ? round(payload) : round;

    return (
      <path
        d={squircleTopPath(left, y, drawn, height, rounded ? BAR_RADIUS : 0)}
        fill={fill}
        fillOpacity={fillOpacity}
      />
    );
  };

  return SeriesBarShape;
};
