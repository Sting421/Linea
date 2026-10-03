import HelpIcon from 'icons/HelpIcon';
import { useId, useState } from 'react';

const TRIGGER =
  'group/help relative inline-flex size-8 flex-none items-center justify-center rounded-full text-hue-ink-400 transition-colors duration-150 ease-[ease] [@media(hover:hover)_and_(pointer:fine)]:hover:text-hue-sky-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-hue-sky-500 motion-reduce:transition-none';

const TIP =
  'pointer-events-none absolute z-10 rounded-[7px] bg-hue-ink-900 px-[9px] py-[5px] text-left text-[12.5px] font-medium leading-snug text-hue-ink-100 opacity-0 transition-opacity duration-100 ease-[ease] [@media(hover:hover)_and_(pointer:fine)]:group-hover/help:opacity-100 group-focus-visible/help:opacity-100 data-[open=true]:opacity-100 motion-reduce:transition-none';

export type HelpHintPlacement = 'below' | 'left';

const PLACEMENT: Record<HelpHintPlacement, { tip: string; arrow: string }> = {
  below: { tip: 'right-0 top-full mt-2 w-72', arrow: '-top-1 right-3' },
  left: { tip: 'right-full top-1/2 mr-2 w-96 -translate-y-1/2', arrow: '-right-1 top-1/2 -translate-y-1/2' },
};

const HelpHint = ({
  content,
  label,
  placement = 'below',
}: {
  content?: string;
  label?: string;
  placement?: HelpHintPlacement;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const tipId = useId();

  if (!content) return null;

  return (
    <button
      type="button"
      aria-label={label ? `About ${label}` : 'About this card'}
      aria-describedby={tipId}
      aria-expanded={isOpen}
      onClick={() => setIsOpen((open) => !open)}
      onBlur={() => setIsOpen(false)}
      className={TRIGGER}
    >
      <HelpIcon className="size-4" aria-hidden="true" />
      <span id={tipId} role="tooltip" data-open={isOpen} className={`${TIP} ${PLACEMENT[placement].tip}`}>
        {content}
        <span
          className={`absolute ${PLACEMENT[placement].arrow} size-2 rotate-45 bg-hue-ink-900`}
          aria-hidden="true"
        />
      </span>
    </button>
  );
};

export default HelpHint;
