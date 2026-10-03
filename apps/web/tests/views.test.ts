import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Monitoring, DayView } from '../src/components/monitor';
import { Onboarding } from '../src/components/onboarding';
import { LiveCall } from '../src/components/live-call';
import type { Dashboard, Profile, CheckIn } from '../src/lib/types';
import { Shell, AlertLog } from '../src/components/ui';
import { requiresSetup, profileSetupId } from '../src/lib/setup-state';
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
  assert.match(html, /Daily check-in activity/);
  assert.match(html, /Recorded day outcomes/);
  assert.match(html, /Medicine reports/);
  assert.match(html, /1 Recorded Day/);
  assert.match(html, /1 completed, 0 in progress, 0 incomplete/);
  assert.match(html, /role="tooltip" hidden/);
  assert.doesNotMatch(html, /<details class="metric-help"/);
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
  assert.match(html, /Consent is requested from your loved one on the first call/);
  assert.match(html, /Step 1 Of 4/);
  assert.doesNotMatch(html, /Care starts with|bring your family closer/);
});
test('first demo use requires setup despite seeded data; configured and new live accounts differ', () => {
  assert.equal(requiresSetup(d, null), true);
  assert.equal(requiresSetup(d, profileSetupId(p)), false);
  assert.equal(requiresSetup(d, 'different-owner:rosa'), true);
  assert.equal(requiresSetup({ ...d, mode: 'live' }, null), false);
  assert.equal(requiresSetup({ ...d, profile: null }, profileSetupId(p)), true);
});
test('app shell has navigation and account controls without promotional copy', () => {
  const html = renderToStaticMarkup(
    createElement(Shell, { section: 'Monitoring', profile: p, children: 'content' }),
  );
  assert.match(html, /Main navigation/);
  assert.doesNotMatch(html, /Keeping families connected|A LITTLE CLOSER|One call\.|lin-ya/);
  const setup = renderToStaticMarkup(
    createElement(Shell, { section: 'Setup', profile: p, setup: true, children: 'setup' }),
  );
  assert.doesNotMatch(setup, /Main navigation/);
});
test('alert log retains exact evidence, severity, and independent handled status', () => {
  const html = renderToStaticMarkup(
    createElement(AlertLog, {
      timezone: p.timezone,
      busy: false,
      onHandle: () => {},
      alerts: [
        {
          id: 'a',
          incident_id: 'i',
          concern: 'FALL',
          tier: 'significant',
          assessment: 'complete',
          quote: 'I fell yesterday and my lower leg still aches.',
          reason: 'Ongoing pain',
          created_at: c.created_at,
          handled_at: c.ended_at,
          notification_status: 'demo_recorded',
          subject: 'elder',
          checkin_id: c.id,
          local_date: c.local_date,
        },
      ],
    }),
  );
  assert.match(html, /<table/);
  assert.match(html, /Reported detail/);
  assert.match(html, /I fell yesterday and my lower leg still aches/);
  assert.match(html, /Significant/);
  assert.match(html, /Handled/);
  assert.doesNotMatch(html, /Mark handled/);
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
