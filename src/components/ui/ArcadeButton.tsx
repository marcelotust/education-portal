import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/utils/cn';

type ArcadeButtonTone = 'green' | 'pink' | 'cyan' | 'yellow';

const TONE_STYLES: Record<ArcadeButtonTone, string> = {
  green: 'border-arcade-green text-arcade-green hover:bg-arcade-green/15',
  pink: 'border-arcade-pink text-arcade-pink hover:bg-arcade-pink/15',
  cyan: 'border-arcade-cyan text-arcade-cyan hover:bg-arcade-cyan/15',
  yellow: 'border-arcade-yellow text-arcade-yellow hover:bg-arcade-yellow/15',
};

interface ArcadeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: ArcadeButtonTone;
  children: ReactNode;
}

export const ArcadeButton = ({
  tone = 'green',
  className,
  children,
  ...buttonProps
}: ArcadeButtonProps) => (
  <button
    type="button"
    {...buttonProps}
    className={cn(
      'rounded-md border-2 px-4 py-3 font-arcade text-[10px] tracking-wider transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
      'disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-600 disabled:hover:bg-transparent',
      TONE_STYLES[tone],
      className,
    )}
  >
    {children}
  </button>
);
