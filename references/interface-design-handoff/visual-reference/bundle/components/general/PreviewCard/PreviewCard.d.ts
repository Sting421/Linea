import * as React from 'react';

/**
 * PreviewCard — from reap@0.0.0.
 */
export interface PreviewCardProps {
title: string; state?: 'live' | 'placeholder'; value?: string | number | null; unit?: string; delta?: number | null; invertDelta?: boolean; help?: string; eyebrow?: string; caption?: string; sparkline?: React.ReactNode; loading?: boolean; loadingLabel?: string; href?: string; linkLabel?: string; emptyLabel?: string; className?: string
}

export declare const PreviewCard: React.ComponentType<PreviewCardProps>;
