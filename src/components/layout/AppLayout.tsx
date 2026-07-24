import type { ReactNode } from 'react';

import { AdSlot } from './AdSlot';

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * Arcade cabinet frame: a centered mobile-first column with lateral ad spaces
 * that only appear once there is desktop room for them.
 */
export const AppLayout = ({ children }: AppLayoutProps) => (
  <div className="flex min-h-full w-full justify-center gap-6 bg-arcade-black p-4 lg:p-8">
    <AdSlot label="AD SPACE" />

    <main className="flex w-full max-w-md flex-col rounded-xl border-2 border-arcade-cyan/40 bg-slate-900/80 p-5 shadow-[0_0_30px_rgba(0,255,255,0.15)]">
      {children}
    </main>

    <AdSlot label="AD SPACE" />
  </div>
);
