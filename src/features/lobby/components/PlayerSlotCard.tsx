import type { AvatarId, PlayerSlot } from '@/types';
import { cn } from '@/utils/cn';

const AVATAR_COLORS: Record<AvatarId, string> = {
  RED: 'text-red-400',
  BLUE: 'text-blue-400',
  GREEN: 'text-arcade-green',
  PINK: 'text-arcade-pink',
  CYAN: 'text-arcade-cyan',
  YELLOW: 'text-arcade-yellow',
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
      'flex aspect-square flex-col items-center justify-center gap-1 rounded-md border-2 p-2 text-center',
      slot ? 'bg-slate-800' : 'animate-blink border-dashed border-slate-700 bg-slate-900/60',
      slot && (isLeader ? 'border-arcade-yellow shadow-neon' : 'border-arcade-green/70'),
    )}
  >
    <span
      className={cn('font-arcade text-lg', slot ? AVATAR_COLORS[slot.avatarId] : 'text-slate-700')}
    >
      {slot ? '◆' : '?'}
    </span>

    <span
      className={cn('break-all font-arcade text-[9px]', slot ? 'text-slate-100' : 'text-slate-600')}
    >
      {slot ? slot.nickname : 'OPEN'}
    </span>

    {slot && (
      <span
        className={cn('font-arcade text-[9px]', isLeader ? 'text-arcade-yellow' : 'text-slate-500')}
      >
        {score}
      </span>
    )}
  </li>
);
