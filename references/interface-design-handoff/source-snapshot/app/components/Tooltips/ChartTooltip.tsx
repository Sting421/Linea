import { Fragment, ReactNode } from 'react';
import { formatChartValue, isFiniteNumber } from '~/utils/chartFormat';

export type ChartTooltipRow = {
  name: string;
  value: unknown;
  color?: string;
  prefix?: string;
  unit?: string;
  display?: string;
  shape?: 'circle' | 'square';
  status?: ReactNode;
};

export type ChartTooltipGroup = {
  label: string;
  keys: string[];
  total?: boolean;
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: any[];
  label?: unknown;
  labelFormatter?: (label: any, datum?: any) => ReactNode;
  prefix?: string;
  unit?: string;
  extra?: (datum: any) => ChartTooltipRow[];
  groups?: ChartTooltipGroup[];
  rows?: (datum: any) => ChartTooltipRow[];
};

type Section = { group?: ChartTooltipGroup; rows: ChartTooltipRow[] };

const SURFACE = 'rounded-[10px] border border-hue-ink-100 bg-white px-3 py-2 shadow-md';

const HEADING = 'font-display text-[11px] font-semibold uppercase tracking-[0.05em] text-hue-ink-500';

const NAME = 'truncate text-sm text-hue-ink-600';

const VALUE = 'font-display text-sm font-semibold tabular-nums text-hue-ink-900';

const GROUP = 'font-display text-xs font-semibold text-hue-ink-700';

export const MISSING_VALUE = '--';

const isMissing = (value: unknown) => value == null || (typeof value === 'number' && !Number.isFinite(value));

const toSections = (rows: ChartTooltipRow[], groups?: ChartTooltipGroup[]): Section[] => {
  if (!groups?.length) return [{ rows }];

  const byName = new Map(rows.map((row) => [row.name, row]));
  const grouped = new Set(groups.flatMap((group) => group.keys));

  return [
    ...groups.map((group) => ({
      group,
      rows: group.keys.flatMap((key) => {
        const row = byName.get(key);
        return row ? [row] : [];
      }),
    })),
    { rows: rows.filter((row) => !grouped.has(row.name)) },
  ].filter((section) => section.rows.length);
};

const groupTotal = (rows: ChartTooltipRow[]) => {
  const values = rows.map((row) => row.value).filter(isFiniteNumber);
  return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
};

const Figure = ({ value, prefix, unit }: { value: unknown; prefix?: string; unit?: string }) =>
  isMissing(value) ? (
    <>{MISSING_VALUE}</>
  ) : (
    <>
      {prefix ?? ''}
      {formatChartValue(value)}
      {unit ? ` ${unit}` : ''}
    </>
  );

export const ChartTooltip = ({
  active,
  payload,
  label,
  labelFormatter,
  prefix,
  unit,
  extra,
  groups,
  rows: buildRows,
}: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;

  const datum = payload[0]?.payload;

  const rows: ChartTooltipRow[] = [
    ...(buildRows
      ? buildRows(datum)
      : payload
          .filter((entry) => entry.type !== 'none')
          .map((entry) => ({
            name: entry.name ?? entry.dataKey,
            value: entry.value,
            color: entry.color ?? entry.fill ?? entry.payload?.fill,
            prefix,
            unit,
          }))),
    ...(extra ? extra(datum) : []),
  ];

  if (!rows.length) return null;

  const withStatus = rows.some((row) => row.status);

  const heading = labelFormatter ? labelFormatter(label, datum) : (label as ReactNode);

  return (
    <div className={SURFACE}>
      {heading ? <div className={`${HEADING} mb-1.5`}>{heading}</div> : null}

      <div
        className={`grid ${
          withStatus ? 'grid-cols-[auto_minmax(0,1fr)_auto_auto]' : 'grid-cols-[auto_minmax(0,1fr)_auto]'
        } items-center gap-x-3 gap-y-1`}
      >
        {toSections(rows, groups).map(({ group, rows: sectionRows }, index) => (
          <Fragment key={group?.label ?? 'ungrouped'}>
            {group ? (
              <div className="contents">
                <span className={`${GROUP} col-span-2 ${index ? 'pt-1.5' : ''}`.trim()}>{group.label}</span>
                <span className={`${VALUE} ${index ? 'pt-1.5' : ''}`.trim()}>
                  {group.total ? <Figure value={groupTotal(sectionRows)} prefix={prefix} unit={unit} /> : null}
                </span>
                {withStatus ? <span /> : null}
              </div>
            ) : null}
            {sectionRows.map((row) => (
              <div key={row.name} className="contents">
                <span
                  className={`size-2 ${row.shape === 'square' ? 'rounded-sm' : 'rounded-full'}`}
                  style={row.color ? { background: row.color } : undefined}
                  aria-hidden="true"
                />
                <span className={NAME} title={row.name}>
                  {row.name}
                </span>
                <span className={VALUE}>
                  {row.display ?? <Figure value={row.value} prefix={row.prefix} unit={row.unit} />}
                </span>
                {withStatus ? <span className="flex">{row.status}</span> : null}
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default ChartTooltip;
