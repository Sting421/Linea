import * as React from 'react';

/**
 * StatusDot — from reap@0.0.0.
 */
export interface StatusDotProps {
status: 'normal' | 'offline' | 'warning' | 'fault' | 'anomaly'; size?: 'sm' | 'md' | 'lg'; pulse?: boolean; label?: string; decorative?: boolean; className?: string
}

export declare const StatusDot: React.ComponentType<StatusDotProps>;
