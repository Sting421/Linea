import * as React from 'react';

/**
 * StatusBadge — from reap@0.0.0.
 */
export interface StatusBadgeProps {
status: 'normal' | 'offline' | 'warning' | 'fault' | 'anomaly'; variant?: 'solid' | 'soft' | 'outline' | 'soft-outline'; size?: 'xs' | 'sm' | 'md' | 'lg'; count?: number; label?: string; className?: string
}

export declare const StatusBadge: React.ComponentType<StatusBadgeProps>;
