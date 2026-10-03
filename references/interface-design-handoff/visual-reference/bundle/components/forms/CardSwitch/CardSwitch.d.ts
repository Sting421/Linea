import * as React from 'react';

/**
 * CardSwitch — from reap@0.0.0.
 */
export interface CardSwitchProps {
label: string; size?: 'sm' | 'md'; variant?: 'success' | 'base'; enable?: boolean; isLoading?: boolean; disabled?: boolean; onChange?: (...args: any) => void
}

export declare const CardSwitch: React.ComponentType<CardSwitchProps>;
