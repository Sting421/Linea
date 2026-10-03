'use client';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, RefreshCw, ShieldCheck, Check } from 'lucide-react';
import { api, post } from '@/lib/api';
import { localDate, titleCase } from '@/lib/semantics';
import type { Dashboard, Alert, CheckIn } from '@/lib/types';
import { Shell, Panel, Empty, AlertLog } from './ui';
import { WorkspaceSkeleton, ConfigurationSkeleton } from './loading-states';
import { requiresSetup, profileSetupId, SETUP_STORAGE_KEY } from '@/lib/setup-state';
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
  const placementKey = useRef<string | null>(null);
  const refreshSequence = useRef(0);
  const appliedRefresh = useRef(0);
  const [data, setData] = useState<Dashboard | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(''),
    [month, setMonth] = useState(''),
    [filter, setFilter] = useState('open');
  const [setupNeeded, setSetupNeeded] = useState<boolean | null>(null);
  const refresh = useCallback(async () => {
    const sequence = ++refreshSequence.current;
    try {
      const d = await api<Dashboard>('dashboard');
      if (sequence < appliedRefresh.current) return;
      appliedRefresh.current = sequence;
      setData(d);
      setSetupNeeded((current) => {
        if (current !== null) return current;
        let completed = null;
        try {
          completed = localStorage.getItem(SETUP_STORAGE_KEY);
        } catch {
          /* Setup can still finish in memory when storage is disabled. */
        }
        return requiresSetup(d, completed);
      });
      setMonth((m) => m || localDate(d.profile?.timezone ?? 'Asia/Manila').slice(0, 7));
      setError('');
    } catch (e) {
      if (sequence < appliedRefresh.current) return;
      appliedRefresh.current = sequence;
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), 5000);
    return () => {
      clearInterval(id);
      appliedRefresh.current = ++refreshSequence.current;
    };
  }, [refresh]);
  async function handle(a: Alert) {
    setBusy(true);
    try {
      await post(`checkins/${a.checkin_id}/alerts/${a.id}/handle`);
      setNotice('Alert marked handled.');
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
      placementKey.current ??= crypto.randomUUID();
      const c = await post<CheckIn>(`profiles/${data!.profile!.id}/call`, undefined, {
        'Idempotency-Key': placementKey.current,
      });
      placementKey.current = null;
      router.push(`/call/${c.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Shell
      section={setupNeeded ? 'Setup' : section}
      profile={data?.profile ?? null}
      setup={setupNeeded === true || (!!data && !data.profile)}
      mode={data?.mode}
    >
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
      {!data || setupNeeded === null ? (
        error ? (
          <Panel>
            <Empty
              title="Workspace unavailable"
              body="Your workspace could not be loaded. Try again using the button above."
            />
          </Panel>
        ) : (
          <WorkspaceSkeleton section={section} date={date} callId={callId} />
        )
      ) : setupNeeded || !data.profile || section === 'Elder profile' ? (
        <Onboarding
          key={data.profile?.id ?? 'new'}
          profile={data.profile ?? undefined}
          mode={setupNeeded || !data.profile ? 'setup' : 'edit'}
          demo={data.mode === 'demo'}
          onSaved={async (p) => {
            try {
              localStorage.setItem(SETUP_STORAGE_KEY, profileSetupId(p));
            } catch {
              /* No personal details are stored here. */
            }
            setData((current) =>
              current
                ? {
                    ...current,
                    profile: p,
                    profiles: [p, ...current.profiles.filter((existing) => existing.id !== p.id)],
                  }
                : current,
            );
            setSetupNeeded(false);
            setNotice(setupNeeded ? 'Setup complete.' : 'Profile saved.');
            await refresh();
            router.push('/');
          }}
        />
      ) : date ? (
        <DayView date={date} data={data} onHandle={(a) => void handle(a)} />
      ) : callId ? (
        data.mode !== 'demo' &&
        !data.voice_connected &&
        data.checkins.find((c) => c.id === callId) ? (
          <DayView
            date={data.checkins.find((c) => c.id === callId)!.local_date}
            data={data}
            onHandle={(a) => void handle(a)}
          />
        ) : data.checkins.find((c) => c.id === callId) ? (
          <LiveCall
            call={data.checkins.find((c) => c.id === callId)!}
            profile={data.profile}
            refresh={refresh}
            demo={data.mode === 'demo'}
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
              <h1>Alerts</h1>
              <p>{data.profile.preferred_name} · Concern and call history</p>
            </div>
            <span className="badge status-neutral">
              {data.alerts.filter((a) => !a.handled_at).length} Awaiting Review
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
          <AlertLog
            alerts={data.alerts.filter(
              (a) => filter === 'all' || (filter === 'open' ? !a.handled_at : !!a.handled_at),
            )}
            timezone={data.profile.timezone}
            busy={busy}
            onHandle={(a) => void handle(a)}
          />
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
        <SettingsView setNotice={setNotice} onReviewSetup={() => setSetupNeeded(true)} />
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
function SettingsView({
  setNotice,
  onReviewSetup,
}: {
  setNotice: (v: string) => void;
  onReviewSetup: () => void;
}) {
  const [config, setConfig] = useState<{
      mode: string;
      web_push_public_key?: string;
      checks: { name: string; state: string }[];
    } | null>(null),
    [configError, setConfigError] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const loadConfig = useCallback(async () => {
    setConfigError('');
    try {
      setConfig(
        await api<{
          mode: string;
          web_push_public_key?: string;
          checks: { name: string; state: string }[];
        }>('configuration'),
      );
    } catch (e) {
      setConfigError((e as Error).message);
    }
  }, []);
  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);
  async function enablePush() {
    setBusy(true);
    setError('');
    try {
      const currentConfig = await api<{ web_push_public_key?: string }>('configuration');
      const key = currentConfig.web_push_public_key || process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY;
      if (!key) throw new Error('Web push is not connected yet. Use the in-app alert list.');
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
      let subscription = await reg.pushManager.getSubscription();
      const installedKey = subscription?.options.applicationServerKey;
      if (
        subscription &&
        (!installedKey ||
          new Uint8Array(installedKey).length !== bytes.length ||
          new Uint8Array(installedKey).some((value, i) => value !== bytes[i]))
      ) {
        await subscription.unsubscribe();
        subscription = null;
      }
      subscription ??= await reg.pushManager.subscribe({
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
          <h1>Settings</h1>
          <p>Notifications and data retention</p>
        </div>
      </div>
      <div className="settings-grid">
        <Panel>
          <div className="panel-heading">
            <h2>Workspace setup</h2>
          </div>
          <p className="muted">Review the elder details, routine, and contacts.</p>
          <button className="button secondary" onClick={onReviewSetup}>
            Review setup
          </button>
        </Panel>
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
            {config && (
              <span className="badge status-neutral">
                {config.mode === 'demo' ? 'Local Demo' : 'Connected Workspace'}
              </span>
            )}
          </div>
          <p className="muted">Service availability</p>
          {config ? (
            <ul className="config-list">
              {config.checks.map((c) => (
                <li key={c.name}>
                  <span>{c.name}</span>
                  <span
                    className={`badge ${c.state === 'ready' ? 'status-green' : 'status-neutral'}`}
                  >
                    {titleCase(c.state)}
                  </span>
                </li>
              ))}
            </ul>
          ) : configError ? (
            <div>
              <p role="alert" className="error-message">
                {configError}
              </p>
              <button className="text-button" onClick={() => void loadConfig()}>
                <RefreshCw size={15} /> Try again
              </button>
            </div>
          ) : (
            <ConfigurationSkeleton />
          )}
        </Panel>
      </div>
    </>
  );
}
