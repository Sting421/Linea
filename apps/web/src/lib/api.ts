export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/backend/${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({ detail: 'The service could not be reached.' }));
  if (response.status === 401) {
    window.location.assign('/sign-in');
    throw new Error('Please sign in again.');
  }
  if (!response.ok)
    throw new Error(
      typeof data.detail === 'string' ? data.detail : 'Please check the form and try again.',
    );
  return data;
}
export const post = <T>(path: string, body?: unknown, headers?: Record<string, string>) =>
  api<T>(path, {
    method: 'POST',
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
