import { SectionLabel } from '@/components/ui/SectionLabel';
import { MIN_CATEGORIES, ROUND_DURATIONS, type RoundDuration, type StopSetup } from '@/types';
import { cn } from '@/utils/cn';
import { STOP_CATEGORY_CATALOG } from './stopRound';

interface StopSetupPanelProps {
  setup: StopSetup;
  /** Omitted for Players: they watch the Host configure the match. */
  onSelectDuration?: ((seconds: RoundDuration) => void) | undefined;
  onToggleCategory?: ((category: string) => void) | undefined;
}

export const StopSetupPanel = ({
  setup,
  onSelectDuration,
  onToggleCategory,
}: StopSetupPanelProps) => {
  const isReadOnly = onSelectDuration === undefined;
  const chosen = setup.categories.length;
  const missing = MIN_CATEGORIES - chosen;

  return (
    <div className="flex flex-col gap-4 border-4 border-ink bg-white/60 p-3">
      <div className="flex flex-col gap-2">
        <SectionLabel>Round length</SectionLabel>
        <div className="grid grid-cols-4 gap-2">
          {ROUND_DURATIONS.map((seconds) => (
            <button
              key={seconds}
              type="button"
              aria-label={`${seconds} seconds`}
              aria-pressed={setup.roundDurationSeconds === seconds}
              disabled={isReadOnly}
              onClick={() => onSelectDuration?.(seconds)}
              className={cn(
                'min-h-11 py-2 font-arcade text-[10px] text-white transition-[transform,border-width]',
                'disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none',
                setup.roundDurationSeconds === seconds
                  ? 'translate-x-[2px] translate-y-[2px] border-[6px] border-flare bg-sky-500/80 shadow-none'
                  : cn(
                      'border-4 border-ink bg-sky-500 shadow-[2px_2px_0px_0px_#381a41]',
                      'active:bg-sky-500/80',
                    ),
              )}
            >
              {seconds}s
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <SectionLabel>Categories ({chosen})</SectionLabel>

        <div className="flex flex-wrap gap-2">
          {STOP_CATEGORY_CATALOG.map((category) => {
            const isChosen = setup.categories.includes(category);

            return (
              <button
                key={category}
                type="button"
                aria-label={category}
                aria-pressed={isChosen}
                disabled={isReadOnly}
                onClick={() => onToggleCategory?.(category)}
                className={cn(
                  'min-h-11 px-3 py-2 font-arcade text-[9px] text-white transition-[transform,border-width]',
                  'disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none',
                  isChosen
                    ? 'translate-x-[2px] translate-y-[2px] border-[6px] border-flare bg-green-500/80 shadow-none'
                    : cn(
                        'border-4 border-ink bg-green-500 shadow-[2px_2px_0px_0px_#381a41]',
                        'active:bg-green-500/80',
                      ),
                )}
              >
                {category}
              </button>
            );
          })}
        </div>

        {missing > 0 && (
          <p role="status" className="font-terminal text-sm text-rose-500">
            Pick {missing} more to start ({MIN_CATEGORIES} minimum).
          </p>
        )}
      </div>
    </div>
  );
};
