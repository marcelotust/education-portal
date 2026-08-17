import { GameSpriteThumb } from '@/components/ui/GameSpriteThumb';
import { RetroButton } from '@/components/ui/RetroButton';
import { SectionLabel } from '@/components/ui/SectionLabel';
import type { GameId } from '@/types';
import { GAME_CARTRIDGES, LOADING_CARD } from '../cartridges';

interface GameCartridgePickerProps {
  selectedGameId: GameId | null;
  /** Omitted for Players: they see the same shelf, read-only. */
  onSelect?: ((gameId: GameId) => void) | undefined;
}

export const GameCartridgePicker = ({ selectedGameId, onSelect }: GameCartridgePickerProps) => {
  const isReadOnly = onSelect === undefined;

  return (
    <div className="flex flex-col gap-2">
      <SectionLabel>{isReadOnly ? 'Game shelf' : 'Choose a game'}</SectionLabel>

      <div className="grid grid-cols-3 gap-3">
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
              // A mouse/touch click shouldn't leave the button focused: the
              // setup panel that mounts right below it once selected would
              // otherwise trigger the browser's scroll-to-focused-element
              // correction, jumping the page under the Host's thumb.
              onMouseDown={(event) => event.preventDefault()}
              onClick={onSelect === undefined ? undefined : () => onSelect(cartridge.id)}
              className="flex flex-col items-center gap-2 text-center"
            >
              <GameSpriteThumb
                spritePosition={cartridge.spritePosition}
                className="drop-shadow-[3px_5px_4px_rgba(56,26,65,0.55)]"
              />
              <span>{cartridge.title}</span>
              <span className="font-terminal text-sm normal-case opacity-80">
                {cartridge.tagline}
              </span>
            </RetroButton>
          );
        })}
      </div>

      <RetroButton
        tone="white"
        disabled
        aria-label={`${LOADING_CARD.title}: ${LOADING_CARD.tagline}`}
        className="flex w-full items-center gap-3 text-left"
      >
        <div className="w-16 shrink-0">
          <GameSpriteThumb
            spritePosition={LOADING_CARD.spritePosition}
            className="opacity-80 drop-shadow-[3px_5px_4px_rgba(56,26,65,0.55)]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span>{LOADING_CARD.title}</span>
          <span className="font-terminal text-sm normal-case opacity-80">
            {LOADING_CARD.tagline}
          </span>
        </div>
      </RetroButton>
    </div>
  );
};
