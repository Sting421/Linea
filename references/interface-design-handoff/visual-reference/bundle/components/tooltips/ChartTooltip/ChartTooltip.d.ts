import * as React from 'react';

/**
 * ChartTooltip — from reap@0.0.0.
 */
export interface ChartTooltipProps {
active?: boolean; payload?: any[]; label?: unknown; labelFormatter?: (label: any, datum?: any) => React.ReactNode; prefix?: string; unit?: string; extra?: (datum: any) => { name: string; value: unknown; color?: string; prefix?: string; unit?: string; display?: string; shape?: 'circle' | 'square'; status?: React.ReactNode }[]; groups?: { label: string; keys: string[]; total?: boolean }[]; rows?: (datum: any) => { name: string; value: unknown; color?: string; prefix?: string; unit?: string; display?: string; shape?: 'circle' | 'square'; status?: React.ReactNode }[]
}

export declare const ChartTooltip: React.ComponentType<ChartTooltipProps>;
