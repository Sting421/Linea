import * as React from 'react';

/**
 * StatusDonut — from reap@0.0.0.
 */
export interface StatusDonutProps {
counts: Record<'normal' | 'offline' | 'warning' | 'fault' | 'anomaly', number>; title?: string; help?: string; entityLabel?: string; populationLabel?: string; unavailable?: number; unavailableNote?: string; className?: string
}

export declare const StatusDonut: React.ComponentType<StatusDonutProps>;
