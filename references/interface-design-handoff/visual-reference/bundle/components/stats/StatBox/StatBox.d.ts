import * as React from 'react';

/**
 * StatBox — from reap@0.0.0.
 */
export interface StatBoxProps {
item: { name: string; stat: string | number; previousStat?: string | number; change?: string; changeType?: 'increase' | 'decrease' }
}

export declare const StatBox: React.ComponentType<StatBoxProps>;
