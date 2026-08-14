import type { ReactNode } from 'react';

import { AdSlot } from './AdSlot';

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * Retro Platformer cabinet frame: a centered mobile-first column with lateral
 * ad spaces that only appear once there is desktop room for them. Each screen
 * supplies its own bordered panel (see RetroContainer), so this stays plain.
 */
export const AppLayout = ({ children }: AppLayoutProps) => (
  <div className="flex min-h-full w-full justify-center gap-6 bg-sky-400 p-4 lg:p-8">
    <AdSlot label="AD SPACE" />

    <main className="flex w-full max-w-md flex-col">{children}</main>

    <AdSlot label="AD SPACE" />
  </div>
);
