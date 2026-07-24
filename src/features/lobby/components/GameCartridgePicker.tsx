import { ArcadeButton } from '@/components/ui/ArcadeButton';
import type { GameId } from '@/types';
import { cn } from '@/utils/cn';
import { GAME_CARTRIDGES } from '../cartridges';

interface GameCartridgePickerProps {
  selectedGameId: GameId | null;
  onSelect: (gameId: GameId) => void;
}

/** Host-only cartridge shelf shown during CONFIGURING_GAME. */
export const GameCartridgePicker = ({ selectedGameId, onSelect }: GameCartridgePickerProps) => (
  <div className="flex flex-col gap-2">
    <p className="font-terminal text-xs uppercase tracking-[0.3em] text-slate-400">
      Choose a cartridge
    </p>

    {GAME_CARTRIDGES.map((cartridge) => (
      <ArcadeButton
        key={cartridge.id}
        tone="yellow"
        aria-label={cartridge.title}
        aria-pressed={selectedGameId === cartridge.id}
        onClick={() => onSelect(cartridge.id)}
        className={cn(
          'flex flex-col items-start gap-1 text-left',
          selectedGameId === cartridge.id && 'bg-arcade-yellow/20',
        )}
      >
        <span>{cartridge.title}</span>
        <span className="font-terminal text-sm normal-case opacity-80">{cartridge.tagline}</span>
      </ArcadeButton>
    ))}
  </div>
);
