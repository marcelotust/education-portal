interface AdSlotProps {
  label: string;
}

/**
 * Reserved lateral space for ads on desktop. Decorative placeholder for the
 * MVP: hidden from assistive tech and from the mobile layout.
 */
export const AdSlot = ({ label }: AdSlotProps) => (
  <aside
    data-testid="ad-slot"
    aria-hidden="true"
    className="hidden w-40 shrink-0 items-center justify-center border-4 border-dashed border-white/60 text-white/80 lg:flex xl:w-56"
  >
    <span className="rotate-90 whitespace-nowrap font-arcade text-[10px] tracking-widest">
      {label}
    </span>
  </aside>
);
