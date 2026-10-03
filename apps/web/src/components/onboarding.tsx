'use client';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, Phone, ShieldCheck } from 'lucide-react';
import type { Profile, Contact } from '@/lib/types';
import { api } from '@/lib/api';
import { Panel } from './ui';
export function Onboarding({
  profile,
  onSaved,
}: {
  profile?: Profile;
  onSaved: (p: Profile) => void;
}) {
  const [step, setStep] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
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
  async function save() {
    setBusy(true);
    setError('');
    try {
      const p = await api<Profile>(profile ? `profiles/${profile.id}` : 'profiles', {
        method: profile ? 'PUT' : 'POST',
        body: JSON.stringify(form),
      });
      onSaved(p);
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
          <p className="eyebrow">A FAMILIAR VOICE. A SIMPLE ROUTINE.</p>
          <h1>{profile ? 'Your loved one’s profile.' : 'Let’s bring your family closer.'}</h1>
          <p>
            {profile
              ? 'Keep the daily check-in and trusted contacts up to date.'
              : 'Set up a daily phone check-in. No app needed for your loved one.'}
          </p>
        </div>
      </div>
      <div className="setup-layout">
        <Panel className="setup-panel">
          <ol className="stepper" aria-label="Setup steps">
            {['Your loved one', 'Daily routine', 'Trusted contacts'].map((label, i) => (
              <li key={label} className={i === step ? 'active' : i < step ? 'done' : ''}>
                <span>{i < step ? <Check size={14} /> : i + 1}</span>
                <strong>{label}</strong>
              </li>
            ))}
          </ol>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step < 2) setStep(step + 1);
              else void save();
            }}
          >
            {step === 0 && (
              <>
                <h2>Who are we checking in on?</h2>
                <p className="muted">Use the name they know and feel comfortable hearing.</p>
                <label>
                  Full name
                  <input
                    required
                    maxLength={80}
                    value={form.name}
                    onChange={(e) => field('name', e.target.value)}
                    placeholder="Rosa Santos"
                  />
                </label>
                <label>
                  Preferred name and honorific
                  <input
                    required
                    maxLength={80}
                    value={form.preferred_name}
                    onChange={(e) => field('preferred_name', e.target.value)}
                    placeholder="Nanay Rosa"
                  />
                </label>
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
                  <small>Include the country code. The call reaches their regular phone.</small>
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
              </>
            )}
            {step === 1 && (
              <>
                <h2>A routine they can count on.</h2>
                <p className="muted">One daily call, one listed medicine, and time to talk.</p>
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
                  <small>
                    In {form.timezone}. Automatic calls are placed between 06:00 and 21:00.
                  </small>
                </label>
                <label>
                  Listed medicine
                  <input
                    required
                    maxLength={80}
                    value={form.medicine}
                    onChange={(e) => field('medicine', e.target.value)}
                  />
                  <small>
                    Losartan is the demo medicine. Other medicines require human omission-policy
                    review.
                  </small>
                </label>
                <label>
                  Medicine due time
                  <input
                    type="time"
                    required
                    value={form.medicine_time}
                    onChange={(e) => field('medicine_time', e.target.value)}
                  />
                  <small>
                    Use their existing prescribed schedule. Linea gives no dosing instructions.
                  </small>
                </label>
                <div className="inset-note">
                  <ShieldCheck size={20} />
                  <p>
                    Calls use English for this MVP. Linea asks for consent on the first call and
                    continues only after a clear yes.
                  </p>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h2>Keep trusted people close.</h2>
                <p className="muted">
                  Add up to three contacts. Identify someone nearby for the emergency script.
                </p>
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
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              contacts: f.contacts.filter((_, n) => n !== i),
                            }))
                          }
                        >
                          <Trash2 size={15} /> Remove
                        </button>
                      )}
                    </div>
                  </fieldset>
                ))}
                {form.contacts.length < 3 && (
                  <button
                    type="button"
                    className="button secondary"
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
                    <Plus size={16} /> Add contact
                  </button>
                )}
                <p className="fine-print">
                  Listing a contact does not send an invitation or a message. Alerts reach
                  authorized family accounts through the web app.
                </p>
              </>
            )}
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            <div className="form-actions">
              {step > 0 && (
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setStep(step - 1)}
                >
                  <ArrowLeft size={16} /> Back
                </button>
              )}
              <button className="button primary" disabled={busy}>
                {busy
                  ? 'Saving…'
                  : step < 2
                    ? 'Continue'
                    : profile
                      ? 'Save profile'
                      : 'Create profile'}
                {!busy && <ArrowRight size={16} />}
              </button>
            </div>
          </form>
        </Panel>
        <aside className="setup-aside">
          <div className="empty-symbol">
            <Phone size={30} />
          </div>
          <h2>
            Care starts with
            <br />a conversation.
          </h2>
          <p>
            Linea calls at the same time each day, listens to how they feel, and keeps you informed.
          </p>
          <div className="inset-note">
            <ShieldCheck size={20} />
            <p>Consent belongs to your loved one. Setting up their profile does not grant it.</p>
          </div>
          {profile && (
            <div className="consent-readout">
              <span className="eyebrow">CALL CONSENT</span>
              <strong>{profile.consent}</strong>
              {profile.consent_words && <p>“{profile.consent_words}”</p>}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
