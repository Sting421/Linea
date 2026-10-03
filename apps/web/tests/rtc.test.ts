import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AgoraFamilyRTC, type RTCCredentials } from '../src/lib/rtc';

const credentials: RTCCredentials = {
  appId: 'app',
  channel: 'scoped-call',
  uid: 2002,
  token: 'scoped-token',
  expiresAt: '2026-10-04T00:00:00Z',
};
function fixture() {
  const calls: string[] = [];
  const handlers = new Map<string, (...args: unknown[]) => unknown>();
  const microphone = {
    stop: () => calls.push('stop'),
    close: () => calls.push('close'),
    setMuted: async (muted: boolean) => calls.push(`muted:${muted}`),
  };
  const client = {
    on: (event: string, callback: (...args: unknown[]) => unknown) => handlers.set(event, callback),
    join: async (...args: unknown[]) => calls.push(`join:${args.join(':')}`),
    publish: async () => calls.push('publish'),
    subscribe: async () => calls.push('subscribe'),
    leave: async () => calls.push('leave'),
    removeAllListeners: () => calls.push('remove-listeners'),
    renewToken: async (token: string) => calls.push(`renew:${token}`),
  };
  const sdk = {
    default: { createClient: () => client, createMicrophoneAudioTrack: async () => microphone },
  };
  const rtc = new AgoraFamilyRTC(async () => sdk as unknown as typeof import('agora-rtc-sdk-ng'));
  return { rtc, calls, handlers, client, microphone, sdk };
}

test('RTC publishes only after the scoped join, plays remote audio and closes the microphone on leave', async () => {
  const { rtc, calls, handlers } = fixture();
  await rtc.join(credentials);
  assert.deepEqual(calls, ['join:app:scoped-call:scoped-token:2002', 'publish']);
  await handlers.get('user-published')!(
    { audioTrack: { play: () => calls.push('play') } },
    'audio',
  );
  await rtc.setMuted(true);
  await rtc.leave();
  assert.deepEqual(calls.slice(2), [
    'subscribe',
    'play',
    'muted:true',
    'stop',
    'close',
    'leave',
    'remove-listeners',
  ]);
});

test('expired or changed-call renewal closes audio instead of reusing a token in another channel', async () => {
  const { rtc, calls, handlers } = fixture();
  rtc.onTokenExpiring(async () => ({ ...credentials, channel: 'different-call' }));
  await rtc.join(credentials);
  await handlers.get('token-privilege-will-expire')!();
  assert.ok(calls.includes('close'));
  assert.ok(!calls.some((c) => c.startsWith('renew:')));
});

test('leaving while microphone permission is pending prevents a later join and closes the returned track', async () => {
  const { rtc, calls, sdk, microphone } = fixture();
  let grant!: (track: typeof microphone) => void;
  sdk.default.createMicrophoneAudioTrack = () =>
    new Promise((resolve) => {
      grant = resolve;
    });
  const join = rtc.join(credentials);
  await new Promise((resolve) => setImmediate(resolve));
  await rtc.leave();
  grant(microphone);
  await assert.rejects(join, /cancelled/);
  assert.ok(calls.includes('close'));
  assert.ok(!calls.some((c) => c.startsWith('join:')));
});
