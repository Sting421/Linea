import { useFetcher, useParams } from '@remix-run/react';
import React, { useCallback, useEffect, useId, useState } from 'react';
import Spinner from '~/components/Spinner';
import { workModeLabel } from '~/utils/workMode';
import InverterFlowSocket from '../PlantHeader/InverterFlowSocket';
import { FlowFrame, PartialFigure, aggregateFrames } from '../PlantHeader/plantHeaderModel';
import { ControlAccess } from './controlAccess';
import { changeSummary, modeOptions, reserveChanged, reserveError, reserveSeed, selectableMode } from './controlModel';
import ModeSelect from './ModeSelect';
import ReserveField from './ReserveField';

const SAVE = [
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[9px] border border-hue-ink-300 bg-white px-4 py-[9px] text-[14px] font-semibold leading-[1.1] tracking-[0.005em] text-hue-ink-600',
  'transition-[color,background-color,border-color,transform] duration-150 [transition-timing-function:ease,ease,ease,cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none',
  '[@media(hover:hover)_and_(pointer:fine)]:hover:border-hue-sky-800 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-hue-sky-50 [@media(hover:hover)_and_(pointer:fine)]:hover:text-hue-sky-800',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-hue-sky-500',
  'active:scale-[0.97] motion-reduce:active:scale-100',
  'aria-[busy=true]:cursor-default aria-[busy=true]:border-hue-sky-800 aria-[busy=true]:text-hue-sky-800 aria-[busy=true]:active:scale-100',
  'disabled:cursor-not-allowed disabled:border-hue-ink-200 disabled:bg-hue-ink-50 disabled:text-hue-ink-400 disabled:active:scale-100',
  '[@media(hover:hover)_and_(pointer:fine)]:disabled:hover:border-hue-ink-200 [@media(hover:hover)_and_(pointer:fine)]:disabled:hover:bg-hue-ink-50 [@media(hover:hover)_and_(pointer:fine)]:disabled:hover:text-hue-ink-400',
].join(' ');

const RESET =
  'rounded-[6px] px-1 text-[0.8125rem] font-semibold text-hue-ink-600 transition-colors duration-150 ease-[ease] [@media(hover:hover)_and_(pointer:fine)]:hover:text-hue-sky-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-hue-sky-500 active:scale-[0.97] motion-reduce:active:scale-100';

const CHIP =
  'inline-flex items-center rounded-full bg-hue-ink-100 px-3 py-[5px] font-display text-xs font-semibold leading-none text-hue-ink-700';

const percent = (figure: PartialFigure | undefined): string | null =>
  figure && figure.value !== null ? `${Math.round(figure.value)}%` : null;

const reportingNote = (figure: PartialFigure | undefined): string | null =>
  figure && figure.value !== null && figure.reporting < figure.of ? `${figure.reporting} of ${figure.of} reporting` : null;

const Readout = ({ label, value, note }: { label: string; value: string; note?: string | null }) => (
  <div className="flex min-w-0 flex-col gap-1" title={note ?? undefined}>
    <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-hue-ink-500">{label}</span>
    <span className="font-display text-lg font-semibold tabular-nums text-hue-ink-900">{value}</span>
    {note && <span className="text-xs text-hue-ink-500">{note}</span>}
  </div>
);

type SavedPreferences = {
  working_mode?: string | null;
  reserved_battery_percentage?: number | string | null;
};

