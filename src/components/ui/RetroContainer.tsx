import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/utils/cn';

interface RetroContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Retro Platformer panel: thick black border, solid offset shadow, no blur or
 * glow. Used for menus, modals and card-like groupings.
 *
 * The border/shadow only appear from `sm:` up. Below that, AppLayout drops
 * its own padding too, so the panel runs edge-to-edge instead of floating as
 * a narrow card with an unexplained sliver of the page background on each
 * side — the border still has room to read as a frame once the screen does.
 */
export const RetroContainer = ({ className, children, ...divProps }: RetroContainerProps) => (
  <div
    {...divProps}
    className={cn('bg-white sm:border-4 sm:border-black sm:shadow-retro', className)}
  >
    {children}
  </div>
);
