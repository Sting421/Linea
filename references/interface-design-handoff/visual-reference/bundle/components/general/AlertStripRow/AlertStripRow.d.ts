import * as React from 'react';

/**
 * AlertStripRow — from reap@0.0.0.
 */
export interface AlertStripRowProps {
status: 'normal' | 'offline' | 'warning' | 'fault' | 'anomaly'; title: string; subtitle: string; detail?: string | null; time: string; count?: number; label?: string; to?: string
}

export declare const AlertStripRow: React.ComponentType<AlertStripRowProps>;
