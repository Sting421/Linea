import { Await, Link, useLoaderData, useSearchParams } from '@remix-run/react';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { Suspense, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import AlertStripRow, { AlertStripCard, AlertStripCount, AlertStripDivider } from '~/components/AlertStripRow';
import HelpHint from '~/components/HelpHint';
import { CHART_BODY_HEIGHT, ChartLoadingCard } from '~/containers/Plant/PlantHome/Trends/trendsChartStates';
import { readUrlRange } from '~/utils';
import { CanonicalStatus, eventSeverity, STATUS_SEVERITY } from '~/utils/status';
import { HomeCardFailed } from './HomeCardStates';

export const ALERTS_TITLE = 'Active Alerts';

export const ALERTS_HELP =
  'Alerts raised in the selected window, most severe first. Repeats on one inverter count once with a multiplier, and the same alert on several plants of one utility shows as a single cluster row. Events with no severity are left out and noted below the list.';

type PlantEvent = AllPlantEvents['events'][number];

export type AlertRow = {
  id: string;
  kind: 'device' | 'cluster';
  status: CanonicalStatus;
  text: string;
  subtitle: string;
  detail: string | null;
  count: number;
  latest: string;
};

export type AlertGrouping = {
  rows: AlertRow[];
  unresolved: number;
};

export const ALERT_ROW_CAP = 10;

export const ALERTS_LIST_FLOOR_REM = 22.5;

const ALERT_ROW_REM = 3.875;

export const alertsListFloor = (rowCount: number) =>
  `${Math.min(ALERTS_LIST_FLOOR_REM, rowCount * ALERT_ROW_REM + 1)}rem`;
const CLUSTER_MIN_PLANTS = 2;

export const clusterLabel = (row: AlertRow) =>
  row.kind === 'cluster' && row.status === 'offline' ? `${row.count} off` : undefined;

const plantNameOf = (event: PlantEvent) => event?.inverter?.plant?.properties?.plant_name ?? 'Unknown plant';
const plantIdOf = (event: PlantEvent) => event?.inverter?.plant?.id ?? plantNameOf(event);
const utilityNameOf = (event: PlantEvent) => event?.inverter?.plant?.properties?.utility_company?.name ?? null;
const eventTextOf = (event: PlantEvent) => event?.event_text || event?.event_type_text || 'Unknown event';

const laterOf = (a: string, b: string) => (a > b ? a : b);

type DeviceRow = AlertRow & { plantId: string; utility: string | null };

export const groupAlertRows = (events?: PlantEvent[] | null): AlertGrouping => {
  if (!Array.isArray(events) || events.length === 0) return { rows: [], unresolved: 0 };

  const devices = new Map<string, DeviceRow>();
  let unresolved = 0;

  for (const event of events) {
    const status = eventSeverity(event);

    if (!status) {
      unresolved += 1;
      continue;
    }

    const text = eventTextOf(event);
    const serial = event?.inverter?.inverter_serial_no || null;
    const key = `${plantIdOf(event)}|${serial ?? ''}|${status}|${text}`;
    const existing = devices.get(key);

    if (existing) {
      existing.count += 1;
      existing.latest = laterOf(existing.latest, event.start_time);
      continue;
    }

    const plantName = plantNameOf(event);

    devices.set(key, {
      id: key,
      kind: 'device',
      status,
      text,
      subtitle: plantName,
      detail: serial ? `Inverter ID ${serial}` : null,
      count: 1,
      latest: event.start_time,
      plantId: plantIdOf(event),
      utility: utilityNameOf(event),
    });
  }

  const clusters = new Map<string, { utility: string; rows: DeviceRow[]; plants: Set<string> }>();
  const rows: AlertRow[] = [];

  for (const row of devices.values()) {
    if (!row.utility) {
      rows.push(row);
      continue;
    }
    const key = `${row.utility}|${row.text}`;
    const bucket = clusters.get(key) ?? { utility: row.utility, rows: [], plants: new Set<string>() };
    bucket.rows.push(row);
    bucket.plants.add(row.plantId);
    clusters.set(key, bucket);
  }

  for (const [key, bucket] of clusters) {
    if (bucket.plants.size < CLUSTER_MIN_PLANTS) {
      rows.push(...bucket.rows);
      continue;
    }
    const first = bucket.rows[0];
    const worst = STATUS_SEVERITY.find((severity) => bucket.rows.some((row) => row.status === severity)) ?? first.status;
    const atWorst = new Set(bucket.rows.filter((row) => row.status === worst).map((row) => row.plantId));

    rows.push({
      id: key,
      kind: 'cluster',
      status: worst,
      text: first.text,
      subtitle: `${bucket.utility} cluster · ${bucket.plants.size} plants`,
      detail: null,
      count: atWorst.size,
      latest: bucket.rows.reduce((acc, row) => laterOf(acc, row.latest), first.latest),
    });
  }

  rows.sort((a, b) => {
    const bySeverity = STATUS_SEVERITY.indexOf(a.status) - STATUS_SEVERITY.indexOf(b.status);
    if (bySeverity !== 0) return bySeverity;
    return a.latest < b.latest ? 1 : a.latest > b.latest ? -1 : 0;
  });

  return { rows, unresolved };
};

const relativeTime = (iso: string) => {
  try {
    return formatDistanceToNowStrict(parseISO(iso), { addSuffix: true });
  } catch {
    return '';
  }
};

const UNCHOSEN_RANGE_LABEL = 'default range';

const AlertsHeader = ({
  count,
  href,
  unchosen,
}: {
  count?: number;
  href: string;
  unchosen: boolean;
}) => (
  <div className="flex items-center gap-3 px-[1.125rem] pt-5">
    <span className="truncate font-display text-lg font-semibold leading-6 text-hue-sky-900">{ALERTS_TITLE}</span>
    {count !== undefined && count > 0 && <AlertStripCount>{count}</AlertStripCount>}
    {unchosen && <span className="text-[11.5px] text-hue-ink-600">{UNCHOSEN_RANGE_LABEL}</span>}
    <Link
      to={href}
      prefetch="none"
      className="group ml-auto whitespace-nowrap text-[12px] font-semibold text-hue-sky-800 no-underline transition-colors duration-100 ease-out hover:text-hue-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-hue-sky-500"
    >
      View all{' '}
      <span
        aria-hidden="true"
        className="inline-block transition-transform duration-150 ease-out motion-safe:group-hover:translate-x-0.5"
      >
        →
      </span>
    </Link>
    <div className="relative z-20 flex flex-none items-center">
      <HelpHint content={ALERTS_HELP} label={ALERTS_TITLE} />
    </div>
  </div>
);

const AlertsUnresolvedNote = ({ count }: { count: number }) => {
  const tooltipId = useId();

  return (
    <div className="group relative flex shrink-0 items-center justify-center gap-1.5 border-t border-hue-ink-100 px-4 py-2 text-[11.5px] font-medium text-hue-ink-600">
      <span>
        <span className="tabular-nums">{count}</span>{' '}
        {count === 1 ? 'event had no severity to read' : 'events had no severity to read'}
      </span>

      <button
        type="button"
        aria-label="Why these are not listed"
        aria-describedby={tooltipId}
        className="flex-none rounded-full p-0.5 text-hue-ink-500 transition-colors duration-100 hover:text-hue-ink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-hue-sky-500"
      >
        <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true" className="block">
          <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <path d="M7 6.1v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="7" cy="4.2" r="0.85" fill="currentColor" />
        </svg>
      </button>

      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-4 right-4 z-10 mb-1.5 origin-bottom scale-[0.97] rounded-lg border border-hue-slate-200 bg-white px-2.5 py-2 text-[11px] font-medium leading-[1.45] text-hue-zinc-600 opacity-0 shadow-card transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100 motion-reduce:transition-none"
      >
        No event code, text or type these carry maps to a severity, so they are not listed here. They appear in
        Alerts as undetermined severity.
      </span>
    </div>
  );
};

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export const hasMoreBelow = (box: { scrollHeight: number; scrollTop: number; clientHeight: number }) =>
  box.scrollHeight - box.scrollTop - box.clientHeight > 1;

const useMoreBelow = (rowCount: number) => {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [moreBelow, setMoreBelow] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller) return undefined;

    const measure = () => setMoreBelow(hasMoreBelow(scroller));

    measure();
    scroller.addEventListener('scroll', measure, { passive: true });

    const observer = new ResizeObserver(measure);
    observer.observe(scroller);

    return () => {
      scroller.removeEventListener('scroll', measure);
      observer.disconnect();
    };
  }, [rowCount]);

  return { scrollerRef, moreBelow };
};

