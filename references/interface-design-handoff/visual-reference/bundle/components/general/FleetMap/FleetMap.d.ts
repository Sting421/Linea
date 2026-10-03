import * as React from 'react';

/**
 * FleetMap — from reap@0.0.0.
 */
export interface FleetMapProps {
styleUrl: string; bounds?: { swLat: number; swLng: number; neLat: number; neLng: number } | null; fitKey?: string | number; fitPadding?: number | { top: number; right: number; bottom: number; left: number }; instantFirstFit?: boolean; maxZoom?: number; instantFit?: boolean; interactive?: boolean; showNavControl?: boolean; onMoveEnd?: (bounds: { swLat: number; swLng: number; neLat: number; neLng: number }) => void; onSearchArea?: (bounds: { swLat: number; swLng: number; neLat: number; neLng: number }) => void; onMapReady?: () => void; ariaLabel?: string; className?: string; children?: React.ReactNode
}

export declare const FleetMap: React.ComponentType<FleetMapProps>;
