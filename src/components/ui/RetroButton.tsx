import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/utils/cn';

export type RetroButtonTone = 'green' | 'pink' | 'cyan' | 'yellow' | 'white';

const TONE_STYLES: Record<RetroButtonTone, string> = {
  green: 'bg-green-500 text-white',
  pink: 'bg-rose-500 text-white',
  cyan: 'bg-sky-500 text-white',
  yellow: 'bg-yellow-400 text-black',
  white: 'bg-white text-black',
};

interface RetroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: RetroButtonTone;
  /**
   * Renders permanently pushed in (no shadow, shifted into the page) to mark
   * a persistent selection — e.g. the cartridge the Host has chosen — rather
   * than a momentary press. Two Tailwind utilities of equal specificity can't
   * reliably override each other by source order, so this is a real branch
   * rather than an extra class handed in via `className`.
   */
  pressed?: boolean;
  children: ReactNode;
}

/**
 * Retro Platformer button: a border thinner than its offset shadow — the
 * shadow does the heavy lifting, not the outline. Every tone keeps its bold
 * fill in every state (#143) — what changes is opacity: 0.8 at rest, 1.0 the
 * instant it's pressed or permanently selected, 0.6 when disabled (border
 * and shadow fade along with the fill, since opacity dims the whole element
 * as one unit). Selection also swaps the border to `flare` so it doesn't
 * rely on the opacity bump alone to read as chosen.
 */
export const RetroButton = ({
  tone = 'green',
  pressed = false,
  className,
  children,
  ...buttonProps
}: RetroButtonProps) => (
  <button
    type="button"
    {...buttonProps}
    className={cn(
      'min-h-11 border-[3px] px-4 py-3 font-arcade text-[10px] tracking-wider transition-[transform,opacity]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-60',
      TONE_STYLES[tone],
      pressed
        ? 'translate-x-[4px] translate-y-[4px] border-flare opacity-100 shadow-none'
        : cn(
            'border-ink opacity-80 shadow-retro',
            'active:translate-x-[4px] active:translate-y-[4px] active:opacity-100 active:shadow-none',
          ),
      className,
    )}
  >
    {children}
  </button>
);
