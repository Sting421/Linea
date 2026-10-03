import * as React from 'react';

/**
 * StatCard — from reap@0.0.0.
 */
export interface StatCardProps {
label: string; value?: string | number | null; unit?: string; delta?: number | null; invertDelta?: boolean; chip?: React.ReactNode; headerAction?: React.ReactNode; headerChip?: React.ReactNode; wrapHeader?: boolean; note?: string; breakdown?: { tone: 'normal' | 'offline' | 'warning' | 'fault' | 'anomaly'; count?: number | null; label?: string }[]; facts?: { label: string; value?: string | number | null; unit?: string; note?: string; icon?: React.ReactNode }[]; factColumns?: 1 | 2 | 3 | 4 | '2-4'; tabularValues?: boolean; loading?: boolean; footer?: React.ReactNode; emptyLabel?: string; className?: string; look?: 'default' | 'home'
}

export declare const StatCard: React.ComponentType<StatCardProps>;
