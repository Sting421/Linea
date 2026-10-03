'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Phone,
  Mic,
  MicOff,
  LogOut,
  PhoneOff,
  Play,
  RotateCcw,
  ShieldAlert,
  Check,
} from 'lucide-react';
import type { CheckIn, Profile } from '@/lib/types';
import { callLabel, formatTime, titleCase } from '@/lib/semantics';
import { post } from '@/lib/api';
import { Panel, TierBadge, Avatar, MetricHelp } from './ui';
import { BotAvatar } from 'bot-avatars';
type Result = { call: CheckIn; reply?: string; briefing?: string };
export function LiveCall({
  call,
  profile,
  refresh,
}: {
  call: CheckIn;
  profile: Profile;
  refresh: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [reply, setReply] = useState(''),
    [muted, setMuted] = useState(false),
    [confirmEnd, setConfirmEnd] = useState(false);
  const joined = call.family.length > 0,
    leg = call.legs.at(-1);
  async function action(path: string, body?: unknown) {
    setBusy(true);
    setError('');
    try {
      const r = await post<Result>(path, body);
      setReply(r.reply ?? r.briefing ?? '');
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function send(text: string, payload: Record<string, unknown> = {}) {
    return action(`demo/checkins/${call.id}/turn`, {
      turn_id: crypto.randomUUID(),
      text,
      ...payload,
    });
  }
  const facts = (concern: string, values: Record<string, unknown>, quote: string) => ({
    incident_id: `demo-${concern}-${call.id}`,
    concern,
    quote,
    ...values,
  });
  const noRed = { emergency_features_absent: true };
  const nextBeat = call.active_question;
  function normal() {
    const answers: Record<string, string> = {};
    let text = 'Nothing else to share.';
    if (nextBeat === 'sleep') {
      answers.sleep = 'Slept well';
      text = 'I slept well last night.';
    } else if (nextBeat === 'medicine') {
      answers.medicine = 'Taken';
      text = `I took ${profile.medicine} for today.`;
    } else if (nextBeat === 'feeling') {
      answers.feeling = 'Feeling well';
      text = 'I am feeling well.';
    } else answers.anything = 'Nothing else';
    return send(text, {
      answers,
      ...(nextBeat === 'medicine' ? { medicine_result: 'taken' } : {}),
    });
  }
  return (
    <>
      <Link className="back-link" href="/">
        <ArrowLeft size={16} /> Back to monitoring
      </Link>
      <div className="page-heading">
        <div>
          <h1>
            {call.state === 'ended' ? 'The call has ended.' : `Call · ${profile.preferred_name}`}
          </h1>
          <p>Demo call · no microphone or phone connection is active.</p>
        </div>
        <span className={`badge ${call.state === 'connected' ? 'status-green' : 'status-neutral'}`}>
          {titleCase(callLabel(call.state))}
        </span>
      </div>
      <div className="live-layout">
        <Panel className="live-room">
          <div className="live-orbit">
            <Avatar name={profile.name} size="huge" />
          </div>
          <h2>{profile.preferred_name}</h2>
          <p className="muted">
            {call.mode === 'LISTEN'
              ? 'Linea is listening. Family takes the conversation.'
              : call.mode === 'EMERGENCY'
                ? 'Emergency response active. Ordinary check-in stopped.'
                : call.state === 'ended'
                  ? 'All call attempts remain in the day record.'
                  : callLabel(call.state)}
          </p>
          <div className="participant-row">
            <span className="participant">
              <BotAvatar
                type="circle"
                shading="plastic"
                size={32}
                state={busy ? 'working' : 'default'}
                paused={!busy || call.mode === 'LISTEN' || call.state === 'ended'}
                aria-hidden="true"
              />
              Linea · {call.mode.toLowerCase()}
            </span>
            {joined && (
              <span className="participant">
                <span className="key-dot green" />
                Ana · family participant
              </span>
            )}
          </div>
          {reply && (
            <div className="spoken-preview" aria-live="polite">
              <span className="eyebrow">
                {joined ? 'BRIEFING / AGENT RESPONSE' : 'SIMULATED AGENT RESPONSE'}
              </span>
              <p>{reply || 'Empty completion: Linea stays quiet.'}</p>
            </div>
          )}
          <div className="call-controls">
            {call.state === 'connected' && !joined && (
              <button
                className="button primary"
                disabled={busy}
                onClick={() => action(`checkins/${call.id}/join`)}
              >
                <Phone size={18} /> Join simulated call
              </button>
            )}
            {joined && (
              <>
                <button
                  className="call-control"
                  aria-pressed={muted}
                  disabled={busy}
                  onClick={() => setMuted(!muted)}
                >
                  {muted ? <MicOff size={21} /> : <Mic size={21} />}
                  <span>{muted ? 'Unmute' : 'Mute'}</span>
                </button>
                <button
                  className="call-control"
                  disabled={busy}
                  onClick={() => action(`checkins/${call.id}/leave`)}
                >
                  <LogOut size={21} />
                  <span>Leave</span>
                </button>
                <button
                  className="call-control danger"
                  disabled={busy}
                  onClick={() => setConfirmEnd(true)}
                >
                  <PhoneOff size={21} />
                  <span>End for everyone</span>
                </button>
              </>
            )}
            {call.state === 'ended' && (
              <Link className="button secondary" href={`/day/${call.local_date}`}>
                Open day record <ArrowLeft size={16} />
              </Link>
            )}
          </div>
          <MetricHelp label="Call controls">
            <p>
              Leave disconnects only you. Ending for everyone is an intentional end and does not
              handle alerts.
            </p>
          </MetricHelp>
          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}
        </Panel>
        <Panel className="simulation-panel">
          <div className="panel-heading">
            <div>
              <h2>Call simulator</h2>
            </div>
            <Play size={18} />
          </div>
          <MetricHelp label="About the simulator">
            <p>
              These scripted examples feed structured facts into the real policy. They do not test
              speech recognition or semantic classification.
            </p>
          </MetricHelp>
          {call.state === 'ringing' ||
          (call.state === 'reconnecting' && leg?.state === 'ringing') ? (
            <div className="simulation-actions">
              <button
                className="button primary"
                disabled={busy}
                onClick={() =>
                  action(`demo/checkins/${call.id}/event`, {
                    event_id: crypto.randomUUID(),
                    kind: 'connected',
                    leg_id: leg!.id,
                  })
                }
              >
                Simulate answer <Check size={16} />
              </button>
              <button
                className="button secondary"
                disabled={busy}
                onClick={() =>
                  action(`demo/checkins/${call.id}/event`, {
                    event_id: crypto.randomUUID(),
                    kind: 'no_answer',
                    leg_id: leg!.id,
                  })
                }
              >
                Simulate no answer
              </button>
            </div>
          ) : null}
          {(call.state === 'retry_scheduled' ||
            (call.state === 'reconnecting' && leg?.state !== 'ringing')) && (
            <>
              <p className="notice">
                {call.retry_at
                  ? `Eligible after ${formatTime(call.retry_at, profile.timezone)}`
                  : 'No automatic attempt pending'}
              </p>
              <button
                className="button secondary"
                disabled={busy}
                onClick={() => action(`demo/checkins/${call.id}/automatic-attempt`)}
              >
                <RotateCcw size={16} /> Run eligible automatic attempt
              </button>
            </>
          )}
          {call.state === 'connected' && (
            <div className="simulation-actions">
              {profile.consent !== 'granted' && (
                <>
                  <button
                    className="button secondary"
                    disabled={busy}
                    onClick={() => send('Yes, that is okay.', { consent: 'yes' })}
                  >
                    Consent: clear yes
                  </button>
                  <button
                    className="button secondary"
                    disabled={busy}
                    onClick={() => send('No, please do not call.', { consent: 'no' })}
                  >
                    Consent: clear no
                  </button>
                </>
              )}
              <button
                className="button secondary"
                disabled={
                  busy || !['sleep', 'medicine', 'feeling', 'anything'].includes(nextBeat ?? '')
                }
                onClick={normal}
              >
                Answer current routine question
              </button>
              <button
                className="button secondary"
                disabled={busy}
                onClick={() => {
                  const q =
                    'I almost fell, but I caught myself. I am fully recovered, not hurt, moving normally, and this happened only once.';
                  return send(q, {
                    concerns: [
                      facts(
                        'FALL',
                        {
                          context: 'near_event',
                          resolved: true,
                          current: false,
                          injury: false,
                          ongoing_pain: false,
                          functional_difficulty: false,
                          repeated: false,
                          ...noRed,
                        },
                        q,
                      ),
                    ],
                  });
                }}
              >
                Recovered near-fall · Routine
              </button>
              <button
                className="button secondary"
                disabled={busy}
                onClick={() => {
                  const q = 'I fell and my lower leg still aches.';
                  return send(q, {
                    concerns: [facts('FALL', { ongoing_pain: true, current: true, ...noRed }, q)],
                  });
                }}
              >
                Fall with ongoing pain · Significant
              </button>
              <button
                className="button secondary"
                disabled={busy}
                onClick={() => {
                  const q = 'My chest hurts right now.';
                  return send(q, { concerns: [facts('CHEST_PAIN', { current: true }, q)] });
                }}
              >
                <ShieldAlert size={16} /> Current chest pain · Emergency
              </button>
              <button
                className="button secondary"
                disabled={busy}
                onClick={() => {
                  const q = "I haven't taken my Losartan yet.";
                  return send(q, {
                    medicine_result: 'not_taken',
                    answers: { medicine: 'Not yet taken' },
                    concerns: [facts('MEDICINE_NOT_TAKEN', { medicine_result: 'not_taken' }, q)],
                  });
                }}
              >
                Medicine not taken
              </button>
              <button
                className="button secondary"
                disabled={busy}
                onClick={() =>
                  action(`demo/checkins/${call.id}/event`, {
                    event_id: crypto.randomUUID(),
                    kind: 'dropped',
                    leg_id: leg!.id,
                  })
                }
              >
                Simulate unexpected drop
              </button>
              <button
                className="button secondary"
                disabled={busy}
                onClick={() => send('Please stop calling me.', { stop: true })}
              >
                Elder requests stop
              </button>
              <button
                className="button secondary"
                disabled={busy}
                onClick={() =>
                  action(`demo/checkins/${call.id}/event`, {
                    event_id: crypto.randomUUID(),
                    kind: 'ended',
                    leg_id: leg!.id,
                  })
                }
              >
                Simulate intentional phone ending
              </button>
            </div>
          )}
          {call.alerts.length > 0 && (
            <div className="live-alerts">
              <h3>Recorded concerns</h3>
              {call.alerts.map((a) => (
                <div key={a.id}>
                  <strong>{a.concern.replaceAll('_', ' ')}</strong>
                  <TierBadge tier={a.tier} />
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
      {confirmEnd && (
        <ConfirmEnd onClose={() => setConfirmEnd(false)}>
          <h2 id="end-title">End the call for everyone?</h2>
          <p>
            This ends the elder&apos;s phone leg and all call resources. Linea will not
            automatically reconnect. Recorded alerts remain open.
          </p>
          <div className="form-actions">
            <button autoFocus className="button secondary" onClick={() => setConfirmEnd(false)}>
              Keep talking
            </button>
            <button
              className="button destructive"
              disabled={busy}
              onClick={async () => {
                await action(`checkins/${call.id}/end`);
                setConfirmEnd(false);
              }}
            >
              End call for everyone
            </button>
          </div>
        </ConfirmEnd>
      )}
    </>
  );
}

function ConfirmEnd({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    const dialog = ref.current;
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="end-title"
      onClose={onClose}
      onCancel={onClose}
    >
      {children}
    </dialog>
  );
}
