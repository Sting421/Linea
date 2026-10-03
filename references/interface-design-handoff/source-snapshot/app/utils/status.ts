import { statusColors } from '../../theme';

export type CanonicalStatus = 'normal' | 'offline' | 'warning' | 'fault' | 'anomaly';

export const STATUS_SEVERITY: CanonicalStatus[] = ['fault', 'anomaly', 'warning', 'offline', 'normal'];

export const STATUS_LABELS: Record<CanonicalStatus, string> = {
  normal: 'Normal',
  offline: 'Offline',
  warning: 'Warning',
  fault: 'Fault',
  anomaly: 'Anomaly',
};

const STATUS_KEYWORDS: Record<string, CanonicalStatus> = {
  online: 'normal',
  normal: 'normal',
  offline: 'offline',
  warning: 'warning',
  error: 'fault',
  fault: 'fault',
  failure: 'fault',
  anomaly: 'anomaly',
};

const EVENT_CODE_STATUS: Record<string, CanonicalStatus> = {
  w026: 'warning',
  w021: 'warning',
  w017: 'warning',
  w018: 'warning',
  w010: 'warning',
  '34': 'warning',
  ac_overload_fault: 'warning',
  w000: 'fault',
  e000: 'fault',
  e019: 'fault',
  '18': 'fault',
  hw_ac_overcurr_fault: 'fault',
  '26': 'fault',
  busunbalance_fault: 'fault',
  '1': 'fault',
  'dc inversed failure': 'fault',
  tz_dc_overcurr_fault: 'fault',
  arc_fault: 'fault',
  grid_mode_changed: 'normal',
};

const worstOf = (found: Set<CanonicalStatus>): CanonicalStatus | null =>
  STATUS_SEVERITY.find((status) => found.has(status)) ?? null;

export const normalizeStatus = (value: string | null | undefined): CanonicalStatus | null => {
  if (!value) return null;
  const lowered = value.toLowerCase();
  const found = new Set<CanonicalStatus>();
  for (const [keyword, status] of Object.entries(STATUS_KEYWORDS)) {
    if (lowered.includes(keyword)) found.add(status);
  }
  return worstOf(found);
};

export const normalizeEventType = (eventType: string | null | undefined): CanonicalStatus | null =>
  normalizeStatus(eventType);

export const normalizeEventCode = (code: string | null | undefined): CanonicalStatus | null => {
  if (!code) return null;
  return EVENT_CODE_STATUS[code.trim().toLowerCase()] ?? null;
};

type EventSeverityInput = {
  event_code?: string | null;
  event_text?: string | null;
  event_type?: string | null;
};

export const eventSeverity = (event?: EventSeverityInput | null): CanonicalStatus | null =>
  normalizeEventCode(event?.event_code) ??
  normalizeStatus(event?.event_text) ??
  normalizeEventType(event?.event_type);

type ResolveStatusInput = {
  nativeStatus?: string | null;
  eventType?: string | null;
  eventCode?: string | null;
};

export const resolveStatus = ({ nativeStatus, eventType, eventCode }: ResolveStatusInput): CanonicalStatus | null =>
  normalizeStatus(nativeStatus) ?? normalizeEventCode(eventCode) ?? normalizeEventType(eventType);

export const statusToHex = (status: CanonicalStatus): string => statusColors[`status-${status}`];
