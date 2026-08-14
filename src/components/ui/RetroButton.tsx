import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/utils/cn';

type RetroButtonTone = 'green' | 'pink' | 'cyan' | 'yellow' | 'white';

const TONE_STYLES: Record<RetroButtonTone, string> = {
  green: 'bg-green-500 text-white hover:bg-green-400',
  pink: 'bg-rose-500 text-white hover:bg-rose-400',
  cyan: 'bg-sky-500 text-white hover:bg-sky-400',
  yellow: 'bg-yellow-400 text-black hover:bg-yellow-300',
  white: 'bg-white text-black hover:bg-gray-100',
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
 * Retro Platformer button: thick black border, solid offset shadow, tone
 * changes on hover. On press it looks mechanically pushed in — shifts into
 * the shadow and the shadow disappears — instead of glowing.
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
      'min-h-11 border-4 border-black px-4 py-3 font-arcade text-[10px] tracking-wider transition-transform',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed',
      pressed
        ? // A pressed-and-disabled button (e.g. the Host's pick, shown read-only
          // to a Player) still needs to read clearly, so it skips the generic
          // disabled graying rather than fighting it for specificity.
          'translate-x-[4px] translate-y-[4px] shadow-none'
        : cn(
            'shadow-retro active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
            'disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:hover:bg-gray-300',
          ),
      TONE_STYLES[tone],
      className,
    )}
  >
    {children}
  </button>
);
