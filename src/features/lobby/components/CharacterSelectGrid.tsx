import type { PlayerSlot } from '@/types';
import { PlayerSlotCard } from './PlayerSlotCard';

interface CharacterSelectGridProps {
  slots: readonly PlayerSlot[];
  scores: Readonly<Record<string, number>>;
}

/** 6-slot board: 2 columns on mobile, 3 once there is width for them. */
export const CharacterSelectGrid = ({ slots, scores }: CharacterSelectGridProps) => {
  // Nobody is crowned while the whole room is still on zero.
  const topScore = Math.max(0, ...slots.map((slot) => (slot ? (scores[slot.id] ?? 0) : 0)));

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {slots.map((slot, index) => {
        const score = slot ? (scores[slot.id] ?? 0) : 0;

        return (
          <PlayerSlotCard
            key={slot?.id ?? `empty-${index}`}
            index={index}
            slot={slot}
            score={score}
            isLeader={slot !== null && topScore > 0 && score === topScore}
          />
        );
      })}
    </ul>
  );
};
