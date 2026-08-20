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

// Selected/pressed dims only the fill to 80% — border, shadow and text stay
// at full opacity, so the control still reads crisp and just the color
// itself recedes, instead of the whole element fading.
const TONE_STYLES_SELECTED: Record<RetroButtonTone, string> = {
  green: 'bg-green-500/80 text-white',
  pink: 'bg-rose-500/80 text-white',
  cyan: 'bg-sky-500/80 text-white',
  yellow: 'bg-yellow-400/80 text-black',
  white: 'bg-white/80 text-black',
};

// Same idea for the momentary :active press on a non-selected button.
const TONE_ACTIVE_BG: Record<RetroButtonTone, string> = {
  green: 'active:bg-green-500/80',
  pink: 'active:bg-rose-500/80',
  cyan: 'active:bg-sky-500/80',
  yellow: 'active:bg-yellow-400/80',
  white: 'active:bg-white/80',
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
 * fill color family in every state (#143) — full opacity at rest, and when
 * pressed or permanently selected only the *fill* dims to 80% (border,
 * shadow, and text stay full-strength) so the control reads as physically
 * recessed without going muddy. Disabled dims everything uniformly to 60%
 * and drops the shadow, reading as flat rather than just faded.
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
      'min-h-11 px-4 py-3 font-arcade text-[10px] tracking-wider transition-[transform,border-width]',
      '[text-shadow:1px_1px_0_rgba(0,0,0,0.6)]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none',
      pressed
        ? cn(
            'translate-x-[4px] translate-y-[4px] border-[5px] border-flare shadow-none',
            TONE_STYLES_SELECTED[tone],
          )
        : cn(
            'border-[3px] border-ink shadow-retro',
            'active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
            TONE_STYLES[tone],
            TONE_ACTIVE_BG[tone],
          ),
      className,
    )}
  >
    {children}
  </button>
);
