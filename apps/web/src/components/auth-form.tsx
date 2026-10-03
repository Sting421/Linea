'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { Brand } from './ui';

export function AuthForm({ signup = false }: { signup?: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmationRequired, setConfirmationRequired] = useState(false);
  const demo = (process.env.NEXT_PUBLIC_LINEA_MODE ?? 'connected') === 'demo';
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('error'))
      setError(
        'This confirmation link has expired or was opened in a different browser. Try signing in if your email is already confirmed.',
      );
  }, []);
  async function submit() {
    if (busy) return;
    setError('');
    if (!demo && signup && password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          demo
            ? { action: 'demo' }
            : {
                action: signup ? 'signup' : 'signin',
                email,
                password,
                ...(signup ? { confirmPassword } : {}),
              },
        ),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? 'Please try again.');
      if (data.confirmationRequired) {
        setConfirmationRequired(true);
        setPassword('');
        setConfirmPassword('');
      } else window.location.assign('/');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="sign-in">
      <Brand />
      <section className="sign-in-form panel">
        <h1>{signup ? 'Create your account' : 'Sign in'}</h1>
        <p className="muted">
          {demo
            ? 'Demo workspace'
            : signup
              ? 'Start your family workspace.'
              : 'Access your family workspace.'}
        </p>
        {confirmationRequired ? (
          <p role="status" className="success-message">
            Check your email to confirm your account. Open the confirmation link in this browser,
            then use your email and password to sign in.
          </p>
        ) : demo ? (
          <div className="demo-entry">
            <button className="button primary full" disabled={busy} onClick={() => void submit()}>
              Open demo <ArrowRight size={17} />
            </button>
            <small>Sample data · Simulated calls</small>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <label>
              Email address
              <input
                type="email"
                name="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                placeholder="you@example.com"
                disabled={busy}
              />
            </label>
            <label>
              Password
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                minLength={signup ? 8 : undefined}
                maxLength={128}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={signup ? 'new-password' : 'current-password'}
                aria-describedby={signup ? 'password-hint' : undefined}
                disabled={busy}
              />
              {signup && <small id="password-hint">Use at least 8 characters.</small>}
            </label>
            {signup && (
              <label>
                Confirm password
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  maxLength={128}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  disabled={busy}
                />
              </label>
            )}
            <button
              type="button"
              className="text-button"
              aria-pressed={showPassword}
              onClick={() => setShowPassword((shown) => !shown)}
            >
              {showPassword ? 'Hide password' : 'Show password'}
            </button>
            {error && (
              <p role="alert" className="error-message">
                {error}
              </p>
            )}
            <button className="button primary full" disabled={busy}>
              <LockKeyhole size={17} />
              {busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}
            </button>
          </form>
        )}
        {demo && error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
        {!demo && (
          <p className="auth-switch">
            {signup ? 'Already have an account? ' : 'New to Linea? '}
            <Link href={signup ? '/sign-in' : '/sign-up'}>
              {signup ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        )}
      </section>
    </main>
  );
}
