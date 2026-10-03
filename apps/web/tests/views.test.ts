import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Monitoring, DayView } from '../src/components/monitor';
import { Onboarding } from '../src/components/onboarding';
import { LiveCall } from '../src/components/live-call';
import type { Dashboard, Profile, CheckIn } from '../src/lib/types';
const p: Profile = {
  id: 'rosa',
  name: 'Rosa Santos',
  preferred_name: 'Nanay Rosa',
  phone: '+639123456789',
  timezone: 'Asia/Manila',
  call_time: '08:00',
  medicine: 'Losartan',
  medicine_time: '08:00',
  language: 'en-US',
  contacts: [{ name: 'Ana', relationship: 'Daughter', phone: '+639123456788', nearby: false }],
  consent: 'granted',
  consent_words: 'Yes',
  consent_at: '2026-10-03T00:00:00Z',
  owner_id: 'ana',
  enrolled: true,
};
const c: CheckIn = {
  id: 'call-1',
  elder_id: 'rosa',
  local_date: '2026-10-03',
  created_at: '2026-10-03T00:00:00Z',
  state: 'ended',
  complete: true,
  medicine_result: 'unknown',
  alerts: [],
  legs: [],
  transcript: [],
  answers: {},
  day_status: 'yellow',
  family: [],
  text_expired: true,
  summary: null,
  ended_at: '2026-10-03T00:05:00Z',
  mode: 'ENDING',
  medicine_due: true,
  retry_at: null,
  family_joined_at: null,
  active_question: null,
  farewell_asked: false,
};
const d = { profile: p, profiles: [p], checkins: [c], alerts: [], mode: 'demo' } as Dashboard;
test('monitoring markup contains accessible calendar outcomes and metric definitions', () => {
  const html = renderToStaticMarkup(
    createElement(Monitoring, {
      data: d,
      month: '2026-10',
      setMonth: () => {},
      onCall: () => {},
      onHandle: () => {},
      busy: false,
    }),
  );
  assert.match(html, /check-in outcomes/);
  assert.match(html, /2026.*Needs a look|Needs a look/);
  assert.match(html, /not verified doses/);
  assert.match(html, /Missing days are not missed doses/);
});
test('expired detail cannot render transcript or fabricate summary', () => {
  const html = renderToStaticMarkup(
    createElement(DayView, { date: '2026-10-03', data: d, onHandle: () => {} }),
  );
  assert.match(html, /Detailed text expired/);
  assert.doesNotMatch(html, /Check-in is complete/);
});
test('onboarding exposes name, phone, timezone and elder consent boundary', () => {
  const html = renderToStaticMarkup(createElement(Onboarding, { onSaved: () => {} }));
  assert.match(html, /Full name/);
  assert.match(html, /Phone number/);
  assert.match(html, /Timezone/);
  assert.match(html, /does not grant it/);
});
test('live call simulation cannot pretend an actual microphone connection exists', () => {
  const html = renderToStaticMarkup(
    createElement(LiveCall, {
      call: { ...c, state: 'connected', mode: 'LISTEN', family: ['ana'] },
      profile: p,
      refresh: async () => {},
    }),
  );
  assert.match(html, /no microphone or phone connection is active/);
  assert.match(html, /End for everyone/);
  assert.match(html, /Leave/);
  assert.match(html, /scripted examples/);
});
