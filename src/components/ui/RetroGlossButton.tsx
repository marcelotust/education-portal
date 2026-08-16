import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/utils/cn';

type GlossTone = 'green' | 'cyan';

/** Light band on top, dark band on bottom — the hard-edged pixel-art bevel. */
const TONE_BANDS: Record<GlossTone, { light: string; dark: string }> = {
  green: { light: '#4ade80', dark: '#15803d' },
  cyan: { light: '#38bdf8', dark: '#0369a1' },
};

// Fixed pixel notch so the cut corners stay chunky at any button width.
const NOTCH = 8;
const CLIP_PATH = [
  `${NOTCH}px 0`,
  `calc(100% - ${NOTCH}px) 0`,
  `100% ${NOTCH}px`,
  `100% calc(100% - ${NOTCH}px)`,
  `calc(100% - ${NOTCH}px) 100%`,
  `${NOTCH}px 100%`,
  `0 calc(100% - ${NOTCH}px)`,
  `0 ${NOTCH}px`,
].join(', ');

interface RetroGlossButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone: GlossTone;
  children: ReactNode;
}

/**
 * Chunky pixel-art cabinet button: notched corners, a hard-edged two-tone
 * fill instead of a flat color, and a small glass "shine" mark — for the
 * one or two primary CTAs a screen wants to stand out from the flatter
 * `RetroButton`s around it.
 */
export const RetroGlossButton = ({
  tone,
  className,
  children,
  ...buttonProps
}: RetroGlossButtonProps) => {
  const { light, dark } = TONE_BANDS[tone];

  return (
    <button
      type="button"
      {...buttonProps}
      style={{
        clipPath: `polygon(${CLIP_PATH})`,
        background: `linear-gradient(to bottom, ${light} 0%, ${light} 42%, ${dark} 42%, ${dark} 100%)`,
      }}
      className={cn(
        'relative min-h-11 border-4 border-black px-4 py-3 font-arcade text-[10px] tracking-wider text-white transition-transform',
        '[text-shadow:1px_1px_0_#000]',
        'active:translate-y-[2px]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2',
        // The glass shine: two small white pixels near the top-left corner.
        "before:absolute before:left-3 before:top-2 before:h-1 before:w-3 before:bg-white before:content-['']",
        "after:absolute after:left-2 after:top-3 after:h-1 after:w-1 after:bg-white after:content-['']",
        className,
      )}
    >
      {children}
    </button>
  );
};
