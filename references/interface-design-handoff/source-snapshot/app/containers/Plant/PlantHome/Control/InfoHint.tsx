const TIP =
  'pointer-events-none absolute bottom-full left-0 z-10 mb-1.5 w-[260px] origin-bottom-left scale-[0.97] rounded-lg border border-hue-ink-200 bg-white px-2.5 py-2 text-xs font-medium leading-[1.45] text-hue-ink-700 opacity-0 shadow-500 transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-100 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:group-hover:delay-100 group-focus-within:scale-100 group-focus-within:opacity-100 group-focus-within:transition-none motion-reduce:transition-none motion-reduce:scale-100';

const TRIGGER =
  'flex-none rounded-full p-0.5 text-hue-ink-400 transition-colors duration-100 ease-[ease] [@media(hover:hover)_and_(pointer:fine)]:hover:text-hue-ink-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-hue-sky-500';

const InfoHint = ({ id, label, content }: { id: string; label: string; content: string }) => (
  <span className="group relative inline-flex items-center">
    <button type="button" aria-label={`About ${label}`} aria-describedby={`${id}-tip`} className={TRIGGER}>
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="block">
        <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path d="M7 6.1v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="7" cy="4.2" r="0.85" fill="currentColor" />
      </svg>
    </button>
    <span id={`${id}-tip`} role="tooltip" className={TIP}>
      {content}
    </span>
  </span>
);

export default InfoHint;
