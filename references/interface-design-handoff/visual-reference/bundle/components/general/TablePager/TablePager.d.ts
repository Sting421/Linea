import * as React from 'react';

/**
 * TablePager — from reap@0.0.0.
 */
export interface TablePagerProps {
page: number; pageSize: number; total: number | null; hasNext?: boolean; sizes?: number[]; showRange?: boolean; range?: string | null; onPage: (page: number) => void; onPageSize: (size: number) => void
}

export declare const TablePager: React.ComponentType<TablePagerProps>;