const ControlCard = ({
  plant,
  serials,
  socketBase,
  access,
}: {
  plant: PowerPlant | null;
  serials: string[];
  socketBase: string;
  access: ControlAccess;
}) => {
  const { plantId } = useParams();
  const fetcher = useFetcher<ActionData>();
  const id = useId();
  const [frames, setFrames] = useState<Record<string, FlowFrame>>({});
  const [chosenMode, setChosenMode] = useState<string | null>(null);
  const seed = reserveSeed(plant);
  const seedText = seed === null ? '' : String(seed);
  const [reserve, setReserve] = useState(seedText);
  const [engaged, setEngaged] = useState(false);

  const onFrame = useCallback((serial: string, frame: FlowFrame) => {
    setFrames((prev) => ({ ...prev, [serial]: frame }));
  }, []);

  const vitals = aggregateFrames(Object.values(frames), serials.length);
  const modes = vitals?.workingModes ?? null;
  const options = modeOptions(modes);
  const restMode = plant?.properties?.current_work_mode ?? null;
  const currentMode = vitals?.mode ?? restMode;
  const currentLabel = currentMode === 'Mixed' ? 'Mixed' : workModeLabel(currentMode, modes);
  const baseline = selectableMode(vitals?.mode, restMode);
  const selected = chosenMode ?? baseline;
  const unavailable = options.length === 0;
  const readOnly = access === 'read';
  const pending = fetcher.state !== 'idle';
  const problem = reserveError(reserve);
  const modeChanged = chosenMode !== null && chosenMode !== baseline;
  const reserveDirty = reserveChanged(reserve, seed);
  const dirty = modeChanged || reserveDirty;
  const canSave = !readOnly && !pending && !!plantId && !!selected && problem === null && dirty;
  const summary = changeSummary(
    modeChanged ? workModeLabel(chosenMode, modes) : null,
    reserveDirty && problem === null ? reserve.trim() : null,
  );

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.result) setChosenMode(null);
  }, [fetcher.state, fetcher.data]);

  const modeHint = unavailable
    ? currentLabel
      ? `Live data has not arrived, so the mode list is empty. Saving keeps ${currentLabel}.`
      : 'Live data has not arrived, so the mode list is empty and no mode can be saved yet.'
    : currentMode === 'Mixed'
      ? 'The inverters report different modes. Choose one to set them all.'
      : 'Applies to every inverter on this plant.';

  const reset = () => {
    setChosenMode(null);
    setReserve(seedText);
    setEngaged(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave || !plantId || !selected) return;
    fetcher.submit(
      {
        _action: 'adjustPreference',
        plant_id: plantId,
        working_mode: selected,
        reserved_battery_percentage: reserve.trim(),
      },
      { method: 'post', action: `/microgrids/${plantId}` },
    );
  };

  const result = fetcher.data?.result as SavedPreferences | undefined;
  const failure = fetcher.data?.errors?.adjustPreference ?? fetcher.data?.error ?? null;
  const savedLabel = result ? workModeLabel(result.working_mode ?? null, modes) : null;
  const savedReserve = result?.reserved_battery_percentage;
  const success = result
    ? savedLabel && savedReserve !== null && savedReserve !== undefined
      ? `Saved. The plant reported ${savedLabel} with a ${savedReserve}% reserve.`
      : 'Saved.'
    : null;

  return (
    <section aria-labelledby={`${id}-title`} className="flex w-full flex-col gap-5 rounded-[14px] bg-white p-5 shadow-500">
      {serials.map((serial) => (
        <InverterFlowSocket key={serial} socketBase={socketBase} serial={serial} refreshNonce={0} onFrame={onFrame} />
      ))}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <h3 id={`${id}-title`} className="truncate font-display text-lg font-semibold text-hue-sky-900">
            Plant Control
          </h3>
          <span className={CHIP}>Interim</span>
        </div>
        <span className="text-xs text-hue-ink-500">
          {readOnly ? 'Utility accounts are read-only on plant control.' : 'Work mode and backup reserve only.'}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-10 gap-y-3 rounded-[10px] border border-hue-ink-100 bg-hue-ink-50 px-4 py-3">
        <Readout label="Current Mode" value={currentLabel ?? '-'} note={vitals ? null : 'From the last plant record'} />
        <Readout label="Reported Reserve" value={seed === null ? '-' : `${seed}%`} />
        <Readout
          label="Live SOC"
          value={percent(vitals?.socPct) ?? '-'}
          note={vitals ? reportingNote(vitals.socPct) : 'Awaiting live data'}
        />
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="[container-type:inline-size]">
          <div className="grid grid-cols-1 gap-5 [@container(min-width:_560px)]:grid-cols-2">
            <ModeSelect
              value={selected}
              currentValue={currentMode === 'Mixed' ? null : currentMode}
              options={options}
              fallbackLabel={currentLabel}
              hint={modeHint}
              disabled={readOnly}
              unavailable={unavailable}
              onChange={setChosenMode}
            />
            <ReserveField
              id={`${id}-reserve`}
              value={reserve}
              seeded={seed !== null}
              engaged={engaged}
              error={problem}
              disabled={readOnly}
              onChange={setReserve}
              onEngage={() => setEngaged(true)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {dirty && summary && <p className="text-sm text-hue-ink-700">{summary}</p>}
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              className={SAVE}
              disabled={!pending && !canSave}
              aria-busy={pending || undefined}
              aria-disabled={pending || undefined}
            >
              {pending && <Spinner className="h-4 w-4" ignoreContainerClass />}
              {pending ? 'Saving' : 'Save'}
            </button>
            {dirty && !pending && !readOnly && (
              <button type="button" onClick={reset} className={RESET}>
                Reset
              </button>
            )}
            {failure ? (
              <p role="alert" className="text-sm text-status-fault-text">
                {failure}
              </p>
            ) : (
              success && (
                <p role="status" aria-live="polite" className="text-sm text-hue-ink-700">
                  {success}
                </p>
              )
            )}
          </div>
        </div>
      </form>
    </section>
  );
};

export default ControlCard;
