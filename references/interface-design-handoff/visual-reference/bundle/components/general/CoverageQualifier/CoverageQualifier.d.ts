import * as React from 'react';

/**
 * CoverageQualifier — from reap@0.0.0.
 */
export interface CoverageQualifierProps {
reporting?: number | null; total?: number | null; sampled?: number | null; partial?: boolean; noun?: string; warnBelow?: number; forceWarn?: boolean; className?: string
}

export declare const CoverageQualifier: React.ComponentType<CoverageQualifierProps>;
