import * as React from 'react';

/**
 * ChartLegend — from reap@0.0.0.
 */
export interface ChartLegendProps {
items: { key: string; name: string; source?: string; value?: string; color: string; opacity?: number; shape?: 'circle' | 'square'; status?: React.ReactNode }[]; hidden?: string[]; focused?: string | null; orientation?: 'row' | 'column'; readOnly?: boolean; onToggle?: (key: string) => void; onFocus?: (key: string | null) => void; className?: string
}

export declare const ChartLegend: React.ComponentType<ChartLegendProps>;
