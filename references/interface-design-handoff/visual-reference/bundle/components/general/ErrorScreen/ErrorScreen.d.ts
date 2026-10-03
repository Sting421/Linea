import * as React from 'react';

/**
 * ErrorScreen — from reap@0.0.0.
 */
export interface ErrorScreenProps {
kind: 'not-available' | 'not-found' | 'server-error' | 'general'
}

export declare const ErrorScreen: React.ComponentType<ErrorScreenProps>;
