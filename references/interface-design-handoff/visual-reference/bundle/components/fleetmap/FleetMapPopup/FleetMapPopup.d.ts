import * as React from 'react';

/**
 * FleetMapPopup — from reap@0.0.0.
 */
export interface FleetMapPopupProps {
lng: number; lat: number; offset?: number; markerSize?: number; focusOnOpen?: boolean; instantFocus?: boolean; onClose?: () => void; children?: React.ReactNode
}

export declare const FleetMapPopup: React.ComponentType<FleetMapPopupProps>;
