import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import StatusDot from './index';
import type { CanonicalStatus } from '~/utils/status';

const STATUSES: CanonicalStatus[] = ['normal', 'offline', 'warning', 'fault', 'anomaly'];

describe('StatusDot', () => {
  it('renders every status with its token background class', () => {
    for (const status of STATUSES) {
      expect(renderToStaticMarkup(<StatusDot status={status} />)).toContain(`bg-status-${status}`);
    }
  });

  it('renders the 2px white halo', () => {
    expect(renderToStaticMarkup(<StatusDot status="normal" />)).toContain('shadow-[0_0_0_2px_#fff]');
  });

  it('applies the DS sizes 7/9/11 with md at 9px', () => {
    expect(renderToStaticMarkup(<StatusDot status="normal" size="sm" />)).toContain('w-[7px]');
    expect(renderToStaticMarkup(<StatusDot status="normal" />)).toContain('w-[9px]');
    expect(renderToStaticMarkup(<StatusDot status="normal" size="lg" />)).toContain('w-[11px]');
  });

  it('keeps the aria-label when no visible label is shown', () => {
    const expectedLabels: Record<CanonicalStatus, string> = {
      normal: 'Normal',
      offline: 'Offline',
      warning: 'Warning',
      fault: 'Fault',
      anomaly: 'Anomaly',
    };
    for (const status of STATUSES) {
      expect(renderToStaticMarkup(<StatusDot status={status} />)).toContain(`aria-label="${expectedLabels[status]}"`);
    }
  });

  it('renders a visible label and hides the dot from screen readers', () => {
    const html = renderToStaticMarkup(<StatusDot status="warning" label="Grid warning" />);
    expect(html).toContain('Grid warning');
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain('aria-label');
    expect(html).toContain('gap-[7px]');
  });

  it('renders the pulse echo only when pulse is set', () => {
    expect(renderToStaticMarkup(<StatusDot status="fault" pulse />)).toContain('animate-status-pulse');
    expect(renderToStaticMarkup(<StatusDot status="fault" />)).not.toContain('animate-status-pulse');
  });

  it('passes through className', () => {
    expect(renderToStaticMarkup(<StatusDot status="fault" className="mr-1" />)).toContain('mr-1');
  });

  // The prop has four combinations of (label, decorative). The two non-decorative rows are covered
  // by the two aria tests above: no label announces via the dot's own aria-label, a label announces
  // via the visible text and hides the dot. These are the decorative half.
  describe('decorative', () => {
    it('hides the dot from screen readers and announces nothing', () => {
      for (const status of STATUSES) {
        const html = renderToStaticMarkup(<StatusDot status={status} decorative />);
        expect(html).toContain('aria-hidden="true"');
        expect(html).not.toContain('aria-label');
      }
    });

    it('still draws the dot at the same size, colour and halo', () => {
      const html = renderToStaticMarkup(<StatusDot status="fault" decorative />);
      expect(html).toContain('bg-status-fault');
      expect(html).toContain('w-[9px]');
      expect(html).toContain('shadow-[0_0_0_2px_#fff]');
    });

    it('leaves the announcing default untouched, set either way', () => {
      expect(renderToStaticMarkup(<StatusDot status="fault" />)).toContain('aria-label="Fault"');
      expect(renderToStaticMarkup(<StatusDot status="fault" decorative={false} />)).toContain('aria-label="Fault"');
    });

    it('cannot be combined with a visible label', () => {
      // @ts-expect-error decorative and label are mutually exclusive. Visible label text is itself
      // an accessible-name source, so it would be announced whatever decorative claims. The real
      // assertion is this directive: tsc fails the line if the props union ever loosens.
      const forbidden = <StatusDot status="warning" decorative label="Grid warning" />;
      expect(forbidden).toBeDefined();
    });
  });
});
