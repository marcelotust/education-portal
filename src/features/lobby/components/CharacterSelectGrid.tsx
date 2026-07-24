import type { PlayerSlot } from '@/types';
import { PlayerSlotCard } from './PlayerSlotCard';

interface CharacterSelectGridProps {
  slots: readonly PlayerSlot[];
}

/** 6-slot board: 2 columns on mobile, 3 once there is width for them. */
export const CharacterSelectGrid = ({ slots }: CharacterSelectGridProps) => (
  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
    {slots.map((slot, index) => (
      <PlayerSlotCard key={slot?.id ?? `empty-${index}`} index={index} slot={slot} />
    ))}
  </ul>
);
