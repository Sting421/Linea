import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aggregateDays, monthMetrics, localDate } from '../src/lib/semantics';
import type { CheckIn } from '../src/lib/types';
const call = (overrides: Partial<CheckIn>) =>
  ({
    id: 'a',
    local_date: '2026-10-03',
    created_at: '2026-10-03T00:00:00Z',
    complete: true,
    medicine_result: 'taken',
    day_status: 'green',
    legs: [{ kind: 'initial' }, { kind: 'reconnect' }],
    ...overrides,
  }) as CheckIn;
test('red wins within a day, even after a green later call', () => {
  assert.equal(
    aggregateDays([call({ day_status: 'red' }), call({ id: 'b' })])['2026-10-03'],
    'red',
  );
});
test('phone legs are not extra check-ins or dose reports', () => {
  const m = monthMetrics([call({})]);
  assert.equal(m.total, 1);
  assert.equal(m.dosePeriods, 1);
  assert.equal(m.medicine.taken, 1);
});
test('unknown stays unknown and later reports for one due period replace earlier reports', () => {
  const m = monthMetrics([
    call({ medicine_result: 'not_taken' }),
    call({ id: 'b', created_at: '2026-10-03T01:00:00Z', medicine_result: 'unknown' }),
  ]);
  assert.equal(m.medicine.not_taken, 0);
  assert.equal(m.medicine.unknown, 1);
  assert.equal(m.dosePeriods, 1);
});
test('empty data is not a zero-dose adherence claim', () => {
  const m = monthMetrics([]);
  assert.equal(m.dosePeriods, 0);
  assert.deepEqual(m.days, {});
});
test('a day is evaluated in the elder timezone', () => {
  assert.equal(localDate('Asia/Manila', new Date('2026-10-02T20:00:00Z')), '2026-10-03');
});
