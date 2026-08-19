import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

type PageTitleTone = 'pink' | 'yellow' | 'cyan';

const TONE_STYLES: Record<PageTitleTone, string> = {
  pink: 'text-rose-500',
  yellow: 'text-yellow-500',
  cyan: 'text-sky-500',
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
    className={cn(
      'text-solid-shadow text-center font-arcade text-lg',
      TONE_STYLES[tone],
      className,
    )}
  >
    {children}
  </h1>
);
