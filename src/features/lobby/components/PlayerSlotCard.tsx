import type { AvatarId, PlayerSlot } from '@/types';
import { cn } from '@/utils/cn';

const AVATAR_BLOCK_COLORS: Record<AvatarId, string> = {
  RED: 'bg-red-400',
  BLUE: 'bg-blue-400',
  GREEN: 'bg-green-400',
  PINK: 'bg-pink-400',
  CYAN: 'bg-cyan-400',
  YELLOW: 'bg-yellow-400',
};

interface PlayerSlotCardProps {
  index: number;
  slot: PlayerSlot;
  /** Points carried over from earlier rounds in this session. */
  score: number;
  isLeader: boolean;
}

/** One seat of the 6-slot board, with the session score it carries. */
export const PlayerSlotCard = ({ index, slot, score, isLeader }: PlayerSlotCardProps) => (
  <li
    data-testid={`player-slot-${index}`}
    data-leader={isLeader}
    className={cn(
      'relative flex aspect-square flex-col items-center justify-center gap-1 border-4 border-black p-2 text-center',
      slot
        ? cn(
            AVATAR_BLOCK_COLORS[slot.avatarId],
            // A single shadow value: the inset bevel plus the solid offset drop,
            // in the leader's gold or the default black — two shadow utilities
            // of equal specificity can't reliably layer by source order.
            isLeader
              ? 'shadow-[inset_0_-4px_0_rgba(0,0,0,0.2),4px_4px_0px_0px_rgba(234,179,8,1)]'
              : 'shadow-[inset_0_-4px_0_rgba(0,0,0,0.2),4px_4px_0px_0px_rgba(0,0,0,1)]',
          )
        : 'border-dashed border-gray-300 bg-gray-50',
    )}
  >
    {isLeader && (
      <span
        aria-hidden
        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center border-2 border-black bg-yellow-300 font-arcade text-[10px] text-black"
      >
        ★
      </span>
    )}

    <span className={cn('font-arcade text-lg', slot ? 'text-white' : 'text-gray-300')}>
      {slot ? '◆' : '?'}
    </span>

    <span className={cn('break-all font-arcade text-[9px]', slot ? 'text-white' : 'text-gray-400')}>
      {slot ? slot.nickname : 'OPEN'}
    </span>

    {slot && <span className="font-arcade text-[9px] text-white/70">{score}</span>}
  </li>
);
