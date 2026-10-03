import clsx from 'clsx';
import { ReactNode, createContext, useContext } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import FallBackUi from '../FallBack';
import HelpHint from '../HelpHint';

export const CardActionsContext = createContext<ReactNode>(null);

export const CardSeamlessContext = createContext(false);

interface Props {
  children: any;
  title?: any;
  subtitle?: any;
  className?: any;
  titleClassName?: any;
  helperContent?: any;
}

const GraphWrapper: React.FC<Props> = ({ children, title, subtitle, className, titleClassName, helperContent }) => {
  const cardActions = useContext(CardActionsContext);
  const seamless = useContext(CardSeamlessContext);

  return (
    <ClientOnly fallback={<FallBackUi />}>
      {() => (
        <div
          className={clsx(
            'h-auto',
            !seamless && 'shadow-500 rounded-[14px] bg-white px-[1.125rem] py-5',
            className,
          )}
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-col">
              {title && (
                <div
                  className={clsx(
                    'truncate font-display text-lg font-semibold leading-6 text-hue-sky-900',
                    titleClassName,
                  )}
                >
                  {title}
                </div>
              )}
              {subtitle && <div className="font-normal text-sm leading-5 text-hue-ink-500">{subtitle}</div>}
            </div>
            {(cardActions || helperContent) && (
              <div className="relative z-20 flex flex-none items-center gap-2">
                {helperContent && (
                  <div
                    className={clsx(
                      cardActions &&
                        !seamless &&
                        'transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] [@media(hover:hover)_and_(pointer:fine)]:translate-x-10 group-hover:translate-x-0 group-focus-within:translate-x-0 motion-reduce:transition-none',
                    )}
                  >
                    <HelpHint
                      content={helperContent}
                      label={typeof title === 'string' ? title : undefined}
                      placement={seamless ? 'left' : 'below'}
                    />
                  </div>
                )}
                {cardActions}
              </div>
            )}
          </div>
          {children}
        </div>
      )}
    </ClientOnly>
  );
};

export default GraphWrapper;
