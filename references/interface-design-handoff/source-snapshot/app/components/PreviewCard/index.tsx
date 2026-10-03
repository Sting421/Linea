import { LineChart } from 'icons';
import { ReactNode } from 'react';
import HelpHint from '~/components/HelpHint';

export type PreviewCardState = 'live' | 'placeholder';
export type PreviewCardMode = 'value' | 'empty' | 'placeholder';

type PreviewCardProps = {
  title: string;
  state?: PreviewCardState;
  value?: string | number | null;
  unit?: string;
  delta?: number | null;
  invertDelta?: boolean;
  help?: string;
  eyebrow?: string;
  caption?: string;
  sparkline?: ReactNode;
  loading?: boolean;
  loadingLabel?: string;
  href?: string;
  linkLabel?: string;
  emptyLabel?: string;
  className?: string;
};

const PLACEHOLDER_NOTE = 'Not yet available';

const TITLE_CLASSES: Record<'linked' | 'unlinked', string> = {
  linked:
    'font-display text-lg font-semibold leading-6 text-hue-sky-900 transition-colors duration-150 [@media(hover:hover)_and_(pointer:fine)]:group-hover/card:text-hue-sky-800 group-focus-within/link:text-hue-sky-800',
  unlinked: 'truncate font-display text-lg font-semibold leading-6 text-hue-sky-900',
};

const FIGURE = 'font-display text-display-xl font-bold text-hue-ink-900';

const EYEBROW = 'block font-display text-eyebrow font-semibold uppercase text-hue-ink-500';

const CAPTION = 'block text-label text-hue-ink-600';

const BODY_SPLIT =
  'grid flex-1 grid-cols-[fit-content(60%)_minmax(0,1fr)] items-center gap-x-4 [@container(min-width:_560px)]:gap-x-8';

const BODY_SOLO = 'flex flex-1 items-center';

const SPARK_SLOT = '-mx-0.5 h-14 min-w-0 overflow-hidden [@container(min-width:_560px)]:h-16';

const SKELETON = 'block rounded bg-hue-ink-100 motion-safe:animate-pulse';

const DELTA_CLASSES: Record<'good' | 'bad', string> = {
  good: 'bg-hue-green-50 text-hue-green-700',
  bad: 'bg-hue-red-50 text-hue-red-700',
};

const ARROW_WRAP = [
  'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-transparent',
  'transition-[transform,border-color,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]',
  '[@media(hover:hover)_and_(pointer:fine)]:group-hover/card:translate-x-1',
  '[@media(hover:hover)_and_(pointer:fine)]:group-hover/card:border-hue-sky-500',
  '[@media(hover:hover)_and_(pointer:fine)]:group-hover/card:bg-hue-sky-50',
  'group-focus-within/link:translate-x-1 group-focus-within/link:border-hue-sky-500 group-focus-within/link:bg-hue-sky-50',
  'group-active/link:scale-95',
  'motion-reduce:transform-none',
].join(' ');

export const previewCardMode = (state: PreviewCardState, value?: string | number | null): PreviewCardMode => {
  if (state === 'placeholder') return 'placeholder';
  if (value === null || value === undefined || value === '') return 'empty';
  return 'value';
};

export const previewCardDelta = (
  delta?: number | null,
  invertDelta = false,
): { text: string; good: boolean } | null => {
  if (delta === null || delta === undefined || !Number.isFinite(delta)) return null;
  const up = delta >= 0;
  return { text: `${up ? '↑' : '↓'} ${Math.abs(delta)}%`, good: invertDelta ? !up : up };
};

export const previewCardNote = (mode: PreviewCardMode, emptyLabel: string): string | null => {
  if (mode === 'placeholder') return PLACEHOLDER_NOTE;
  if (mode === 'empty') return emptyLabel;
  return null;
};

