import { MAX_PLAYERS, type PlayerSlot } from '@/types';
import { InviteSlotRow } from './InviteSlotRow';
import { PlayerSlotCard } from './PlayerSlotCard';

interface CharacterSelectGridProps {
  slots: readonly PlayerSlot[];
  scores: Readonly<Record<string, number>>;
  pin: string;
}

/**
 * 6-slot board, one rectangular row per seat. Filled seats are always packed
 * at the front (see `buildSlotsFromPresence`), so the list only ever needs
 * to show one open seat past them, not five — the rest is implied. Everyone
 * seated gets that one open seat as an invite CTA instead of a plain "OPEN"
 * row (#104) — inviting isn't a Host-only action, copying the link is a
 * client-only clipboard write with no room permissions behind it.
 */
export const CharacterSelectGrid = ({ slots, scores, pin }: CharacterSelectGridProps) => {
  // Nobody is crowned while the whole room is still on zero.
  const topScore = Math.max(0, ...slots.map((slot) => (slot ? (scores[slot.id] ?? 0) : 0)));
  const filledCount = slots.filter((slot) => slot !== null).length;
  const visibleSlots = slots.slice(0, Math.min(filledCount + 1, MAX_PLAYERS));

  return (
    <ul className="flex flex-col gap-2">
      {visibleSlots.map((slot, index) => {
        const isOpenSeat = slot === null && index === visibleSlots.length - 1;

        if (isOpenSeat) {
          return <InviteSlotRow key="invite" pin={pin} />;
        }

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
