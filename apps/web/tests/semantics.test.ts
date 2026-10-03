import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  aggregateDays,
  monthMetrics,
  localDate,
  dailyActivity,
  titleCase,
} from '../src/lib/semantics';
import type { CheckIn } from '../src/lib/types';
const call = (overrides: Partial<CheckIn>) =>
  ({
    id: 'a',
    local_date: '2026-10-03',
    created_at: '2026-10-03T00:00:00Z',
    complete: true,
    state: 'ended',
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
test('activity shows separate logical completions, missing days, and upcoming dates in the selected month', () => {
  const days = dailyActivity(
    [
      call({}),
      call({ id: 'b', complete: false }),
      call({ id: 'active', complete: false, state: 'connected' }),
      call({ id: 'older', local_date: '2026-09-30' }),
    ],
    '2026-10',
    '2026-10-03',
  );
  assert.equal(days.length, 31);
  assert.deepEqual(days[2], {
    date: '2026-10-03',
    day: 3,
    total: 3,
    completed: 1,
    inProgress: 1,
    incomplete: 1,
    upcoming: false,
  });
  assert.equal(days[0].total, 0);
  assert.equal(days[0].upcoming, false);
  assert.equal(days[3].total, 0);
  assert.equal(days[3].upcoming, true);
  assert.equal(dailyActivity([], '2028-02', '2028-02-29').length, 29);
});
test('pill text uses Title Case for labels and service states without losing acronyms', () => {
  assert.equal(titleCase('assessment pending'), 'Assessment Pending');
  assert.equal(titleCase('not_configured'), 'Not Configured');
  assert.equal(titleCase('API ready'), 'API Ready');
});
