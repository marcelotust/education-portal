import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/utils/cn';

interface RetroContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Retro Platformer panel: thick black border, solid offset shadow, no blur or
 * glow. Used for menus, modals and card-like groupings.
 */
export const RetroContainer = ({ className, children, ...divProps }: RetroContainerProps) => (
  <div {...divProps} className={cn('border-4 border-ink bg-white/60 shadow-retro', className)}>
    {children}
  </div>
);
