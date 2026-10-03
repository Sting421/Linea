import * as React from 'react';

/**
 * Input — from reap@0.0.0.
 */
export interface InputProps {
label?: string; type?: 'text' | 'search' | 'email' | 'number' | 'textarea' | 'tel' | 'password' | 'checkbox' | 'file'; size?: 'md' | 'lg' | 'sm' | 'xs'; variant?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'; fullWidth?: boolean; bordered?: boolean; disabled?: boolean; readOnly?: boolean; autoFocus?: boolean; placeholder?: string; name?: string; id?: string; value?: any; defaultValue?: any; error?: any; isVerified?: boolean; prefix?: React.ReactNode; suffix?: React.ReactNode; [key: string]: any
}

export declare const Input: React.ComponentType<InputProps>;
