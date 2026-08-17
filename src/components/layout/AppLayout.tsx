import type { ReactNode } from 'react';

import { AdSlot } from './AdSlot';
import { Footer } from './Footer';
import { Header } from './Header';

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * Retro Platformer cabinet frame: a persistent brand header and ground-band
 * footer around a centered mobile-first column with lateral ad spaces that
 * only appear once there is desktop room for them. Each screen supplies its
 * own bordered panel (see RetroContainer), so this stays plain.
 */
export const AppLayout = ({ children }: AppLayoutProps) => (
  <div className="flex min-h-dvh w-full flex-col bg-sky-400">
    <Header />

    <div className="flex w-full flex-1 justify-center gap-6 px-4 pt-4 lg:px-8 lg:pt-8">
      <AdSlot label="AD SPACE" />

      <main className="flex w-full max-w-md flex-col">{children}</main>

      <AdSlot label="AD SPACE" />
    </div>

    <Footer />
  </div>
);
