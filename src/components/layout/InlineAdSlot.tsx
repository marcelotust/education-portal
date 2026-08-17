interface InlineAdSlotProps {
  label: string;
}

/**
 * Ad space inside the content column, for the screens a phone has no lateral
 * room for (`AdSlot` is hidden below `lg:`). Renders nothing until a real
 * AdSense publisher ID is configured (#90), same as `AdSlot`.
 */
export const InlineAdSlot = ({ label }: InlineAdSlotProps) => {
  if (!import.meta.env.VITE_ADSENSE_PUBLISHER_ID) return null;

  return (
    <div
      data-testid="inline-ad-slot"
      aria-hidden="true"
      className="flex h-16 items-center justify-center border-4 border-dashed border-ink/20 text-black/40 lg:hidden"
    >
      <span className="font-arcade text-[9px] tracking-widest">{label}</span>
    </div>
  );
};