const AlertsScroller = ({ rows, alertsHref, total }: { rows: AlertRow[]; alertsHref: string; total: number }) => {
  const { scrollerRef, moreBelow } = useMoreBelow(rows.length);

  return (
    <div className="relative grow basis-0" style={{ minHeight: alertsListFloor(rows.length) }}>
      <ul ref={scrollerRef} className="quiet-scrollbar absolute inset-0 flex flex-col overflow-y-auto px-1.5 py-2">
        {rows.map((row, index) => {
          const label = clusterLabel(row);

          return (
            <li key={row.id}>
              {index > 0 && <AlertStripDivider />}
              <AlertStripRow
                status={row.status}
                title={row.text}
                subtitle={row.subtitle}
                detail={row.detail}
                time={relativeTime(row.latest)}
                label={label}
                count={label || row.count < 2 ? undefined : row.count}
                to={alertsHref}
              />
            </li>
          );
        })}
      </ul>

      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent transition-opacity duration-150 ease-out motion-reduce:transition-none ${
          moreBelow ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {total > rows.length && (
        <span className="sr-only">
          Showing {rows.length} of {total} alerts. Open Alerts to see the rest.
        </span>
      )}
    </div>
  );
};

const AlertsList = () => {
  const data = useLoaderData<{
    allPlantEvents: Promise<AllPlantEvents>;
    errors: Record<string, string>;
  }>();
  const [searchParams] = useSearchParams();
  const alertsHref = searchParams.toString() ? `/alerts?${searchParams.toString()}` : '/alerts';
  const unchosen = readUrlRange(searchParams) === null;

  return (
    <Suspense fallback={<ChartLoadingCard title={ALERTS_TITLE} help={ALERTS_HELP} surface="solid" />}>
      <Await
        resolve={data.allPlantEvents as AllPlantEvents}
        errorElement={<HomeCardFailed title={ALERTS_TITLE} help={ALERTS_HELP} bodyClassName={CHART_BODY_HEIGHT} />}
      >
        {(allPlantEvents) => {
          const { errors } = data;

          if (!allPlantEvents || errors?.allPlantEvents) {
            return <HomeCardFailed title={ALERTS_TITLE} help={ALERTS_HELP} bodyClassName={CHART_BODY_HEIGHT} />;
          }

          const { rows: grouped, unresolved } = groupAlertRows(allPlantEvents.events);
          const rows = grouped.slice(0, ALERT_ROW_CAP);

          if (rows.length === 0) {
            return (
              <AlertStripCard className="h-full w-full">
                <AlertsHeader href={alertsHref} unchosen={unchosen} count={0} />
                <span className="px-[1.125rem] py-6 text-[11.5px] text-hue-ink-600">
                  No active alerts in this range
                </span>
                {unresolved > 0 && <AlertsUnresolvedNote count={unresolved} />}
              </AlertStripCard>
            );
          }

          return (
            <AlertStripCard className="h-full w-full">
              <AlertsHeader href={alertsHref} unchosen={unchosen} count={grouped.length} />
              <AlertsScroller rows={rows} alertsHref={alertsHref} total={grouped.length} />
              {unresolved > 0 && <AlertsUnresolvedNote count={unresolved} />}
            </AlertStripCard>
          );
        }}
      </Await>
    </Suspense>
  );
};

export default AlertsList;
