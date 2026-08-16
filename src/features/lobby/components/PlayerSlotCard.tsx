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
      'flex min-h-14 items-center gap-3 border-4 border-black px-3 py-2',
      slot
        ? cn('bg-white', isLeader ? 'shadow-[4px_4px_0px_0px_rgba(234,179,8,1)]' : 'shadow-retro')
        : 'border-dashed border-gray-300 bg-gray-50',
    )}
  >
    <span
      aria-hidden
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center border-2 font-arcade text-lg',
        slot
          ? cn(AVATAR_BLOCK_COLORS[slot.avatarId], 'border-black text-white')
          : 'border-dashed border-gray-300 text-gray-300',
      )}
    >
      {slot ? '◆' : '?'}
    </span>

    <span
      className={cn(
        'flex-1 truncate text-left font-arcade text-[10px]',
        slot ? 'text-black' : 'text-gray-400',
      )}
    >
      {slot ? slot.nickname : 'OPEN'}
    </span>

    {isLeader && (
      <span aria-hidden className="font-arcade text-sm text-yellow-500">
        ★
      </span>
    )}

    {slot && <span className="font-arcade text-[10px] text-gray-500">{score}</span>}
  </li>
);
