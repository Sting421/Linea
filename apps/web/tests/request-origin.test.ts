import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { hasSameOrigin } from '../src/lib/request-origin';

function request(url: string, origin: string, extra: Record<string, string> = {}) {
  return new NextRequest(url, {
    method: 'POST',
    headers: { host: new URL(url).host, origin, ...extra },
  });
}

test('loopback origin remains valid when NextURL normalizes its hostname', () => {
  const req = request('http://127.0.0.1:3000/api/session', 'http://127.0.0.1:3000');
  assert.equal(req.nextUrl.origin, 'http://localhost:3000');
  assert.equal(hasSameOrigin(req), true);
});

test('localhost and production HTTPS accept their exact browser origin', () => {
  assert.equal(
    hasSameOrigin(request('http://localhost:3000/api/session', 'http://localhost:3000')),
    true,
  );
  assert.equal(
    hasSameOrigin(request('https://linea.example/api/session', 'https://linea.example')),
    true,
  );
});

test('other origins, loopback aliases, ports, protocols and null are rejected', () => {
  for (const origin of [
    'http://localhost:3000',
    'http://127.0.0.1:3001',
    'https://127.0.0.1:3000',
    'https://other.example',
    'null',
  ]) {
    assert.equal(
      hasSameOrigin(request('http://127.0.0.1:3000/api/session', origin)),
      false,
      origin,
    );
  }
});

test('forwarded host cannot authorize a foreign origin', () => {
  assert.equal(
    hasSameOrigin(
      request('http://127.0.0.1:3000/api/session', 'http://other.example', {
        'x-forwarded-host': 'other.example',
      }),
    ),
    false,
  );
});

test('browser cross-site requests are rejected even without an Origin header', () => {
  const req = new NextRequest('http://localhost:3000/api/session', {
    method: 'POST',
    headers: { host: 'localhost:3000', 'sec-fetch-site': 'cross-site' },
  });
  assert.equal(hasSameOrigin(req), false);
});
