import * as React from 'react';

/**
 * Accordion — from reap@0.0.0.
 */
export interface AccordionProps {
items: { title: string; content: React.ReactNode }[]; openIndex: number | null; setOpenIndex: React.Dispatch<React.SetStateAction<number | null>>
}

export declare const Accordion: React.ComponentType<AccordionProps>;
