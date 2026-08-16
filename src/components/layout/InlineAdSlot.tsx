interface InlineAdSlotProps {
  label: string;
}

/**
 * Ad space inside the content column, for the screens a phone has no lateral
 * room for (`AdSlot` is hidden below `lg:`). Decorative placeholder for the
 * MVP, same as `AdSlot`: no network calls, no real ad unit yet (#18).
 */
export const InlineAdSlot = ({ label }: InlineAdSlotProps) => (
  <div
    data-testid="inline-ad-slot"
    aria-hidden="true"
    className="flex h-16 items-center justify-center border-4 border-dashed border-ink/20 text-black/40 lg:hidden"
  >
    <span className="font-arcade text-[9px] tracking-widest">{label}</span>
  </div>
);