const PreviewCard = ({
  title,
  state = 'live',
  value,
  unit,
  delta,
  invertDelta = false,
  help,
  eyebrow,
  caption,
  sparkline,
  loading = false,
  loadingLabel,
  href,
  linkLabel,
  emptyLabel = 'No data yet',
  className = '',
}: PreviewCardProps) => {
  const mode = previewCardMode(state, value);
  const deltaChip = mode === 'value' ? previewCardDelta(delta, invertDelta) : null;
  const linked = typeof href === 'string' && href.length > 0;
  const note = previewCardNote(mode, emptyLabel);
  const key = linked ? 'linked' : 'unlinked';

  const arrow = (
    <span className={ARROW_WRAP}>
      <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-hue-sky-500" aria-hidden="true" focusable="false">
        <path
          d="M6 3.5 10.5 8 6 12.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );

  return (
    <div
      aria-busy={loading || undefined}
      className={`flex h-full w-full flex-col gap-3 rounded-[14px] bg-white px-[1.125rem] py-5 shadow-500 ${
        linked ? 'group/card' : ''
      } ${className}`
        .replace(/\s+/g, ' ')
        .trim()}
    >
      {linked ? (
        <div className="group/link flex min-h-6 items-center justify-between gap-2">
          <a
            href={href}
            aria-label={linkLabel ?? `View ${title}`}
            className="-mx-1 min-w-0 truncate rounded-2lg px-1 no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-hue-sky-500"
          >
            <span className={TITLE_CLASSES[key]}>{title}</span>
          </a>
          <div className="relative z-20 flex flex-none items-center gap-2">
            <HelpHint content={help} label={title} />
            <a href={href} aria-hidden="true" tabIndex={-1} className="inline-flex no-underline">
              {arrow}
            </a>
          </div>
        </div>
      ) : (
        <div className="flex min-h-6 items-center justify-between gap-2">
          <span className={TITLE_CLASSES[key]}>{title}</span>
          {help ? (
            <div className="relative z-20 flex flex-none items-center">
              <HelpHint content={help} label={title} />
            </div>
          ) : null}
        </div>
      )}

      {loading ? (
        <div className={BODY_SPLIT}>
          <div className="flex min-w-0 flex-col gap-1">
            <span aria-hidden="true" className={`${SKELETON} h-10 w-28`} />
            <span aria-hidden="true" className={`${SKELETON} h-[0.825rem] w-24`} />
            {loadingLabel ? <span className={CAPTION}>{loadingLabel}</span> : null}
          </div>
          <div className={SPARK_SLOT}>
            <span aria-hidden="true" className={`${SKELETON} size-full rounded-2lg`} />
          </div>
        </div>
      ) : mode === 'value' ? (
        <div className={sparkline ? BODY_SPLIT : BODY_SOLO}>
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-baseline gap-[5px]">
                <span className={FIGURE}>{value}</span>
                {unit ? <span className="text-body-sm text-hue-ink-600">{unit}</span> : null}
              </div>
              {deltaChip ? (
                <span
                  className={`font-display inline-flex items-center whitespace-nowrap rounded-full px-[9px] py-[3px] text-xs font-semibold tabular-nums ${
                    DELTA_CLASSES[deltaChip.good ? 'good' : 'bad']
                  }`}
                >
                  {deltaChip.text}
                </span>
              ) : null}
            </div>
            {eyebrow ? <span className={EYEBROW}>{eyebrow}</span> : null}
            {caption ? <span className={CAPTION}>{caption}</span> : null}
          </div>
          {sparkline ? <div className={SPARK_SLOT}>{sparkline}</div> : null}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2.5 py-8 text-center">
          <span className="flex size-10 items-center justify-center rounded-full border border-hue-ink-200 bg-white">
            <LineChart className="size-5 text-hue-ink-300" aria-hidden="true" />
          </span>
          <p className="max-w-[36ch] text-pretty font-display text-title-sm font-semibold leading-snug text-hue-ink-600">
            {note}
          </p>
        </div>
      )}
    </div>
  );
};

export default PreviewCard;
