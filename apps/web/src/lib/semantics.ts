import type { CheckIn, Outcome } from './types';
export const titleCase = (value: string) =>
  value.replaceAll('_', ' ').replace(/\b[a-z]/g, (letter) => letter.toUpperCase());

// Count logical check-ins, never their reconnect/retry phone legs.
export function dailyActivity(calls: CheckIn[], month: string, today: string) {
  const [year, number] = month.split('-').map(Number);
  const count = new Date(Date.UTC(year, number, 0)).getUTCDate();
  const byDate = new Map<string, CheckIn[]>();
  for (const call of calls) {
    if (!call.local_date.startsWith(`${month}-`)) continue;
    const records = byDate.get(call.local_date) ?? [];
    records.push(call);
    byDate.set(call.local_date, records);
  }
  return Array.from({ length: count }, (_, index) => {
    const date = `${month}-${String(index + 1).padStart(2, '0')}`;
    const records = byDate.get(date) ?? [];
    const completed = records.filter((call) => call.complete).length;
    const inProgress = records.filter((call) => !call.complete && call.state !== 'ended').length;
    return {
      date,
      day: index + 1,
      total: records.length,
      completed,
      inProgress,
      incomplete: records.length - completed - inProgress,
      upcoming: date > today,
    };
  });
}
export const outcomes = {
  green: { label: 'Completed normally', short: 'Completed', className: 'status-green' },
  yellow: { label: 'Needs a look', short: 'Attention', className: 'status-yellow' },
  red: { label: 'Family attention required', short: 'Priority', className: 'status-red' },
};
export const tiers = {
  routine: { label: 'Routine', className: 'status-yellow' },
  significant: { label: 'Significant', className: 'status-red' },
  emergency: { label: 'Emergency', className: 'status-emergency' },
};
export const concernLabel = (value: string) =>
  ({
    FALL: 'Fall',
    BREATHING: 'Breathing',
    CHEST_PAIN: 'Chest pain',
    DIZZINESS: 'Dizziness',
    MEDICINE_NOT_TAKEN: 'Medicine report',
    CALL_CONNECTION: 'Call connection',
  })[value] ?? value;
export const callLabel = (value: string) =>
  ({
    connected: 'In a call',
    ringing: 'Calling',
    retry_scheduled: 'Retry scheduled',
    reconnecting: 'Reconnecting',
    ended: 'Call ended',
  })[value] ?? value;
export function aggregateDays(calls: CheckIn[]): Record<string, Outcome> {
  const rank = { green: 0, yellow: 1, red: 2 };
  return calls.reduce<Record<string, Outcome>>((days, call) => {
    const old = days[call.local_date];
    if (!old || rank[call.day_status] > rank[old]) days[call.local_date] = call.day_status;
    return days;
  }, {});
}
export function monthMetrics(calls: CheckIn[]) {
  const days = aggregateDays(calls);
  const completed = calls.filter((c) => c.complete).length;
  // Medicine is reported per local dose period, not per phone leg or repeat call.
  const doseReports = new Map<string, CheckIn>();
  for (const c of [...calls].sort((a, b) => a.created_at.localeCompare(b.created_at)))
    doseReports.set(c.local_date, c);
  const medicine = { taken: 0, not_taken: 0, unknown: 0 };
  for (const c of doseReports.values()) medicine[c.medicine_result]++;
  return {
    days,
    completed,
    total: calls.length,
    medicine,
    dosePeriods: doseReports.size,
    outcomes: {
      green: Object.values(days).filter((s) => s === 'green').length,
      yellow: Object.values(days).filter((s) => s === 'yellow').length,
      red: Object.values(days).filter((s) => s === 'red').length,
    },
  };
}
export function localDate(timezone: string, value = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);
  return `${parts.find((p) => p.type === 'year')!.value}-${parts.find((p) => p.type === 'month')!.value}-${parts.find((p) => p.type === 'day')!.value}`;
}
export const formatTime = (at: string, timezone: string) =>
  new Intl.DateTimeFormat('en', { timeZone: timezone, hour: 'numeric', minute: '2-digit' }).format(
    new Date(at),
  );
export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`));
