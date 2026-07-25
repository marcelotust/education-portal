import { ArcadeButton } from '@/components/ui/ArcadeButton';
import { useRoom } from '@/hooks/useRoom';
import type { Player } from '@/types';
import { CategoryValidationBlock } from './components/CategoryValidationBlock';

/** The Host judges all six players on a single screen; Clients watch it happen. */
export const RoundValidationScreen = () => {
  const { state, isHost, dispatch } = useRoom();
  const round = state.currentRound;

  if (round === null) return null;

  const players = state.slots.filter((slot): slot is Player => slot !== null);
  const isScored = round.isScored;

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-col items-center gap-2">
        <h1 className="text-neon font-arcade text-sm text-arcade-yellow">VALIDATION</h1>
        <p className="font-terminal text-lg text-slate-400">
          {isHost ? 'Tap an answer to reject it.' : 'The teacher is checking the answers...'}
        </p>
        <p className="font-arcade text-2xl text-arcade-green">{round.letter}</p>
      </header>

      {round.categories.map((category) => (
        <CategoryValidationBlock
          key={category}
          category={category}
          players={players}
          answers={round.answers.filter((answer) => answer.category === category)}
          canJudge={isHost && !isScored}
          onJudge={(playerId, isValid) =>
            dispatch({ type: 'ANSWER_JUDGED', playerId, category, isValid })
          }
        />
      ))}

      {isHost && (
        <ArcadeButton
          tone="green"
          disabled={isScored}
          onClick={() => dispatch({ type: 'ROUND_SCORED' })}
        >
          {isScored ? 'SCORES CONFIRMED' : 'CONFIRM SCORES'}
        </ArcadeButton>
      )}
    </section>
  );
};
