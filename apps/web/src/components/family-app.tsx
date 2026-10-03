'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, RefreshCw, ShieldCheck, ArrowRight, Check } from 'lucide-react';
import { api, post } from '@/lib/api';
import { localDate } from '@/lib/semantics';
import type { Dashboard, Alert, CheckIn } from '@/lib/types';
import { Shell, Panel, Empty, AlertCard } from './ui';
import { Monitoring, DayView } from './monitor';
import { Onboarding } from './onboarding';
import { LiveCall } from './live-call';
export function FamilyApp({
  section = 'Monitoring',
  date,
  callId,
}: {
  section?: string;
  date?: string;
  callId?: string;
}) {
  const router = useRouter();
  const [data, setData] = useState<Dashboard | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(''),
    [month, setMonth] = useState(''),
    [filter, setFilter] = useState('open');
  const refresh = useCallback(async () => {
    try {
      const d = await api<Dashboard>('dashboard');
      setData(d);
      setMonth((m) => m || localDate(d.profile?.timezone ?? 'Asia/Manila').slice(0, 7));
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), 5000);
    return () => clearInterval(id);
  }, [refresh]);
  async function handle(a: Alert) {
    setBusy(true);
    try {
      await post(`checkins/${a.checkin_id}/alerts/${a.id}/handle`);
      setNotice('Alert marked handled. Its history and day outcome are preserved.');
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function callNow() {
    setBusy(true);
    try {
      const c = await post<CheckIn>(`profiles/${data!.profile!.id}/call`);
      router.push(`/call/${c.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Shell section={section} profile={data?.profile ?? null}>
      {error && (
        <div className="error-banner" role="alert">
          <p>{error}</p>
          <button className="text-button" onClick={() => void refresh()}>
            <RefreshCw size={15} /> Try again
          </button>
        </div>
      )}
      {notice && (
        <div className="success-banner" role="status">
          <Check size={16} />
          <span>{notice}</span>
          <button className="text-button" aria-label="Dismiss notice" onClick={() => setNotice('')}>
            Dismiss
          </button>
        </div>
      )}
      {!data ? (
        <div className="loading-state" role="status">
          <div className="skeleton skeleton-heading" />
          <div className="skeleton skeleton-card" />
          <p>Loading your family workspace…</p>
        </div>
      ) : !data.profile || section === 'Elder profile' ? (
        <Onboarding
          key={data.profile?.id ?? 'new'}
          profile={data.profile ?? undefined}
          onSaved={async () => {
            setNotice('Profile saved. Elder consent is recorded during the first call.');
            await refresh();
            router.push('/');
          }}
        />
      ) : date ? (
        <DayView date={date} data={data} onHandle={(a) => void handle(a)} />
      ) : callId ? (
        data.checkins.find((c) => c.id === callId) ? (
          <LiveCall
            call={data.checkins.find((c) => c.id === callId)!}
            profile={data.profile}
            refresh={refresh}
          />
        ) : (
          <Panel>
            <Empty
              title="Call not found"
              body="This check-in is unavailable or you do not have access to it."
              action={
                <Link href="/" className="button secondary">
                  Back to monitoring
                </Link>
              }
            />
          </Panel>
        )
      ) : section === 'Alerts' ? (
        <>
          <div className="page-heading">
            <div>
              <p className="eyebrow">CONTEXT FOR EVERY CONCERN</p>
              <h1>Stay informed. Be there.</h1>
              <p>Review what was reported and decide how to follow up.</p>
            </div>
            <span className="badge status-neutral">
              {data.alerts.filter((a) => !a.handled_at).length} awaiting review
            </span>
          </div>
          <div className="filter-bar" role="group" aria-label="Alert history filter">
            {[
              { id: 'open', label: 'Awaiting review' },
              { id: 'all', label: 'All alerts' },
              { id: 'handled', label: 'Handled' },
            ].map((f) => (
              <button
                key={f.id}
                aria-pressed={filter === f.id}
                className={filter === f.id ? 'filter-option selected' : 'filter-option'}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="alerts-grid">
            {data.alerts
              .filter(
                (a) => filter === 'all' || (filter === 'open' ? !a.handled_at : !!a.handled_at),
              )
              .map((a) => (
                <Panel key={a.id}>
                  <AlertCard
                    alert={a}
                    timezone={data.profile!.timezone}
                    onHandle={() => void handle(a)}
                  />
                  {a.local_date && (
                    <Link className="text-button alert-day-link" href={`/day/${a.local_date}`}>
                      View day record <ArrowRight size={14} />
                    </Link>
                  )}
                </Panel>
              ))}
          </div>
          {!data.alerts.some(
            (a) => filter === 'all' || (filter === 'open' ? !a.handled_at : !!a.handled_at),
          ) && (
            <Panel>
              <Empty
                title="No alerts in this view"
                body="Concern and connection updates will stay here with their context."
              />
            </Panel>
          )}
        </>
      ) : section === 'Settings' ? (
        <SettingsView setNotice={setNotice} />
      ) : (
        <Monitoring
          data={data}
          month={month}
          setMonth={setMonth}
          onCall={() => void callNow()}
          onHandle={(a) => void handle(a)}
          busy={busy}
        />
      )}
    </Shell>
  );
}
function SettingsView({ setNotice }: { setNotice: (v: string) => void }) {
  const [config, setConfig] = useState<{
      mode: string;
      checks: { name: string; state: string }[];
    } | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    api<{ mode: string; checks: { name: string; state: string }[] }>('configuration')
      .then(setConfig)
      .catch((e) => setError(e.message));
  }, []);
  async function enablePush() {
    setBusy(true);
    setError('');
    try {
      const key = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY;
      if (!key)
        throw new Error('Web push is not connected yet. In-app alerts are available in the demo.');
      if (!('serviceWorker' in navigator) || !('PushManager' in window))
        throw new Error('This browser does not support web push. Use the in-app alert list.');
      const permission = await Notification.requestPermission();
      if (permission !== 'granted')
        throw new Error('Notifications are not allowed. In-app alerts remain available.');
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      const padded = key
        .padEnd(Math.ceil(key.length / 4) * 4, '=')
        .replaceAll('-', '+')
        .replaceAll('_', '/');
      const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: bytes,
      });
      await post('push/subscriptions', subscription.toJSON());
      setNotice('Browser subscription saved. Delivery still requires the connected push service.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">MAKE THE CONNECTION YOURS</p>
          <h1>Your workspace, thoughtfully set up.</h1>
          <p>Notifications, data practices, and connection status.</p>
        </div>
      </div>
      <div className="settings-grid">
        <Panel>
          <div className="panel-heading">
            <h2>Family notifications</h2>
            <Bell size={20} />
          </div>
          <p className="muted">
            Concern and call updates are always available in the alert list. Connect web push to
            receive an update outside the app.
          </p>
          <button className="button primary" disabled={busy} onClick={() => void enablePush()}>
            {busy ? 'Setting up…' : 'Enable browser notifications'}
          </button>
          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}
        </Panel>
        <Panel>
          <div className="panel-heading">
            <h2>Your family’s information</h2>
            <ShieldCheck size={20} />
          </div>
          <dl className="data-rules">
            <div>
              <dt>Detailed text</dt>
              <dd>90 days</dd>
            </div>
            <div>
              <dt>Structured check-in history</dt>
              <dd>365 days</dd>
            </div>
            <div>
              <dt>Profile, contacts, consent</dt>
              <dd>While enrolled</dd>
            </div>
            <div>
              <dt>Raw call audio</dt>
              <dd>Not stored</dd>
            </div>
          </dl>
          <p className="fine-print">
            Provider retention and recording settings must be verified before live use.
          </p>
        </Panel>
        <Panel className="config-panel">
          <div className="panel-heading">
            <h2>Connection status</h2>
            <span className="badge status-neutral">Local demo</span>
          </div>
          <p className="muted">
            A transparent view of what is running and what still needs connecting.
          </p>
          {config ? (
            <ul className="config-list">
              {config.checks.map((c) => (
                <li key={c.name}>
                  <span>{c.name}</span>
                  <span
                    className={`badge ${c.state === 'ready' ? 'status-green' : 'status-neutral'}`}
                  >
                    {c.state.replaceAll('_', ' ')}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Loading connection status…</p>
          )}
        </Panel>
      </div>
    </>
  );
}
