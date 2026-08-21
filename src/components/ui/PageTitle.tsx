import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

type PageTitleTone = 'pink' | 'yellow' | 'cyan' | 'royalBlue';

// Color plus its own shadow offset per tone — not a shared shadow class —
// since royalBlue's shadow sits 1px closer on the X axis than the rest.
const TONE_STYLES: Record<PageTitleTone, string> = {
  pink: 'text-rose-500 [text-shadow:3px_2px_0_#381a41]',
  yellow: 'text-yellow-500 [text-shadow:3px_2px_0_#381a41]',
  cyan: 'text-sky-500 [text-shadow:3px_2px_0_#381a41]',
  royalBlue: 'text-blue-500 [text-shadow:2px_2px_0_#381a41]',
};

interface PageTitleProps {
  tone?: PageTitleTone;
  className?: string;
  children: ReactNode;
}

/**
 * The pixel-font banner atop a screen — LOBBY, VALIDATION, NEW ROOM, and the
 * rest — sharing one size and drop shadow so the pattern reads the same
 * everywhere; only the tone shifts to match the screen's mood. The plain
 * text/content pages (ABOUT, LEGAL, CONTACT) pass tone="royalBlue" to read
 * as a distinct, calmer family from the gameplay screens' pink/yellow/cyan.
 */
export const PageTitle = ({ tone = 'pink', className, children }: PageTitleProps) => (
  <h1 className={cn('text-center font-arcade text-lg', TONE_STYLES[tone], className)}>
    {children}
  </h1>
);
