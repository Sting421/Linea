import * as React from 'react';

/**
 * HelpHint — from reap@0.0.0.
 */
export interface HelpHintProps {
content?: string; label?: string; tone?: 'light' | 'dark'; placement?: 'below' | 'left'
}

export declare const HelpHint: React.ComponentType<HelpHintProps>;
