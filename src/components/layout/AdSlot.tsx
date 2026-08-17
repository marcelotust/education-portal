interface AdSlotProps {
  label: string;
}

/**
 * Reserved lateral space for ads on desktop. Renders nothing until a real
 * AdSense publisher ID is configured (#90) — no placeholder box in
 * production. #52 wires in the real ad unit behind the same env check.
 */
export const AdSlot = ({ label }: AdSlotProps) => {
  if (!import.meta.env.VITE_ADSENSE_PUBLISHER_ID) return null;

  return (
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
};
