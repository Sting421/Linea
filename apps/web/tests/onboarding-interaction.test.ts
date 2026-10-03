import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import type { Profile, Dashboard } from '../src/lib/types';

// Synthetic component DOM only: no navigation or request to the local app.
const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'https://component.test',
  pretendToBeVisual: true,
});
for (const key of [
  'window',
  'document',
  'navigator',
  'HTMLElement',
  'HTMLInputElement',
  'Node',
  'Event',
  'MouseEvent',
] as const) {
  Object.defineProperty(globalThis, key, { configurable: true, value: dom.window[key] });
}
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
Object.defineProperty(globalThis, 'localStorage', {
  value: dom.window.localStorage,
  configurable: true,
});
Object.defineProperty(globalThis, 'self', { value: dom.window, configurable: true });
Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', {
  value: true,
  configurable: true,
  writable: true,
});
const components = (async () => {
  const { createElement } = await import('react');
  const { render, screen, cleanup, waitFor } = await import('@testing-library/react');
  const { default: userEvent } = await import('@testing-library/user-event');
  const { Onboarding } = await import('../src/components/onboarding');
  const { FamilyApp } = await import('../src/components/family-app');
  const { MetricHelp } = await import('../src/components/ui');
  const { AppRouterContext } =
    await import('next/dist/shared/lib/app-router-context.shared-runtime');
  return {
    createElement,
    render,
    screen,
    cleanup,
    waitFor,
    userEvent,
    Onboarding,
    FamilyApp,
    MetricHelp,
    AppRouterContext,
  };
})();
const originalFetch = globalThis.fetch;
afterEach(async () => {
  const { cleanup } = await components;
  cleanup();
  globalThis.fetch = originalFetch;
  dom.window.localStorage.clear();
});

test('metric tooltips open on hover and keyboard focus, dismiss with Escape, and stay closed after clicking elsewhere', async () => {
  const { createElement, render, screen, userEvent, MetricHelp } = await components;
  const user = userEvent.setup();
  render(
    createElement(
      'div',
      {},
      createElement(MetricHelp, {
        label: 'Report definition',
        children: createElement('p', {}, 'Unknown stays unknown.'),
      }),
      createElement('button', {}, 'Other control'),
    ),
  );
  const trigger = screen.getByRole('button', { name: 'Report definition' });
  assert.equal(screen.queryByRole('tooltip'), null);
  await user.hover(trigger);
  const tooltip = screen.getByRole('tooltip');
  assert.equal(trigger.getAttribute('aria-describedby'), tooltip.id);
  await user.keyboard('{Escape}');
  assert.equal(screen.queryByRole('tooltip'), null);
  await user.unhover(trigger);
  await user.hover(trigger);
  assert.ok(screen.getByRole('tooltip'));
  await user.hover(tooltip);
  assert.ok(screen.getByRole('tooltip'));
  await user.unhover(tooltip);
  assert.equal(screen.queryByRole('tooltip'), null);
  await user.tab();
  assert.equal(document.activeElement, trigger);
  assert.ok(screen.getByRole('tooltip'));
  await user.keyboard('{Escape}');
  assert.equal(screen.queryByRole('tooltip'), null);
  await user.tab();
  assert.equal(screen.queryByRole('tooltip'), null);
  await user.tab({ shift: true });
  assert.ok(screen.getByRole('tooltip'));
  await user.click(screen.getByRole('button', { name: 'Other control' }));
  assert.equal(screen.queryByRole('tooltip'), null);
});

const profile: Profile = {
  id: 'rosa',
  owner_id: 'ana',
  name: 'Rosa Santos',
  preferred_name: 'Nanay Rosa',
  phone: '+639000000001',
  timezone: 'Asia/Manila',
  call_time: '08:00',
  medicine: 'Losartan',
  medicine_time: '08:00',
  language: 'en-US',
  contacts: [
    { name: 'Ana Santos', relationship: 'Daughter', phone: '+971500000001', nearby: true },
  ],
  consent: 'granted',
  consent_words: 'Yes, that is okay.',
  consent_at: '2026-10-03T00:00:00Z',
  enrolled: true,
};

