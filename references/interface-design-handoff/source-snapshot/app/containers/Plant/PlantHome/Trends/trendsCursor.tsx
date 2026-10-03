import { CHART_BASELINE } from '~/utils/chartColors';

type CursorProps = {
  points?: { x: number; y: number }[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  radius?: number;
  share?: number;
  className?: string;
};

export const CURSOR_GLIDE = 'transition-transform duration-200 ease-out motion-reduce:transition-none';

export const SlidingCursor = ({
  points,
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  fill,
  radius = 0,
  share = 0,
  className = '',
}: CursorProps) => {
  const classes = `${CURSOR_GLIDE} ${className}`.trim();

  if (points && points.length > 1) {
    const [start, end] = points;
    if (share > 0 && width > 0) {
      const band = share * width;
      return (
        <rect
          x={-band / 2}
          y={start.y}
          width={band}
          height={Math.max(end.y - start.y, 0)}
          rx={radius}
          fill={fill}
          pointerEvents="none"
          style={{ transform: `translateX(${start.x}px)` }}
          className={classes}
        />
      );
    }
    return (
      <line
        x1={0}
        x2={0}
        y1={start.y}
        y2={end.y}
        stroke={CHART_BASELINE}
        strokeWidth={1}
        pointerEvents="none"
        style={{ transform: `translateX(${start.x}px)` }}
        className={classes}
      />
    );
  }

  return (
    <rect
      x={0}
      y={y}
      width={width}
      height={height}
      rx={radius}
      fill={fill}
      pointerEvents="none"
      style={{ transform: `translateX(${x}px)` }}
      className={classes}
    />
  );
};
