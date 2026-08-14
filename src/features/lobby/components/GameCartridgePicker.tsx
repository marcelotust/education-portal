import { RetroButton } from '@/components/ui/RetroButton';
import { SectionLabel } from '@/components/ui/SectionLabel';
import type { GameId } from '@/types';
import { GAME_CARTRIDGES } from '../cartridges';

interface GameCartridgePickerProps {
  selectedGameId: GameId | null;
  /** Omitted for Players: they see the same shelf, read-only. */
  onSelect?: ((gameId: GameId) => void) | undefined;
}

export const GameCartridgePicker = ({ selectedGameId, onSelect }: GameCartridgePickerProps) => {
  const isReadOnly = onSelect === undefined;

  return (
    <div className="flex flex-col gap-2">
      <SectionLabel>{isReadOnly ? 'Cartridge shelf' : 'Choose a cartridge'}</SectionLabel>

      {GAME_CARTRIDGES.map((cartridge) => {
        const isSelected = selectedGameId === cartridge.id;

        return (
          <RetroButton
            key={cartridge.id}
            tone="yellow"
            pressed={isSelected}
            aria-label={cartridge.title}
            aria-pressed={isSelected}
            disabled={isReadOnly}
            onClick={onSelect === undefined ? undefined : () => onSelect(cartridge.id)}
            className="flex flex-col items-start gap-1 text-left"
          >
            <span>{cartridge.title}</span>
            <span className="font-terminal text-sm normal-case opacity-80">
              {cartridge.tagline}
            </span>
          </RetroButton>
        );
      })}
    </div>
  );
};
