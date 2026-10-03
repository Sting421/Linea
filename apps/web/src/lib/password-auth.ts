type AuthResult = { data: { session: unknown }; error: { code?: string } | null };
type PasswordAuth = {
  signInWithPassword: (credentials: { email: string; password: string }) => Promise<AuthResult>;
  signUp: (credentials: {
    email: string;
    password: string;
    options: { emailRedirectTo: string };
  }) => Promise<AuthResult>;
};

/** Never return passwords, provider diagnostics, or session tokens to the form. */
export async function passwordSession(auth: PasswordAuth, input: unknown, redirectTo: string) {
  const fail = (status: number, detail: string) => ({ status, body: { detail } });
  if (!input || typeof input !== 'object') return fail(400, 'Invalid sign-in request.');
  const body = input as Record<string, unknown>;
  if (body.action !== 'signin' && body.action !== 'signup')
    return fail(400, 'Unknown sign-in action.');
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
    return fail(400, 'Enter a valid email address.');
  if (typeof body.password !== 'string' || !body.password || body.password.length > 128)
    return fail(400, 'Enter a password of at most 128 characters.');
  if (body.action === 'signup') {
    if (body.password.length < 8) return fail(400, 'Use at least 8 characters for your password.');
    if (body.confirmPassword !== body.password) return fail(400, 'The passwords do not match.');
  }
  try {
    const { data, error } =
      body.action === 'signup'
        ? await auth.signUp({
            email,
            password: body.password,
            options: { emailRedirectTo: redirectTo },
          })
        : await auth.signInWithPassword({ email, password: body.password });
    if (error) {
      if (error.code === 'over_email_send_rate_limit')
        return fail(
          429,
          'Registration is paused because confirmation emails have reached their sending limit. Please try later or contact the workspace owner.',
        );
      if (error.code === 'email_address_not_authorized')
        return fail(
          400,
          'Account confirmation emails are not available for this address yet. Please contact the workspace owner.',
        );
      if (error.code === 'over_request_rate_limit')
        return fail(429, 'Too many attempts. Please wait a few minutes and try again.');
      if (error.code === 'email_not_confirmed')
        return fail(
          403,
          'Confirm your email using the link sent when you signed up, then sign in.',
        );
      if (error.code === 'weak_password')
        return fail(400, 'Choose a stronger password with letters, numbers, and symbols.');
      if (body.action === 'signin') return fail(401, 'Email or password is incorrect.');
      return fail(
        400,
        'The account could not be created. Try signing in if you already have an account, or try again later.',
      );
    }
    if (body.action === 'signin' && !data.session)
      return fail(503, 'Sign-in could not be completed. Please try again.');
    return { status: 200, body: { ok: true, confirmationRequired: !data.session } };
  } catch {
    return fail(503, 'Authentication is temporarily unavailable. Please try again.');
  }
}
