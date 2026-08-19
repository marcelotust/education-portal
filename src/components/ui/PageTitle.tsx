import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

type PageTitleTone = 'pink' | 'yellow' | 'cyan';

// One shade darker than the brand default in each case — the -500 shades
// only clear ~1.9-3.7:1 against a white/light page background, short of
// WCAG AA's 4.5:1 for normal-size text (flagged by the #56 Lighthouse
// pass; the drop shadow doesn't count toward the contrast ratio).
const TONE_STYLES: Record<PageTitleTone, string> = {
  pink: 'text-rose-600',
  yellow: 'text-yellow-700',
  cyan: 'text-sky-700',
};

interface PageTitleProps {
  tone?: PageTitleTone;
  className?: string;
  children: ReactNode;
}

/**
 * The pixel-font banner atop a screen — LOBBY, VALIDATION, NEW ROOM, and the
 * rest — sharing one size and drop shadow so the pattern reads the same
 * everywhere; only the tone shifts to match the screen's mood.
 */
export const PageTitle = ({ tone = 'pink', className, children }: PageTitleProps) => (
  <h1
    className={cn('text-solid-shadow text-center font-arcade text-lg', TONE_STYLES[tone], className)}
  >
    {children}
  </h1>
);
