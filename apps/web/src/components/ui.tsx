'use client';
import Link from 'next/link';
import {
  Activity,
  ArrowUpRight,
  Bell,
  Check,
  ChevronRight,
  Circle,
  HeartHandshake,
  LayoutGrid,
  Settings,
  UserRound,
  LogOut,
} from 'lucide-react';
import { outcomes, tiers, concernLabel, formatTime } from '@/lib/semantics';
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
export function Shell({
  section,
  profile,
  children,
}: {
  section: string;
  profile: Profile | null;
  children: React.ReactNode;
}) {
  const items = [
    { path: '/', name: 'Monitoring', icon: LayoutGrid },
    { path: '/alerts', name: 'Alerts', icon: Bell },
    { path: '/profile', name: 'Elder profile', icon: UserRound },
    { path: '/settings', name: 'Settings', icon: Settings },
  ];
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <Brand />
        <p className="sidebar-caption">A LITTLE CLOSER, EVERY DAY</p>
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
          <div className="sidebar-note">
            <HeartHandshake size={25} />
            <p>
              One call.
              <br />A little peace of mind.
            </p>
            <span>
              Keeping families connected,
              <br />
              one LINEA at a time
            </span>
          </div>
          <div className="account">
            <div className="avatar small">A</div>
            <div>
              <strong>Ana&apos;s family</strong>
              <small>Family workspace</small>
            </div>
            <button
              className="icon-button"
              aria-label="Sign out"
              onClick={async () => {
                await fetch('/api/session', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'signout' }),
                });
                location.assign('/sign-in');
              }}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span className="breadcrumb">
            Your family <ChevronRight size={13} />
            <strong>{section}</strong>
          </span>
          <span className="demo-label">
            <Circle size={7} fill="currentColor" /> Demo workspace
          </span>
        </header>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer className="page-footer">
          <span>Linea · lin-ya · a line that connects</span>
          <span>{profile?.timezone ?? 'Voice-first care'}</span>
        </footer>
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
export function TierBadge({ tier }: { tier: Alert['tier'] }) {
  const s = tier ? tiers[tier] : { className: 'status-neutral', label: 'Assessment pending' };
  return (
    <span className={`badge ${s.className}`}>
      <Circle size={7} fill="currentColor" />
      {s.label}
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
}: {
  alert: Alert;
  timezone: string;
  onHandle: () => void;
}) {
  return (
    <article className="alert-card">
      <div className="alert-card-heading">
        <span className="alert-symbol">
          <Bell size={17} />
        </span>
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
        <TierBadge tier={alert.tier} />
      </div>
      {alert.quote ? (
        <blockquote>“{alert.quote}”</blockquote>
      ) : (
        <p className="muted">
          {alert.concern === 'CALL_CONNECTION' ? alert.reason : 'Detailed text expired'}
        </p>
      )}
      <p className="alert-reason">{alert.reason}</p>
      <div className="alert-card-footer">
        <small>
          {alert.notification_status === 'demo_recorded'
            ? 'Demo notification recorded'
            : alert.notification_status}
        </small>
        {alert.handled_at ? (
          <span className="handled">
            <Check size={14} />
            Handled
          </span>
        ) : (
          <button className="text-button" onClick={onHandle}>
            Mark handled <Check size={14} />
          </button>
        )}
      </div>
      {alert.call_state === 'connected' && (
        <Link className="button primary full" href={`/call/${alert.checkin_id}`}>
          Join call <ArrowUpRight size={16} />
        </Link>
      )}
    </article>
  );
}
