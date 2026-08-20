import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/utils/cn';
import { retroSelectableClasses, type RetroButtonTone } from './retroButtonStyles';

export type { RetroButtonTone };

interface RetroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: RetroButtonTone;
  /**
   * Renders permanently pushed in (no shadow, shifted into the page) to mark
   * a persistent selection — e.g. the cartridge the Host has chosen — rather
   * than a momentary press.
   */
  pressed?: boolean;
  children: ReactNode;
}

/** Retro Platformer button: a border thinner than its offset shadow — the
 * shadow does the heavy lifting, not the outline. State styling (selected/
 * default/disabled) comes from `retroSelectableClasses`, shared with the
 * toggle-chip buttons that don't render this component directly (#146).
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
      'min-h-11 px-4 py-3 font-arcade text-[10px] tracking-wider',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2',
      retroSelectableClasses({ tone, selected: pressed }),
      className,
    )}
  >
    {children}
  </button>
);
