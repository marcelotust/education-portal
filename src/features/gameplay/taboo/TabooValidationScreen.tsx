import { PageTitle } from '@/components/ui/PageTitle';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroContainer } from '@/components/ui/RetroContainer';
import { useRoom } from '@/hooks/useRoom';
import type { Player } from '@/types';
import { GuessValidationBlock } from './components/GuessValidationBlock';
import { computeTabooScores, currentTurn } from './tabooRound';

/**
 * The Host judges every guesser on a single screen, same shape as STOP's
 * validation (#141); the clue-giver and Players watch it happen, same as they
 * would watch a Host judge STOP.
 */
export const TabooValidationScreen = () => {
  const { state, isHost, dispatch } = useRoom();
  // Only TABOO reaches this screen; QUIZ scores itself and skips it.
  const round = state.currentRound?.game === 'TABOO' ? state.currentRound : null;
  const turn = round === null ? undefined : currentTurn(round);

  if (round === null || turn === undefined) return null;

  const clueGiverNickname =
    state.slots.find((slot) => slot?.id === turn.clueGiverId)?.nickname ?? 'SOMEBODY';
  const guessers = state.slots.filter(
    (slot): slot is Player => slot !== null && slot.id !== turn.clueGiverId,
  );
  const isScored = round.isScored;

  const judgeable = round.guesses.filter((guess) => guess.value.trim() !== '');
  const judged = judgeable.filter((guess) => guess.isValid !== null);
  const isComplete = judged.length === judgeable.length;

  const pointsByPlayer = computeTabooScores(round);

  return (
    <RetroContainer className="flex flex-col gap-5 p-6">
      <header className="flex flex-col items-center gap-2">
        <PageTitle tone="yellow">VALIDATION</PageTitle>
        <p className="font-terminal text-lg text-gray-600">
          {isHost ? 'Approve or reject every guess.' : 'The Host is checking the guesses...'}
        </p>
        <p className="text-center font-terminal text-lg text-gray-600">
          {clueGiverNickname} was explaining
        </p>
        <p className="text-solid-shadow font-arcade text-2xl text-green-600">{turn.card.word}</p>
        <p data-testid="judged-progress" className="font-arcade text-[10px] text-gray-500">
          {judged.length}/{judgeable.length} judged
        </p>
      </header>

      <GuessValidationBlock
        guessers={guessers}
        guesses={round.guesses}
        pointsByPlayer={pointsByPlayer}
        canJudge={isHost && !isScored}
        onJudge={(playerId, isValid) => dispatch({ type: 'GUESS_JUDGED', playerId, isValid })}
      />

      {isHost && (
        <div className="flex flex-col gap-2">
          {!isComplete && !isScored && (
            <RetroButton
              tone="cyan"
              onClick={() => dispatch({ type: 'REMAINING_GUESSES_APPROVED' })}
            >
              APPROVE ALL REMAINING
            </RetroButton>
          )}

          <RetroButton
            tone="green"
            disabled={isScored || !isComplete}
            onClick={() => dispatch({ type: 'TURN_SCORED' })}
          >
            {isScored ? 'SCORES CONFIRMED' : 'CONFIRM SCORES'}
          </RetroButton>
        </div>
      )}
    </RetroContainer>
  );
};
