import { RetroButton } from '@/components/ui/RetroButton';
import { RetroContainer } from '@/components/ui/RetroContainer';
import { useRoom } from '@/hooks/useRoom';
import type { Player } from '@/types';
import { CategoryValidationBlock } from './components/CategoryValidationBlock';
import { computeAnswerPoints } from './scoring';

/** The Host judges all six players on a single screen; Players watch it happen. */
export const RoundValidationScreen = () => {
  const { state, isHost, dispatch } = useRoom();
  // Only STOP reaches this screen; QUIZ scores itself and skips it.
  const round = state.currentRound?.game === 'STOP' ? state.currentRound : null;

  if (round === null) return null;

  const players = state.slots.filter((slot): slot is Player => slot !== null);
  const isScored = round.isScored;

  // An empty field has nothing to judge, so it never blocks the confirmation.
  const judgeable = round.answers.filter((answer) => answer.value.trim() !== '');
  const judged = judgeable.filter((answer) => answer.isValid !== null);
  const isComplete = judged.length === judgeable.length;

  const points = computeAnswerPoints(round);
  const pointsFor = (category: string): Record<string, number> =>
    Object.fromEntries(
      points
        .filter((entry) => entry.category === category)
        .map((entry) => [entry.playerId, entry.points]),
    );

  return (
    <RetroContainer className="flex flex-col gap-5 p-6">
      <header className="flex flex-col items-center gap-2">
        <h1 className="font-arcade text-sm text-yellow-500">VALIDATION</h1>
        <p className="font-terminal text-lg text-gray-600">
          {isHost ? 'Approve or reject every answer.' : 'The Host is checking the answers...'}
        </p>
        <p className="font-arcade text-2xl text-green-600">{round.letter}</p>
        <p data-testid="judged-progress" className="font-arcade text-[10px] text-gray-500">
          {judged.length}/{judgeable.length} judged
        </p>
      </header>

      {round.categories.map((category) => (
        <CategoryValidationBlock
          key={category}
          category={category}
          players={players}
          scores={state.scores}
          answers={round.answers.filter((answer) => answer.category === category)}
          pointsByPlayer={pointsFor(category)}
          canJudge={isHost && !isScored}
          onJudge={(playerId, isValid) =>
            dispatch({ type: 'ANSWER_JUDGED', playerId, category, isValid })
          }
        />
      ))}

      {isHost && (
        <div className="flex flex-col gap-2">
          {!isComplete && !isScored && (
            <RetroButton
              tone="cyan"
              onClick={() => dispatch({ type: 'REMAINING_ANSWERS_APPROVED' })}
            >
              APPROVE ALL REMAINING
            </RetroButton>
          )}

          <RetroButton
            tone="green"
            disabled={isScored || !isComplete}
            onClick={() => dispatch({ type: 'ROUND_SCORED' })}
          >
            {isScored ? 'SCORES CONFIRMED' : 'CONFIRM SCORES'}
          </RetroButton>
        </div>
      )}
    </RetroContainer>
  );
};
