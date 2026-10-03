import * as React from 'react';

/**
 * Donut — from reap@0.0.0.
 */
export interface DonutProps {
slices: { key: string; label: string; value: number; color: string }[]; centreValue?: React.ReactNode; centreCaption?: React.ReactNode; dimmed?: string[]; hovered?: string | null; onHover?: (key: string | null) => void; onSelect?: (key: string) => void; emptyCaption?: string; ariaLabel?: string; size?: number; className?: string; centreValueClassName?: string; gradient?: boolean; faded?: number; entrance?: boolean; outline?: boolean; focusCentre?: { value: React.ReactNode; caption?: React.ReactNode } | null; fluid?: boolean
}

export declare const Donut: React.ComponentType<DonutProps>;
