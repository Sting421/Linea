import { test } from 'node:test';
import assert from 'node:assert/strict';
import { passwordSession } from '../src/lib/password-auth';

const credentials = { email: 'member@example.com', password: '  strong password  ' };
const redirect = 'http://127.0.0.1:3000/auth/callback';
function provider(session: unknown = { access_token: 'must-not-leak' }, code?: string) {
  const calls: { method: string; input: unknown }[] = [];
  return {
    calls,
    async signInWithPassword(input: unknown) {
      calls.push({ method: 'signin', input });
      return { data: { session }, error: code ? { code } : null };
    },
    async signUp(input: unknown) {
      calls.push({ method: 'signup', input });
      return { data: { session }, error: code ? { code } : null };
    },
  };
}

test('password sign-in normalizes email, preserves password and never returns tokens', async () => {
  const auth = provider();
  const result = await passwordSession(
    auth,
    { action: 'signin', ...credentials, email: ' member@example.com ' },
    redirect,
  );
  assert.equal(result.status, 200);
  assert.deepEqual(auth.calls, [{ method: 'signin', input: credentials }]);
  assert.deepEqual(result.body, { ok: true, confirmationRequired: false });
  assert.doesNotMatch(JSON.stringify(result), /must-not-leak|strong password/);
});

test('signup requires valid input and matching passwords before contacting Supabase', async () => {
  const auth = provider();
  for (const input of [
    null,
    {},
    { action: 'magic-link' },
    { action: 'signin', email: 'bad', password: 'x' },
    { action: 'signup', ...credentials, confirmPassword: 'mismatch' },
    { action: 'signup', ...credentials, password: 'short', confirmPassword: 'short' },
    { action: 'signin', ...credentials, password: 'x'.repeat(129) },
  ]) {
    assert.equal((await passwordSession(auth, input, redirect)).status, 400);
  }
  assert.equal(auth.calls.length, 0);
});

test('signup distinguishes email confirmation from an authenticated session', async () => {
  for (const session of [null, { access_token: 'must-not-leak' }]) {
    const auth = provider(session);
    const result = await passwordSession(
      auth,
      { action: 'signup', ...credentials, confirmPassword: credentials.password },
      redirect,
    );
    assert.deepEqual(result.body, { ok: true, confirmationRequired: !session });
    assert.deepEqual(auth.calls, [
      { method: 'signup', input: { ...credentials, options: { emailRedirectTo: redirect } } },
    ]);
  }
});

test('wrong credentials are generic; confirmation, weak passwords and rate limits are actionable', async () => {
  const cases = [
    ['invalid_credentials', 'signin', 401, /Email or password is incorrect/],
    ['user_not_found', 'signin', 401, /Email or password is incorrect/],
    ['email_not_confirmed', 'signin', 403, /Confirm your email/],
    ['over_request_rate_limit', 'signin', 429, /Too many attempts/],
    [
      'over_email_send_rate_limit',
      'signup',
      429,
      /confirmation emails have reached their sending limit/,
    ],
    ['email_address_not_authorized', 'signup', 400, /not available for this address/],
    ['weak_password', 'signup', 400, /stronger password/],
    ['user_already_exists', 'signup', 400, /Try signing in/],
  ] as const;
  for (const [code, action, status, message] of cases) {
    const result = await passwordSession(
      provider(null, code),
      { action, ...credentials, confirmPassword: credentials.password },
      redirect,
    );
    assert.equal(result.status, status);
    assert.match(JSON.stringify(result.body), message);
  }
});

test('missing sessions and unavailable authentication fail without leaking errors', async () => {
  const input = { action: 'signin', ...credentials };
  assert.equal((await passwordSession(provider(null), input, redirect)).status, 503);
  const auth = provider();
  auth.signInWithPassword = async () => {
    throw new Error('private-provider-details');
  };
  const result = await passwordSession(auth, input, redirect);
  assert.equal(result.status, 503);
  assert.doesNotMatch(JSON.stringify(result), /private-provider-details/);
});
