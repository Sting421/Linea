'use client';
import { useState } from 'react';
import { ArrowRight, Phone, ShieldCheck } from 'lucide-react';
import { Brand } from '@/components/ui';
export default function SignIn() {
  const [email, setEmail] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [sent, setSent] = useState(false);
  async function login(action: string) {
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, email }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail);
      if (action === 'demo') location.assign('/');
      else setSent(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="sign-in">
      <div className="sign-in-story">
        <Brand />
        <div>
          <span className="eyebrow">KEEPING FAMILIES CONNECTED</span>
          <h1>
            Some distance.
            <br />
            The same connection.
          </h1>
          <p>
            A familiar voice for them.
            <br />A little peace of mind for you.
          </p>
          <div className="voice-art" aria-hidden="true">
            {[22, 38, 60, 86, 56, 102, 72, 44, 68, 34, 18].map((h, i) => (
              <i key={i} style={{ height: h }} />
            ))}
          </div>
          <span className="tagline">
            Keeping families connected,
            <br />
            one LINEA at a time
          </span>
        </div>
        <p className="fine-print">Linea · pronounced lin-ya · Filipino for line</p>
      </div>
      <section className="sign-in-form panel">
        <span className="empty-symbol">
          <Phone size={26} />
        </span>
        <p className="eyebrow">WELCOME TO YOUR FAMILY WORKSPACE</p>
        <h2>A little closer starts here.</h2>
        <p className="muted">Sign in to set up and follow your loved one’s daily check-ins.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void login('magic-link');
          }}
        >
          <label>
            Email address
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>
          <button className="button primary full" disabled={busy}>
            {busy ? 'Please wait…' : 'Email me a sign-in link'}
            <ArrowRight size={18} />
          </button>
        </form>
        {sent && (
          <p role="status" className="success-message">
            Check your email for your sign-in link.
          </p>
        )}
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
        {(process.env.NEXT_PUBLIC_LINEA_MODE ?? 'demo') === 'demo' && (
          <div className="demo-entry">
            <span>Preview the MVP locally</span>
            <button
              className="button secondary full"
              disabled={busy}
              onClick={() => void login('demo')}
            >
              Explore the demo workspace <ArrowRight size={17} />
            </button>
            <small>Synthetic family data. No real calls or messages.</small>
          </div>
        )}
        <p className="privacy-line">
          <ShieldCheck size={16} /> Elder consent comes first. Raw audio is not stored.
        </p>
      </section>
    </main>
  );
}
