import React from 'react';
import { ModeOption } from './controlModel';
import { ModeIcon } from './modeIcons';

const CHIP =
  'inline-flex items-center rounded-full bg-hue-ink-100 px-3 py-[5px] font-display text-xs font-semibold leading-none text-hue-ink-700';

const REVEAL =
  'grid [grid-template-rows:0fr] transition-[grid-template-rows] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] group-data-[focus]/opt:[grid-template-rows:1fr] group-focus-visible/panel:transition-none motion-reduce:transition-none';

const REVEAL_BODY =
  'flex flex-col gap-1 pl-[28px] pt-1 opacity-0 transition-opacity duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] group-data-[focus]/opt:opacity-100 group-focus-visible/panel:transition-none motion-reduce:transition-none';

const LINK =
  'w-fit rounded-[4px] text-xs font-semibold text-hue-sky-800 underline-offset-2 [@media(hover:hover)_and_(pointer:fine)]:hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-hue-sky-500';

const stopSelection = (event: React.MouseEvent<HTMLAnchorElement>) => event.stopPropagation();

const ModeOptionRow = ({ option, isCurrent }: { option: ModeOption; isCurrent: boolean }) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="flex-none text-hue-ink-500 transition-colors duration-150 ease-[ease] group-data-[focus]/opt:text-hue-sky-800 group-data-[selected]/opt:text-hue-sky-800 motion-reduce:transition-none"
      >
        <ModeIcon modeId={option.value} className="size-[18px]" />
      </span>
      <span className="font-display text-[0.8125rem] font-semibold text-hue-ink-900">{option.label}</span>
      {isCurrent && <span className={CHIP}>Current</span>}
    </div>
    {(option.description || option.videoLink) && (
      <div className={REVEAL}>
        <div className="min-h-0 overflow-hidden">
          <div className={REVEAL_BODY}>
            {option.description && <p className="text-xs leading-[1.45] text-hue-ink-500">{option.description}</p>}
            {option.videoLink && (
              <a href={option.videoLink} target="_blank" rel="noreferrer" onClick={stopSelection} className={LINK}>
                Watch how it works
              </a>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);

export default ModeOptionRow;
