import { ArcadeButton } from '@/components/ui/ArcadeButton';
import type { GameId } from '@/types';
import { cn } from '@/utils/cn';
import { GAME_CARTRIDGES } from '../cartridges';

interface GameCartridgePickerProps {
  selectedGameId: GameId | null;
  /** Omitted for Clients: they see the same shelf, read-only. */
  onSelect?: ((gameId: GameId) => void) | undefined;
}

export const GameCartridgePicker = ({ selectedGameId, onSelect }: GameCartridgePickerProps) => {
  const isReadOnly = onSelect === undefined;

  return (
    <div className="flex flex-col gap-2">
      <p className="font-terminal text-xs uppercase tracking-[0.3em] text-slate-400">
        {isReadOnly ? 'Cartridge shelf' : 'Choose a cartridge'}
      </p>

      {GAME_CARTRIDGES.map((cartridge) => {
        const isSelected = selectedGameId === cartridge.id;

        return (
          <ArcadeButton
            key={cartridge.id}
            tone="yellow"
            aria-label={cartridge.title}
            aria-pressed={isSelected}
            disabled={isReadOnly}
            onClick={onSelect === undefined ? undefined : () => onSelect(cartridge.id)}
            className={cn(
              'flex flex-col items-start gap-1 text-left',
              isSelected && 'bg-arcade-yellow/20',
              // The Host's pick must stay legible on the Client's disabled shelf.
              isSelected && 'disabled:border-arcade-yellow disabled:text-arcade-yellow',
            )}
          >
            <span>{cartridge.title}</span>
            <span className="font-terminal text-sm normal-case opacity-80">
              {cartridge.tagline}
            </span>
          </ArcadeButton>
        );
      })}
    </div>
  );
};
