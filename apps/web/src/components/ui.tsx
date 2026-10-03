'use client';
import Link from 'next/link';
import { useId, useLayoutEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  Bell,
  Check,
  ChevronRight,
  Circle,
  Info,
  LayoutGrid,
  Settings,
  UserRound,
  LogOut,
} from 'lucide-react';
import { outcomes, tiers, concernLabel, formatTime, titleCase } from '@/lib/semantics';
import type { Alert, Outcome, Profile } from '@/lib/types';
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Linea home">
      <img src="/linea-mark.svg" alt="" width="42" height="42" />
      <span>
        linea<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
export function Avatar({
  name,
  size = 'small',
}: {
  name: string;
  size?: 'small' | 'large' | 'huge';
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('');
  return (
    <span className={`avatar ${size}`} aria-hidden="true">
      <span>{initials}</span>
    </span>
  );
}
export function Tooltip({
  trigger,
  children,
  className = '',
}: {
  trigger: (descriptionId: string | undefined) => React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const id = useId();
  const anchor = useRef<HTMLDivElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [position, setPosition] = useState({ left: 12, top: 12 });
  const open = (hovered || focused) && !dismissed;
  useLayoutEffect(() => {
    if (!open) return;
    function place() {
      if (!anchor.current || !popup.current) return;
      const rect = anchor.current.getBoundingClientRect();
      const box = popup.current.getBoundingClientRect();
      setPosition({
        left: Math.max(12, Math.min(rect.left, window.innerWidth - box.width - 12)),
        top:
          rect.bottom + box.height <= window.innerHeight - 12
            ? rect.bottom
            : Math.max(12, rect.top - box.height),
      });
    }
    place();
    function dismiss(event: KeyboardEvent) {
      if (event.key === 'Escape') setDismissed(true);
    }
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    window.addEventListener('keydown', dismiss);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('keydown', dismiss);
    };
  }, [open]);
  return (
    <div
      ref={anchor}
      className={`tooltip-anchor ${className}`}
      onMouseEnter={() => {
        setHovered(true);
        setDismissed(false);
      }}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => {
        setFocused(true);
        setDismissed(false);
      }}
      onBlur={() => setFocused(false)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setDismissed(true);
      }}
    >
      {trigger(open ? id : undefined)}
      <div
        ref={popup}
        id={id}
        role="tooltip"
        hidden={!open}
        className="tooltip-content"
        style={position}
      >
        {children}
      </div>
    </div>
  );
}
export function MetricHelp({
  label,
  children,
  iconOnly = false,
}: {
  label: string;
  children: React.ReactNode;
  iconOnly?: boolean;
}) {
  return (
    <Tooltip
      className="metric-help"
      trigger={(id) => (
        <button
          type="button"
          aria-label={iconOnly ? label : undefined}
          aria-describedby={id}
          className="metric-help-trigger"
        >
          <Info size={14} aria-hidden="true" />
          {!iconOnly && label}
        </button>
      )}
    >
      {children}
    </Tooltip>
  );
}
export function Shell({
  section,
  profile,
  children,
  setup = false,
  mode = process.env.NEXT_PUBLIC_LINEA_MODE ?? 'connected',
}: {
  section: string;
  profile: Profile | null;
  children: React.ReactNode;
  setup?: boolean;
  mode?: string;
}) {
  const items = [
    { path: '/', name: 'Monitoring', icon: LayoutGrid },
    { path: '/alerts', name: 'Alerts', icon: Bell },
    { path: '/profile', name: 'Elder profile', icon: UserRound },
    { path: '/settings', name: 'Settings', icon: Settings },
  ];
  async function signOut() {
    await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'signout' }),
    });
    location.assign('/sign-in');
  }
  return (
    <div className={`app-shell${setup ? ' setup-shell' : ''}`}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {!setup && (
        <aside className="sidebar">
          <Brand />
          <nav aria-label="Main navigation">
            {items.map((i) => (
              <Link
                key={i.path}
                href={i.path}
                className={section === i.name ? 'nav-link current' : 'nav-link'}
                aria-current={section === i.name ? 'page' : undefined}
              >
                <i.icon size={19} />
                <span>{i.name}</span>
                {section === i.name && <ChevronRight size={15} />}
              </Link>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="account">
              <Avatar name={mode === 'demo' ? 'Ana' : 'Family'} />
              <div>
                <strong>{mode === 'demo' ? 'Ana Santos' : 'Family workspace'}</strong>
                <small>Family account</small>
              </div>
            </div>
          </div>
        </aside>
      )}
      <div className="workspace">
        <header className="topbar">
          {setup ? (
            <Brand />
          ) : (
            <span className="breadcrumb">
              {profile?.preferred_name ?? 'Family'} <ChevronRight size={13} />
              <strong>{section}</strong>
            </span>
          )}
          <div className="topbar-actions">
            <span className="demo-label">
              <Circle size={7} fill="currentColor" /> {mode === 'demo' ? 'Demo' : 'Connected'}
            </span>
            <button className="icon-button" aria-label="Sign out" onClick={() => void signOut()}>
              <LogOut size={17} />
            </button>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
export function OutcomeBadge({ status }: { status: Outcome }) {
  const s = outcomes[status];
  return (
    <span className={`badge ${s.className}`}>
      <Circle size={7} fill="currentColor" />
      {s.short}
    </span>
  );
}
export function TierBadge({
  tier,
  assessment,
}: {
  tier: Alert['tier'];
  assessment?: Alert['assessment'];
}) {
  const s = tier ? tiers[tier] : { className: 'status-neutral', label: 'Assessment pending' };
  return (
    <span className={`badge ${s.className}`}>
      <Circle size={7} fill="currentColor" />
      {titleCase(s.label)}
      {tier && tier !== 'emergency' && assessment === 'pending' ? ' · Unresolved' : ''}
    </span>
  );
}
export function Panel({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`panel ${className}`}>{children}</section>;
}
export function Empty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-symbol">
        <Activity size={28} />
      </div>
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  );
}
export function AlertCard({
  alert,
  timezone,
  onHandle,
  disabled = false,
}: {
  alert: Alert;
  timezone: string;
  onHandle: () => void;
  disabled?: boolean;
}) {
  return (
    <article className="alert-entry">
      <div className="alert-card-heading">
        <div>
          <h3>
            {alert.concern === 'FALL' && alert.actual_fall === false
              ? 'Near-fall'
              : concernLabel(alert.concern)}
          </h3>
          <small>
            {formatTime(alert.created_at, timezone)}
            {alert.subject === 'other' ? ' · Another person' : ''}
          </small>
        </div>
        <TierBadge tier={alert.tier} assessment={alert.assessment} />
      </div>
      <p className="alert-evidence">
        {alert.quote
          ? `“${alert.quote}”`
          : alert.concern === 'CALL_CONNECTION'
            ? alert.reason
            : 'Detailed text expired'}
      </p>
      <div className="alert-entry-actions">
        <details className="alert-context">
          <summary>Details</summary>
          <dl>
            <div>
              <dt>Assessment</dt>
              <dd>{alert.reason}</dd>
            </div>
            <div>
              <dt>Notification</dt>
              <dd>
                {alert.notification_status === 'demo_recorded'
                  ? 'Demo recorded'
                  : alert.notification_status.replaceAll('_', ' ')}
              </dd>
            </div>
          </dl>
        </details>
        {alert.handled_at ? (
          <span className="handled">
            <Check size={14} />
            Handled
          </span>
        ) : (
          <button className="text-button" disabled={disabled} onClick={onHandle}>
            Mark handled <Check size={14} />
          </button>
        )}
        {alert.call_state === 'connected' && (
          <Link className="button primary compact" href={`/call/${alert.checkin_id}`}>
            Join call <ArrowUpRight size={16} />
          </Link>
        )}
      </div>
    </article>
  );
}
export function AlertLog({
  alerts,
  timezone,
  busy,
  onHandle,
}: {
  alerts: Alert[];
  timezone: string;
  busy: boolean;
  onHandle: (alert: Alert) => void;
}) {
  if (!alerts.length) return null;
  return (
    <div className="alert-log">
      <table className="data-table">
        <caption className="sr-only">Concern and connection alert log</caption>
        <colgroup>
          <col className="log-col-date" />
          <col className="log-col-concern" />
          <col className="log-col-level" />
          <col className="log-col-evidence" />
          <col className="log-col-status" />
          <col className="log-col-actions" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">Recorded</th>
            <th scope="col">Concern</th>
            <th scope="col">Level</th>
            <th scope="col">Reported detail</th>
            <th scope="col">Status</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((a) => (
            <tr key={a.id}>
              <td data-label="Recorded">
                <time dateTime={a.created_at}>
                  {a.local_date ??
                    new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(
                      new Date(a.created_at),
                    )}
                  <small>{formatTime(a.created_at, timezone)}</small>
                </time>
              </td>
              <td data-label="Concern">
                <strong>
                  {a.concern === 'FALL' && a.actual_fall === false
                    ? 'Near-fall'
                    : concernLabel(a.concern)}
                </strong>
                {a.subject === 'other' && <small>Another person</small>}
              </td>
              <td data-label="Level">
                <TierBadge tier={a.tier} assessment={a.assessment} />
              </td>
              <td className="log-evidence" data-label="Reported detail">
                <p>
                  {a.quote
                    ? `“${a.quote}”`
                    : a.concern === 'CALL_CONNECTION'
                      ? a.reason
                      : 'Detailed text expired'}
                </p>
                <details className="alert-context">
                  <summary>Assessment details</summary>
                  <dl>
                    <div>
                      <dt>Assessment</dt>
                      <dd>{a.reason}</dd>
                    </div>
                    <div>
                      <dt>Notification</dt>
                      <dd>
                        {a.notification_status === 'demo_recorded'
                          ? 'Demo recorded'
                          : a.notification_status.replaceAll('_', ' ')}
                      </dd>
                    </div>
                  </dl>
                </details>
              </td>
              <td data-label="Status">
                {a.handled_at ? (
                  <span className="handled">
                    <Check size={13} />
                    Handled
                  </span>
                ) : (
                  <span className="review-state">Open</span>
                )}
              </td>
              <td className="log-actions" data-label="Actions">
                {a.call_state === 'connected' && (
                  <Link className="button primary compact" href={`/call/${a.checkin_id}`}>
                    Join call
                  </Link>
                )}
                {!a.handled_at && (
                  <button disabled={busy} className="text-button" onClick={() => onHandle(a)}>
                    Mark handled
                  </button>
                )}
                {a.local_date && (
                  <Link className="text-button" href={`/day/${a.local_date}`}>
                    Day record <ArrowUpRight size={13} />
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
