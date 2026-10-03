import type { NextRequest } from 'next/server';

/** NextURL normalizes loopback addresses to localhost. The original Host header
 * preserves the origin the browser actually visited. Do not trust forwarded hosts
 * or treat different localhost aliases/ports as interchangeable browser origins.
 */
export function hasSameOrigin(request: Pick<NextRequest, 'headers' | 'nextUrl'>): boolean {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return false;
  const origin = request.headers.get('origin');
  if (!origin) return true;
  const host = request.headers.get('host') ?? request.nextUrl.host;
  const protocol = request.nextUrl.protocol;
  if (protocol !== 'http:' && protocol !== 'https:') return false;
  try {
    const expected = new URL(`${protocol}//${host}`);
    if (
      expected.username ||
      expected.password ||
      expected.pathname !== '/' ||
      expected.search ||
      expected.hash
    )
      return false;
    return origin === expected.origin;
  } catch {
    return false;
  }
}
