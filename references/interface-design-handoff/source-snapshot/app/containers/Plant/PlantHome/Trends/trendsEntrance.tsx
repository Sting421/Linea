import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

export const ENTRANCE_MS = 800;

export const ENTRANCE_STAGGER_MS = 60;

const ENTRANCE_SERIES_CAP = 10;

export const EntranceDelay = createContext(0);

const prefersStill = () =>
  typeof window === 'undefined' || !window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const entranceLength = (delay: number) => delay + ENTRANCE_MS + ENTRANCE_STAGGER_MS * ENTRANCE_SERIES_CAP;

export const useEntrance = () => {
  const delay = useContext(EntranceDelay);
  const [active, setActive] = useState(() => !prefersStill());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const settle = useCallback(() => {
    if (timer.current) return;
    timer.current = setTimeout(() => setActive(false), entranceLength(delay));
  }, [delay]);

  return useCallback(
    (index = 0) => ({
      isAnimationActive: active,
      animationBegin: delay + Math.min(index, ENTRANCE_SERIES_CAP) * ENTRANCE_STAGGER_MS,
      animationDuration: ENTRANCE_MS,
      animationEasing: 'ease-out' as const,
      onAnimationStart: settle,
    }),
    [active, delay, settle],
  );
};

export const riseBaseline = (bottoms: number[]) => (bottoms.length ? Math.max(...bottoms) : null);

const RISE: Keyframe[] = [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }];

export const useStackRise = () => {
  const delay = useContext(EntranceDelay);
  const risen = useRef(false);
  const release = useRef<() => void>();

  return useCallback(
    (root: HTMLElement | null) => {
      release.current?.();
      release.current = undefined;
      if (!root || risen.current || prefersStill() || typeof MutationObserver === 'undefined') return;

      const rising = new WeakSet<Element>();
      let leader: Animation | undefined;
      let origin = '';

      const observer = new MutationObserver(() => rise());
      const stop = () => observer.disconnect();
      const rise = () => {
        const layers = [...root.querySelectorAll<SVGGElement>('.recharts-bar')].filter((layer) => !rising.has(layer));
        if (!layers.length) return;
        if (!leader) {
          const baseline = riseBaseline(
            [...root.querySelectorAll<SVGGraphicsElement>('.recharts-bar-rectangle path')].map((mark) => {
              const box = mark.getBBox();
              return box.y + box.height;
            }),
          );
          if (baseline === null) return;
          origin = `0px ${baseline}px`;
        }
        for (const layer of layers) {
          rising.add(layer);
          layer.style.transformBox = 'view-box';
          layer.style.transformOrigin = origin;
          const animation = layer.animate(RISE, {
            duration: ENTRANCE_MS,
            delay,
            easing: 'ease-out',
            fill: 'backwards',
          });
          if (!leader) {
            leader = animation;
            risen.current = true;
            leader.finished.then(stop, stop);
          } else {
            const lead = leader;
            lead.ready.then(() => {
              animation.startTime = lead.startTime;
            }, stop);
          }
        }
      };

      observer.observe(root, { childList: true, subtree: true });
      rise();
      release.current = stop;
    },
    [delay],
  );
};
