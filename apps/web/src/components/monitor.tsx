'use client';
import Link from 'next/link';
import {
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Phone,
  ShieldCheck,
  Pill,
  Check,
  Minus,
  Bell,
} from 'lucide-react';
import type { Dashboard, CheckIn } from '@/lib/types';
import {
  aggregateDays,
  monthMetrics,
  localDate,
  formatDate,
  formatTime,
  callLabel,
  concernLabel,
} from '@/lib/semantics';
import { Panel, Empty, OutcomeBadge, AlertCard } from './ui';

export function Monitoring({
  data,
  month,
  setMonth,
  onCall,
  onHandle,
  busy,
}: {
  data: Dashboard;
  month: string;
  setMonth: (v: string) => void;
  onCall: () => void;
  onHandle: (a: Dashboard['alerts'][number]) => void;
  busy: boolean;
}) {
  const p = data.profile!;
  const calls = data.checkins.filter((c) => c.local_date.startsWith(month));
  const metrics = monthMetrics(calls);
  const active = data.checkins.find((c) => c.state !== 'ended');
  const today = localDate(p.timezone);
  const [y, m] = month.split('-').map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7;
  const unhandled = data.alerts.filter((a) => !a.handled_at);
  const heading = new Intl.DateTimeFormat('en', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(first);
  function move(delta: number) {
    const d = new Date(Date.UTC(y, m - 1 + delta, 1));
    setMonth(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR DAILY CONNECTION</p>
          <h1>A little closer to home.</h1>
          <p>Check in on {p.preferred_name}, wherever you are.</p>
        </div>
        <Link className="button secondary" href="/profile">
          <ShieldCheck size={17} /> Elder profile
        </Link>
      </div>
      <Panel className="connection-card">
        <div className="connection-profile">
          <div className="avatar large">
            {p.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div>
            <span className="eyebrow">YOUR LOVED ONE</span>
            <h2>{p.preferred_name}</h2>
            <p>
              {p.name} <span className="text-dot">·</span> Daily voice check-in
            </p>
          </div>
        </div>
        <div className="connection-schedule">
          <span className="eyebrow">{active ? 'CURRENT CHECK-IN' : 'DAILY CALL'}</span>
          <strong>{active ? callLabel(active.state) : p.call_time}</strong>
          <span>
            <Clock3 size={14} />
            {p.timezone.replace('_', ' ')}
          </span>
        </div>
        <div className="connection-action">
          {active ? (
            <Link className="button primary" href={`/call/${active.id}`}>
              {active.state === 'connected' ? 'Join call' : 'View call'}
              <ArrowUpRight size={17} />
            </Link>
          ) : (
            <button
              className="button primary"
              disabled={busy || p.consent === 'declined'}
              onClick={onCall}
            >
              <Phone size={17} />
              {busy ? 'Starting…' : 'Call now'}
            </button>
          )}
          <small>
            {p.consent === 'pending'
              ? 'Consent is asked on the first call'
              : p.consent === 'declined'
                ? 'Calling stopped · consent declined'
                : 'Demo · no phone call is placed'}
          </small>
        </div>
      </Panel>
      <div className="stat-grid">
        <Panel className="stat-card">
          <span className="stat-icon">
            <Phone size={19} />
          </span>
          <span className="eyebrow">CHECK-INS COMPLETED</span>
          <div className="stat-value">
            {metrics.completed}
            <span> / {metrics.total}</span>
          </div>
          <p>{heading} · logical check-ins</p>
        </Panel>
        <Panel className="stat-card">
          <span className="stat-icon">
            <Pill size={19} />
          </span>
          <span className="eyebrow">MEDICINE REPORTED TAKEN</span>
          <div className="stat-value">
            {metrics.medicine.taken}
            <span> / {metrics.dosePeriods}</span>
          </div>
          <p>Reported dose periods · not verified doses</p>
        </Panel>
        <Panel className="stat-card">
          <span className="stat-icon accent">
            <Bell size={19} />
          </span>
          <span className="eyebrow">AWAITING FAMILY REVIEW</span>
          <div className="stat-value">
            {unhandled.length}
            <span> alerts</span>
          </div>
          <Link className="text-button" href="/alerts">
            Open alert history <ArrowUpRight size={14} />
          </Link>
        </Panel>
      </div>
      <div className="monitor-grid">
        <Panel className="calendar-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">ONE DAY AT A TIME</p>
              <h2>Check-in calendar</h2>
            </div>
            <CalendarDays size={19} />
          </div>
          <div className="month-navigation">
            <h3>{heading}</h3>
            <div>
              <button className="icon-button" aria-label="Previous month" onClick={() => move(-1)}>
                <ChevronLeft size={18} />
              </button>
              <button
                className="icon-button"
                aria-label="Next month"
                onClick={() => move(1)}
                disabled={month >= today.slice(0, 7)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="calendar" role="group" aria-label={`${heading} check-in outcomes`}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <span className="weekday" key={i} aria-hidden="true">
                {d}
              </span>
            ))}
            {Array.from({ length: offset }, (_, i) => (
              <span key={`empty-${i}`} />
            ))}
            {Array.from({ length: count }, (_, i) => {
              const date = `${month}-${String(i + 1).padStart(2, '0')}`,
                status = metrics.days[date];
              const future = date > today;
              return (
                <Link
                  href={`/day/${date}`}
                  key={date}
                  className={`calendar-day ${status ? `day-${status}` : 'day-empty'} ${date === today ? 'today' : ''} ${future ? 'future' : ''}`}
                  aria-label={`${formatDate(date)}: ${status === 'red' ? 'Family attention required' : status === 'yellow' ? 'Needs a look' : status === 'green' ? 'Completed normally' : future ? 'Upcoming' : 'No check-in recorded'}`}
                >
                  <span>{i + 1}</span>
                  <span className="day-indicator">
                    {status === 'green' ? (
                      <Check size={11} />
                    ) : status === 'yellow' ? (
                      <Minus size={11} />
                    ) : status === 'red' ? (
                      <Bell size={10} />
                    ) : (
                      <span />
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="calendar-key">
            <span>
              <i className="key-dot green" />
              Completed
            </span>
            <span>
              <i className="key-dot yellow" />
              Attention
            </span>
            <span>
              <i className="key-dot red" />
              Priority
            </span>
            <span>
              <i className="key-dot neutral" />
              No record
            </span>
          </div>
          <p className="fine-print">
            Colors describe recorded outcomes. They do not establish medical safety.
          </p>
        </Panel>
        <Panel className="attention-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">WHEN YOU’RE NEEDED</p>
              <h2>Family attention</h2>
            </div>
            <Link className="icon-button" href="/alerts" aria-label="All alerts">
              <ArrowUpRight size={19} />
            </Link>
          </div>
          {unhandled.length ? (
            <AlertCard
              alert={unhandled[0]}
              timezone={p.timezone}
              onHandle={() => onHandle(unhandled[0])}
            />
          ) : (
            <Empty
              title="Nothing awaiting review"
              body="New concerns and call updates will appear here."
            />
          )}
          <div className="reassurance-note">
            <ShieldCheck size={19} />
            <p>
              Linea listens. You stay connected.
              <br />
              <span>Every concern keeps its context and history.</span>
            </p>
          </div>
        </Panel>
      </div>
      <Panel className="month-summary">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">THE MONTH SO FAR</p>
            <h2>A clearer picture, at a glance.</h2>
          </div>
          <span className="muted small-text">
            {heading} · {p.timezone}
          </span>
        </div>
        <div className="summary-grid">
          <Distribution
            title="Recorded day outcomes"
            total={Object.keys(metrics.days).length}
            rows={[
              {
                label: 'Completed normally',
                value: metrics.outcomes.green,
                color: 'var(--status-green)',
              },
              {
                label: 'Needs a look',
                value: metrics.outcomes.yellow,
                color: 'var(--status-yellow)',
              },
              {
                label: 'Family attention',
                value: metrics.outcomes.red,
                color: 'var(--status-red)',
              },
            ]}
          />
          <Distribution
            title={`${p.medicine} reports`}
            total={metrics.dosePeriods}
            rows={[
              {
                label: 'Reported taken',
                value: metrics.medicine.taken,
                color: 'var(--purple-light)',
              },
              {
                label: 'Reported not taken',
                value: metrics.medicine.not_taken,
                color: 'var(--yellow)',
              },
              { label: 'Unknown', value: metrics.medicine.unknown, color: 'var(--text-muted)' },
            ]}
          />
        </div>
        <p className="fine-print">
          Coverage: {Object.keys(metrics.days).length} days with records. Missing days are not
          missed doses. Repeat call legs count within their check-in.
        </p>
      </Panel>
    </>
  );
}
export function Distribution({
  title,
  total,
  rows,
}: {
  title: string;
  total: number;
  rows: { label: string; value: number; color: string }[];
}) {
  return (
    <div className="distribution">
      <h3>{title}</h3>
      {total ? (
        <>
          <div
            className="distribution-track"
            role="img"
            aria-label={rows.map((r) => `${r.label}: ${r.value} of ${total}`).join('; ')}
          >
            {rows
              .filter((r) => r.value)
              .map((r) => (
                <span
                  key={r.label}
                  style={{ width: `${(r.value / total) * 100}%`, background: r.color }}
                />
              ))}
          </div>
          <table className="distribution-table">
            <caption className="sr-only">
              {title}, {total} records
            </caption>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row">
                    <i style={{ background: r.color }} />
                    {r.label}
                  </th>
                  <td>
                    {r.value}
                    <span> / {total}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p className="muted">No reports in this month yet.</p>
      )}
    </div>
  );
}
export function DayView({
  date,
  data,
  onHandle,
}: {
  date: string;
  data: Dashboard;
  onHandle: (a: Dashboard['alerts'][number]) => void;
}) {
  const p = data.profile!,
    calls = data.checkins.filter((c) => c.local_date === date);
  return (
    <>
      <Link href="/" className="back-link">
        <ChevronLeft size={16} /> Back to monitoring
      </Link>
      <div className="page-heading">
        <div>
          <p className="eyebrow">{p.preferred_name.toUpperCase()}’S CHECK-IN</p>
          <h1>{formatDate(date)}</h1>
          <p>Every answer and call attempt, together.</p>
        </div>
        {aggregateDays(calls)[date] && <OutcomeBadge status={aggregateDays(calls)[date]} />}
      </div>
      {calls.length ? (
        calls.map((c) => (
          <Panel className="day-detail" key={c.id}>
            <div className="panel-heading">
              <h2>{callLabel(c.state)}</h2>
              {c.state !== 'ended' && (
                <Link href={`/call/${c.id}`} className="button primary">
                  View call <ArrowUpRight size={16} />
                </Link>
              )}
            </div>
            <p className="summary-copy">
              {c.text_expired
                ? 'Detailed text expired'
                : c.summary ||
                  'The check-in is still in progress. Answers and concerns will appear as they are recorded.'}
            </p>
            <div className="medicine-readout">
              <Pill size={22} />
              <div>
                <span className="eyebrow">{p.medicine}</span>
                <strong>
                  {c.medicine_result === 'taken'
                    ? 'Reported taken'
                    : c.medicine_result === 'not_taken'
                      ? 'Reported not taken'
                      : 'Unknown'}
                </strong>
                <small>
                  As reported during this check-in
                  {c.medicine_due === false ? ' · Dose not yet due' : ''}
                </small>
              </div>
            </div>
            {c.alerts.map((a) => (
              <AlertCard
                key={a.id}
                alert={{ ...a, checkin_id: c.id, call_state: c.state }}
                timezone={p.timezone}
                onHandle={() => onHandle({ ...a, checkin_id: c.id })}
              />
            ))}
            <h3 className="section-label">Call attempts</h3>
            <ol className="attempt-list">
              {c.legs.map((l, i) => (
                <li key={l.id}>
                  <span className="attempt-number">{i + 1}</span>
                  <div>
                    <strong>
                      {l.kind === 'reconnect'
                        ? 'Reconnection'
                        : l.kind === 'retry'
                          ? 'Scheduled retry'
                          : l.kind === 'manual'
                            ? 'Manual call'
                            : 'Initial call'}
                    </strong>
                    <small>
                      {formatTime(l.started_at, p.timezone)} · {l.state.replace('_', ' ')}
                    </small>
                  </div>
                </li>
              ))}
            </ol>
            {c.retry_at && (
              <p className="notice">
                {callLabel(c.state)} · {formatTime(c.retry_at, p.timezone)}
              </p>
            )}
            <details className="transcript">
              <summary>
                Conversation transcript <ChevronRight size={16} />
              </summary>
              {c.text_expired ? (
                <p>Detailed text expired</p>
              ) : c.transcript.length ? (
                <ol>
                  {c.transcript.map((t, i) => (
                    <li key={i}>
                      <span>
                        {t.speaker === 'elder' ? p.preferred_name : 'Linea'} ·{' '}
                        {formatTime(t.at, p.timezone)}
                      </span>
                      <p>{t.text}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p>No conversation captured yet.</p>
              )}
            </details>
            <p className="fine-print">
              Handling an alert preserves its history and the day&apos;s outcome.
            </p>
          </Panel>
        ))
      ) : (
        <Panel>
          <Empty
            title="No check-in recorded"
            body={
              date > localDate(p.timezone)
                ? `The daily call is scheduled for ${p.call_time} in ${p.timezone}.`
                : 'No check-in was recorded for this day. Medicine status is unknown.'
            }
          />
        </Panel>
      )}
    </>
  );
}
