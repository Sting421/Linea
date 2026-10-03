'use client';
import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, Pencil, ShieldCheck } from 'lucide-react';
import type { Profile, Contact } from '@/lib/types';
import { api } from '@/lib/api';
import { titleCase } from '@/lib/semantics';
import { Avatar, MetricHelp, Panel } from './ui';

const steps = ['Elder details', 'Call routine', 'Contacts', 'Review'];
export function Onboarding({
  profile,
  onSaved,
  mode = 'setup',
}: {
  profile?: Profile;
  onSaved: (p: Profile) => void | Promise<void>;
  mode?: 'setup' | 'edit';
}) {
  const setup = mode === 'setup';
  const [step, setStep] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [form, setForm] = useState({
    name: profile?.name ?? '',
    preferred_name: profile?.preferred_name ?? '',
    phone: profile?.phone ?? '',
    timezone: profile?.timezone ?? 'Asia/Manila',
    call_time: profile?.call_time ?? '08:00',
    medicine: profile?.medicine ?? 'Losartan',
    medicine_time: profile?.medicine_time ?? '08:00',
    language: 'en-US' as const,
    contacts: profile?.contacts ?? [{ name: '', relationship: '', phone: '', nearby: true }],
  });
  function field(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function contact(index: number, key: keyof Contact, value: string | boolean) {
    setForm((f) => ({
      ...f,
      contacts: f.contacts.map((c, i) => (i === index ? { ...c, [key]: value } : c)),
    }));
  }
  function go(next: number) {
    setError('');
    setStep(next);
    requestAnimationFrame(() => headingRef.current?.focus());
  }
  async function save() {
    const phonePattern = /^\+[1-9][0-9]{7,14}$/;
    let invalid: { step: number; message: string } | null = null;
    if (!form.name.trim() || !form.preferred_name.trim() || !phonePattern.test(form.phone))
      invalid = { step: 0, message: 'Enter the elder name and a phone number with country code.' };
    else if (!form.medicine.trim() || form.call_time < '06:00' || form.call_time >= '21:00')
      invalid = {
        step: 1,
        message: 'Check the medicine and choose a call time between 06:00 and 21:00.',
      };
    else if (
      form.contacts.some(
        (c) => !c.name.trim() || !c.relationship.trim() || !phonePattern.test(c.phone),
      )
    )
      invalid = { step: 2, message: 'Complete each contact name, relationship, and phone number.' };
    if (invalid) {
      go(invalid.step);
      setError(invalid.message);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const p = await api<Profile>(profile ? `profiles/${profile.id}` : 'profiles', {
        method: profile ? 'PUT' : 'POST',
        body: JSON.stringify(form),
      });
      await onSaved(p);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={setup ? 'onboarding' : 'profile-editor'}>
      <div className="page-heading">
        <div>
          <h1>{setup ? 'Set up daily check-ins' : 'Elder profile'}</h1>
          {setup && <p>Configure the profile, routine, and family contacts.</p>}
        </div>
        {setup && <span className="badge status-neutral">Step {step + 1} Of 4</span>}
      </div>
      {!setup && profile && (
        <div className="profile-strip">
          <Avatar name={profile.name} size="large" />
          <div>
            <h2>{profile.preferred_name}</h2>
            <p>{profile.phone}</p>
          </div>
          <div className="consent-status">
            <span>Call consent</span>
            <strong
              className={`badge ${profile.consent === 'granted' ? 'status-green' : profile.consent === 'declined' ? 'status-red' : 'status-neutral'}`}
            >
              {titleCase(profile.consent)}
            </strong>
          </div>
          <MetricHelp label="Consent record">
            <p>Consent belongs to your loved one. Setting up their profile does not grant it.</p>
            {profile.consent_words && <p>“{profile.consent_words}”</p>}
          </MetricHelp>
        </div>
      )}
      <div className="setup-layout">
        {setup ? (
          <ol className="setup-steps" aria-label="Setup steps">
            {steps.map((label, i) => (
              <li
                key={label}
                className={i === step ? 'active' : i < step ? 'done' : ''}
                aria-current={i === step ? 'step' : undefined}
              >
                <span>{i < step ? <Check size={15} /> : i + 1}</span>
                <div>
                  <strong>{label}</strong>
                  <small>
                    {
                      [
                        'Name and phone',
                        'Schedule and medicine',
                        'Who to contact',
                        'Confirm configuration',
                      ][i]
                    }
                  </small>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <nav className="profile-sections" aria-label="Profile sections">
            {steps.slice(0, 3).map((label, i) => (
              <button
                key={label}
                type="button"
                className={step === i ? 'selected' : ''}
                aria-pressed={step === i}
                disabled={busy}
                onClick={() => go(i)}
              >
                {label}
              </button>
            ))}
          </nav>
        )}
        <Panel className="setup-panel">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (setup && step < 3) go(step + 1);
              else void save();
            }}
          >
            <div className="form-section-heading">
              <h2 ref={headingRef} tabIndex={-1}>
                {steps[step]}
              </h2>
              <p>
                {
                  [
                    'How Linea addresses and calls your loved one.',
                    'Times are local to your loved one.',
                    'Add up to three trusted people.',
                    'Check the details before saving.',
                  ][step]
                }
              </p>
            </div>
            {step === 0 && (
              <>
                <div className="form-row">
                  <label>
                    Full name
                    <input
                      required
                      maxLength={80}
                      value={form.name}
                      onChange={(e) => field('name', e.target.value)}
                      placeholder="Rosa Santos"
                      autoComplete="off"
                    />
                  </label>
                  <label>
                    Preferred name
                    <input
                      required
                      maxLength={80}
                      value={form.preferred_name}
                      onChange={(e) => field('preferred_name', e.target.value)}
                      placeholder="Nanay Rosa"
                    />
                    <small>Include their usual honorific.</small>
                  </label>
                </div>
                <label>
                  Phone number
                  <input
                    type="tel"
                    required
                    pattern="\+[1-9][0-9]{7,14}"
                    value={form.phone}
                    onChange={(e) => field('phone', e.target.value)}
                    placeholder="+639123456789"
                  />
                  <small>Include the country code, e.g. +63.</small>
                </label>
                <label>
                  Timezone
                  <select value={form.timezone} onChange={(e) => field('timezone', e.target.value)}>
                    {[
                      'Asia/Manila',
                      'Asia/Taipei',
                      'Asia/Dubai',
                      'Asia/Singapore',
                      'Europe/London',
                      'America/New_York',
                      'America/Los_Angeles',
                    ].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
                {setup && (
                  <div className="setup-consent-note">
                    <ShieldCheck size={17} />
                    <span>Consent is requested from your loved one on the first call.</span>
                  </div>
                )}
              </>
            )}
            {step === 1 && (
              <>
                <div className="form-row">
                  <label>
                    Daily call time
                    <input
                      type="time"
                      min="06:00"
                      max="20:59"
                      required
                      value={form.call_time}
                      onChange={(e) => field('call_time', e.target.value)}
                    />
                    <small>Calling hours: 06:00–21:00.</small>
                  </label>
                  <label>
                    Language
                    <input value="English" readOnly />
                  </label>
                </div>
                <label>
                  Medicine
                  <input
                    required
                    maxLength={80}
                    value={form.medicine}
                    onChange={(e) => field('medicine', e.target.value)}
                  />
                  <small>One medicine per check-in.</small>
                </label>
                <label>
                  Medicine due time
                  <input
                    type="time"
                    required
                    value={form.medicine_time}
                    onChange={(e) => field('medicine_time', e.target.value)}
                  />
                  <small>Use the existing prescribed schedule.</small>
                </label>
                <MetricHelp label="Medicine policy">
                  <p>
                    Losartan is the demo medicine. Other medicines require omission-policy review.
                    Linea gives no dosing instructions.
                  </p>
                </MetricHelp>
              </>
            )}
            {step === 2 && (
              <>
                {form.contacts.map((c, i) => (
                  <fieldset className="contact-form" key={i}>
                    <legend>Contact {i + 1}</legend>
                    <div className="form-row">
                      <label>
                        Name
                        <input
                          required
                          maxLength={80}
                          value={c.name}
                          onChange={(e) => contact(i, 'name', e.target.value)}
                        />
                      </label>
                      <label>
                        Relationship
                        <input
                          required
                          maxLength={50}
                          value={c.relationship}
                          onChange={(e) => contact(i, 'relationship', e.target.value)}
                        />
                      </label>
                    </div>
                    <label>
                      Phone number
                      <input
                        required
                        type="tel"
                        pattern="\+[1-9][0-9]{7,14}"
                        value={c.phone}
                        onChange={(e) => contact(i, 'phone', e.target.value)}
                        placeholder="+639123456789"
                      />
                    </label>
                    <div className="contact-options">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={c.nearby}
                          onChange={(e) => contact(i, 'nearby', e.target.checked)}
                        />
                        Lives nearby
                      </label>
                      {form.contacts.length > 1 && (
                        <button
                          type="button"
                          className="text-button"
                          aria-label={`Remove contact ${i + 1}`}
                          disabled={busy}
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              contacts: f.contacts.filter((_, n) => n !== i),
                            }))
                          }
                        >
                          <Trash2 size={15} />
                          Remove
                        </button>
                      )}
                    </div>
                  </fieldset>
                ))}
                {form.contacts.length < 3 && (
                  <button
                    type="button"
                    className="button secondary"
                    disabled={busy}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        contacts: [
                          ...f.contacts,
                          { name: '', relationship: '', phone: '', nearby: false },
                        ],
                      }))
                    }
                  >
                    <Plus size={16} />
                    Add contact
                  </button>
                )}
                <MetricHelp label="How contacts are used">
                  <p>
                    A nearby contact is named in an emergency response. Adding a contact does not
                    send an invitation; alerts go to authorized family accounts.
                  </p>
                </MetricHelp>
              </>
            )}
            {step === 3 && (
              <>
                <div className="setup-review-profile">
                  <Avatar name={form.name} size="large" />
                  <div>
                    <h3>{form.preferred_name}</h3>
                    <p>{form.name}</p>
                  </div>
                </div>
                <div className="review-section">
                  <div>
                    <h3>Elder details</h3>
                    <button
                      type="button"
                      className="text-button"
                      aria-label="Edit elder details"
                      onClick={() => go(0)}
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                  </div>
                  <dl>
                    <div>
                      <dt>Phone</dt>
                      <dd>{form.phone}</dd>
                    </div>
                    <div>
                      <dt>Timezone</dt>
                      <dd>{form.timezone}</dd>
                    </div>
                  </dl>
                </div>
                <div className="review-section">
                  <div>
                    <h3>Call routine</h3>
                    <button
                      type="button"
                      className="text-button"
                      aria-label="Edit call routine"
                      onClick={() => go(1)}
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                  </div>
                  <dl>
                    <div>
                      <dt>Daily call</dt>
                      <dd>{form.call_time} · English</dd>
                    </div>
                    <div>
                      <dt>Medicine</dt>
                      <dd>
                        {form.medicine} · {form.medicine_time}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="review-section">
                  <div>
                    <h3>Contacts</h3>
                    <button
                      type="button"
                      className="text-button"
                      aria-label="Edit contacts"
                      onClick={() => go(2)}
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                  </div>
                  <ul>
                    {form.contacts.map((c, i) => (
                      <li key={i}>
                        <span>
                          {c.name}
                          <small>{c.relationship}</small>
                        </span>
                        <span>
                          {c.phone}
                          {c.nearby && <small>Nearby</small>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="setup-consent-note">
                  <ShieldCheck size={17} />
                  <span>Saving does not grant call consent.</span>
                </div>
                {profile && (
                  <span className="badge status-neutral">Existing Call Consent Preserved</span>
                )}
              </>
            )}
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            <div className="form-actions">
              {setup && step > 0 && (
                <button
                  type="button"
                  className="button secondary"
                  disabled={busy}
                  onClick={() => go(step - 1)}
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              )}
              <button className="button primary" disabled={busy}>
                {busy
                  ? 'Saving…'
                  : setup
                    ? step < 3
                      ? 'Continue'
                      : 'Finish setup'
                    : 'Save changes'}
                {!busy && (setup && step < 3 ? <ArrowRight size={16} /> : <Check size={16} />)}
              </button>
            </div>
          </form>
        </Panel>
      </div>
    </div>
  );
}
