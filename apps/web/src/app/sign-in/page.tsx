'use client';
import { useState } from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import { Brand } from '@/components/ui';
export default function SignIn() {
  const [email, setEmail] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [sent, setSent] = useState(false);
  const demo = (process.env.NEXT_PUBLIC_LINEA_MODE ?? 'demo') === 'demo';
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
      <Brand />
      <section className="sign-in-form panel">
        <h1>Sign in</h1>
        <p className="muted">{demo ? 'Demo workspace' : 'Access your family workspace.'}</p>
        {!demo && (
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
              <Mail size={17} />
              {busy ? 'Please wait…' : 'Send sign-in link'}
            </button>
          </form>
        )}
        {sent && (
          <p role="status" className="success-message">
            Check your email for the sign-in link.
          </p>
        )}
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
        {demo && (
          <div className="demo-entry">
            <button
              className="button primary full"
              disabled={busy}
              onClick={() => void login('demo')}
            >
              Open demo <ArrowRight size={17} />
            </button>
            <small>Sample data · Simulated calls</small>
          </div>
        )}
      </section>
    </main>
  );
}
