import * as React from 'react';

/**
 * Radio — from reap@0.0.0.
 */
export interface RadioProps {
variant?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | 'base'; label?: string; name?: string; id?: string; checked?: boolean; disabled?: boolean; readOnly?: boolean; autoFocus?: boolean; error?: string; className?: string; wrapperClassName?: string; [key: string]: any
}

export declare const Radio: React.ComponentType<RadioProps>;
