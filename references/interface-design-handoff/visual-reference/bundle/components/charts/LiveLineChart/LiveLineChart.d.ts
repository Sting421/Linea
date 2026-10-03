import * as React from 'react';

/**
 * LiveLineChart — from reap@0.0.0.
 */
export interface LiveLineChartProps {
title: string; data: { [key: string]: any }[]; dataKey: string
}

export declare const LiveLineChart: React.ComponentType<LiveLineChartProps>;
