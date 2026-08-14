import type { ReactNode } from 'react';

import { AdSlot } from './AdSlot';

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * Retro Platformer cabinet frame: a centered mobile-first column with lateral
 * ad spaces that only appear once there is desktop room for them. Each screen
 * supplies its own bordered panel (see RetroContainer), so this stays plain.
 *
 * Padding and the column width cap only apply from `sm:` up, together with
 * RetroContainer's own border — below that, the content runs full-bleed so
 * mobile never loses width to a card it doesn't have room for.
 */
export const AppLayout = ({ children }: AppLayoutProps) => (
  <div className="flex min-h-full w-full justify-center gap-6 bg-sky-400 sm:p-4 lg:p-8">
    <AdSlot label="AD SPACE" />

    <main className="flex w-full flex-col sm:max-w-md">{children}</main>

    <AdSlot label="AD SPACE" />
  </div>
);