test('fresh setup validates fields, caps contacts, reviews configuration and saves once without consent', async () => {
  const { createElement, render, screen, userEvent, Onboarding } = await components;
  const user = userEvent.setup();
  const requests: { url: string; body: Record<string, unknown> }[] = [];
  let saved: Profile | null = null;
  globalThis.fetch = async (url, options) => {
    const body = JSON.parse(String(options?.body));
    requests.push({ url: String(url), body });
    return Response.json({
      ...profile,
      ...body,
      consent: 'pending',
      consent_words: null,
      consent_at: null,
    });
  };
  render(
    createElement(Onboarding, {
      onSaved: (p) => {
        saved = p;
      },
    }),
  );
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  assert.ok(screen.getByText('Step 1 Of 4'));
  assert.equal(requests.length, 0);
  await user.type(screen.getByLabelText(/^Full name/), 'Rosa Santos');
  await user.type(screen.getByLabelText(/^Preferred name/), 'Nanay Rosa');
  await user.type(screen.getByLabelText(/^Phone number/), '+639000000001');
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  assert.ok(screen.getByText('Step 2 Of 4'));
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  assert.ok(screen.getByText('Step 3 Of 4'));
  await user.type(screen.getByLabelText('Name'), 'Ana Santos');
  await user.type(screen.getByLabelText('Relationship'), 'Daughter');
  await user.type(screen.getByLabelText('Phone number'), '+971500000001');
  await user.click(screen.getByRole('button', { name: 'Add contact' }));
  await user.click(screen.getByRole('button', { name: 'Add contact' }));
  assert.equal(screen.queryByRole('button', { name: 'Add contact' }), null);
  await user.click(screen.getByRole('button', { name: 'Remove contact 3' }));
  await user.click(screen.getByRole('button', { name: 'Remove contact 2' }));
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  assert.ok(screen.getByText('Step 4 Of 4'));
  assert.ok(screen.getByText('Saving does not grant call consent.'));
  assert.equal(requests.length, 0);
  await user.click(screen.getByRole('button', { name: 'Edit call routine' }));
  assert.ok(screen.getByText('Step 2 Of 4'));
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  await user.click(screen.getByRole('button', { name: 'Finish setup' }));
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, '/api/backend/profiles');
  assert.equal(requests[0].body.name, 'Rosa Santos');
  assert.equal('consent' in requests[0].body, false);
  assert.ok(saved);
  assert.equal((saved as Profile).consent, 'pending');
});

test('profile edits save the existing profile without replacing consent', async () => {
  const { createElement, render, screen, userEvent, Onboarding } = await components;
  const user = userEvent.setup();
  let method: string | undefined, body: Record<string, unknown> | undefined;
  globalThis.fetch = async (url, options) => {
    assert.equal(String(url), '/api/backend/profiles/rosa');
    method = options?.method;
    body = JSON.parse(String(options?.body));
    return Response.json({ ...profile, ...body });
  };
  render(createElement(Onboarding, { profile, mode: 'edit', onSaved: () => {} }));
  assert.equal(screen.queryByText('Step 1 Of 4'), null);
  await user.click(screen.getByRole('button', { name: 'Call routine' }));
  await user.click(screen.getByRole('button', { name: 'Save changes' }));
  assert.equal(method, 'PUT');
  assert.ok(body);
  assert.equal('consent' in body, false);
});

test('failed final save remains on review and never signals setup completion', async () => {
  const { createElement, render, screen, userEvent, Onboarding } = await components;
  const user = userEvent.setup();
  let completed = false;
  globalThis.fetch = async () =>
    Response.json({ detail: 'Could not save profile' }, { status: 503 });
  render(
    createElement(Onboarding, {
      profile,
      onSaved: () => {
        completed = true;
      },
    }),
  );
  for (let i = 0; i < 3; i++) await user.click(screen.getByRole('button', { name: 'Continue' }));
  await user.click(screen.getByRole('button', { name: 'Finish setup' }));
  assert.ok(screen.getByRole('alert'));
  assert.ok(screen.getByText('Step 4 Of 4'));
  assert.equal(completed, false);
});

test('family app gates first use, saves setup, and retains completion on a later page load', async () => {
  const {
    createElement,
    render,
    screen,
    cleanup,
    waitFor,
    userEvent,
    FamilyApp,
    AppRouterContext,
  } = await components;
  const { SETUP_STORAGE_KEY, profileSetupId } = await import('../src/lib/setup-state');
  const user = userEvent.setup();
  const dashboard: Dashboard = {
    mode: 'demo',
    profile,
    profiles: [profile],
    checkins: [],
    alerts: [],
  };
  let saves = 0;
  const pushes: string[] = [];
  const router = {
    back() {},
    forward() {},
    refresh() {},
    replace() {},
    prefetch() {},
    push(path: string) {
      pushes.push(path);
    },
    bfcacheId: 'test',
  };
  globalThis.fetch = async (url, options) => {
    if (String(url) === '/api/backend/dashboard') return Response.json(dashboard);
    assert.equal(String(url), '/api/backend/profiles/rosa');
    assert.equal(options?.method, 'PUT');
    saves++;
    return Response.json(profile);
  };
  const app = () =>
    createElement(AppRouterContext.Provider, { value: router }, createElement(FamilyApp));
  render(app());
  await screen.findByText('Step 1 Of 4');
  assert.equal(screen.queryByRole('navigation', { name: 'Main navigation' }), null);
  for (let i = 0; i < 3; i++) await user.click(screen.getByRole('button', { name: 'Continue' }));
  assert.equal(saves, 0);
  await user.click(screen.getByRole('button', { name: 'Finish setup' }));
  await screen.findByRole('heading', { name: 'Monitoring' });
  await waitFor(() => assert.equal(pushes.at(-1), '/'));
  assert.equal(saves, 1);
  assert.equal(dom.window.localStorage.getItem(SETUP_STORAGE_KEY), profileSetupId(profile));
  cleanup();
  render(app());
  await screen.findByRole('heading', { name: 'Monitoring' });
  assert.equal(screen.queryByText('Step 1 Of 4'), null);
});
