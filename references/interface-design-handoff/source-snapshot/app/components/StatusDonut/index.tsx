import { useState } from 'react';
import { ChartLegend } from '~/components/Charts/ChartLegend';
import { Donut } from '~/components/Donut';
import HelpHint from '~/components/HelpHint';
import { LegendPanel } from '~/containers/Plant/PlantHome/Trends/trendsChartStates';
import { formatChartValue } from '~/utils/chartFormat';
import { CanonicalStatus, STATUS_LABELS, statusToHex } from '~/utils/status';

export type StatusCounts = Record<CanonicalStatus, number>;

type StatusDonutProps = {
  counts: StatusCounts;
  title?: string;
  help?: string;
  entityLabel?: string;
  populationLabel?: string;
  unavailable?: number;
  unavailableNote?: string;
  className?: string;
};

export const DISPLAY_ORDER: CanonicalStatus[] = ['normal', 'warning', 'offline', 'fault', 'anomaly'];

const isStatus = (key: string | null): key is CanonicalStatus =>
  key !== null && (DISPLAY_ORDER as string[]).includes(key);

export const statusView = (
  counts: StatusCounts,
  { unavailable = 0, populationLabel }: { unavailable?: number; populationLabel: string },
) => {
  const total = DISPLAY_ORDER.reduce((sum, key) => sum + counts[key], 0);

  return {
    total,
    slices: DISPLAY_ORDER.map((key) => ({
      key,
      label: STATUS_LABELS[key],
      value: counts[key],
      color: statusToHex(key),
    })),
    centre: formatChartValue(total),
    caption: unavailable > 0 ? `of ${formatChartValue(total + unavailable)} ${populationLabel}` : populationLabel,
    legendValue: (key: CanonicalStatus) => formatChartValue(counts[key]),
    centreFor: (key: string | null) =>
      isStatus(key) ? { value: formatChartValue(counts[key]), caption: STATUS_LABELS[key] } : null,
  };
};

export const DONUT_SIZE = 'size-48 [@container(min-width:_340px)]:size-52';

const StatusDonut = ({
  counts,
  title = 'Fleet status',
  help,
  entityLabel = 'plants',
  populationLabel = entityLabel,
  unavailable = 0,
  unavailableNote = 'These reported no status in the selected window, so they are not in the breakdown above.',
  className = '',
}: StatusDonutProps) => {
  const [hovered, setHovered] = useState<CanonicalStatus | null>(null);
  const view = statusView(counts, { unavailable, populationLabel });

  return (
    <div
      className={`font-display flex h-full flex-col rounded-[14px] bg-white px-[1.125rem] py-5 shadow-500 ${className}`.trim()}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="truncate text-lg font-semibold leading-6 text-hue-sky-900">{title}</span>
        {help && (
          <div className="relative z-20 flex flex-none items-center gap-2">
            <HelpHint content={help} label={title} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col [@container(min-width:_440px)]:flex-row [@container(min-width:_440px)]:items-center [@container(min-width:_440px)]:justify-center [@container(min-width:_440px)]:gap-8">
        <div className="flex flex-1 items-center justify-center py-1 [@container(min-width:_440px)]:flex-none">
          <Donut
            slices={view.slices}
            hovered={hovered}
            onHover={(key) => setHovered(isStatus(key) ? key : null)}
            centreValue={view.centre}
            centreCaption={view.caption}
            ariaLabel="Status breakdown donut"
            gradient
            faded={0}
            entrance
            outline
            focusCentre={view.centreFor(hovered)}
            fluid
            className={DONUT_SIZE}
          />
        </div>

        <LegendPanel className="mx-auto mt-3 w-full max-w-sm [@container(min-width:_440px)]:mx-0 [@container(min-width:_440px)]:mt-0 [@container(min-width:_440px)]:max-w-xs [@container(min-width:_440px)]:flex-1">
          <ChartLegend
            orientation="column"
            readOnly
            className="grid grid-cols-1 gap-x-6 gap-y-1 [@container(min-width:_300px)]:grid-cols-2 [@container(min-width:_440px)]:grid-cols-1"
            items={DISPLAY_ORDER.map((key) => ({
              key,
              name: STATUS_LABELS[key],
              value: view.legendValue(key),
              color: statusToHex(key),
            }))}
            focused={hovered}
            onFocus={(key) => setHovered(isStatus(key) ? key : null)}
          />

          {unavailable > 0 && (
            <div className="mt-2 border-t border-hue-ink-200">
              <div className="group relative flex items-center gap-2 pt-2">
                <span aria-hidden="true" className="size-3 flex-none rounded-full border-[1.5px] border-hue-ink-400" />
                <span className="truncate font-display text-sm font-semibold text-hue-ink-600">No status</span>
                <button
                  type="button"
                  aria-label={`${unavailable} ${entityLabel} have no status. ${unavailableNote}`}
                  className="flex-none rounded-full p-0.5 text-hue-ink-400 transition-colors duration-100 hover:text-hue-ink-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-hue-sky-500 active:scale-[0.97] motion-reduce:active:scale-100"
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true" className="block">
                    <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M7 6.1v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="7" cy="4.2" r="0.85" fill="currentColor" />
                  </svg>
                </button>
                <span className="flex-1" />
                <span className="whitespace-nowrap font-display text-sm font-medium tabular-nums text-hue-ink-600">
                  {formatChartValue(unavailable)}
                </span>
                <span
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full right-0 z-10 mb-1.5 w-[212px] origin-bottom-right scale-[0.97] rounded-[7px] bg-hue-ink-900 px-[9px] py-[5px] text-left text-label font-medium text-hue-ink-100 opacity-0 transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100 motion-reduce:transition-none"
                >
                  {unavailableNote}
                </span>
              </div>
            </div>
          )}
        </LegendPanel>
      </div>
    </div>
  );
};

export default StatusDonut;
