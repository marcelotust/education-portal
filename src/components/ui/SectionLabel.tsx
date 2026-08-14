import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/utils/cn';

interface SectionLabelProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

/**
 * Small uppercase heading for a group of controls — "Round length",
 * "Categories", "Choose a cartridge". One place to size and color every one
 * of these consistently, instead of repeating the same class string at each
 * call site (and forgetting one when the size needs to change again).
 */
export const SectionLabel = ({ className, children, ...paragraphProps }: SectionLabelProps) => (
  <p
    {...paragraphProps}
    className={cn('font-terminal text-sm uppercase tracking-[0.3em] text-gray-500', className)}
  >
    {children}
  </p>
);
