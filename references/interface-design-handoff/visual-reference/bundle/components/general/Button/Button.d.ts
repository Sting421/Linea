import * as React from 'react';

/**
 * Button — from reap@0.0.0.
 */
export interface ButtonProps {
variant?: 'save' | 'outline' | 'discard' | 'big_red'; onClick?: () => void; disabled?: boolean; className?: string; children?: React.ReactNode
}

export declare const Button: React.ComponentType<ButtonProps>;
