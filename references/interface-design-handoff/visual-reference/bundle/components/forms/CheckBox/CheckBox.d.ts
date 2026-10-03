import * as React from 'react';

/**
 * CheckBox — from reap@0.0.0.
 */
export interface CheckBoxProps {
name: string; label: string; checked: boolean; onChange: (e?: any) => void
}

export declare const CheckBox: React.ComponentType<CheckBoxProps>;
