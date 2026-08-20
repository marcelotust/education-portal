import { PageTitle } from '@/components/ui/PageTitle';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroContainer } from '@/components/ui/RetroContainer';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useRoom } from '@/hooks/useRoom';
import type { Player } from '@/types';
import { cn } from '@/utils/cn';
import { CORRECT_POINTS, SPEED_BONUS, currentQuestion, isLastQuestion } from './quizRound';

const LETTERS = ['A', 'B', 'C', 'D'];

interface QuizRevealScreenProps {
  playerId: string;
}

/**
 * The pause between two questions. Until now a QUIZ never told anyone what the
 * right answer was — the round simply ended. This is that moment, and it waits
 * for the Host so they can explain before the next question starts.
 */
export const QuizRevealScreen = ({ playerId }: QuizRevealScreenProps) => {
  const { state, isHost, dispatch } = useRoom();
  const round = state.currentRound?.game === 'QUIZ' ? state.currentRound : null;
  const question = round === null ? undefined : currentQuestion(round);
  if (round === null || question === undefined) return null;

  const ownAnswer = round.answers.find((answer) => answer.playerId === playerId);
  const ownWrongIndex =
    ownAnswer !== undefined && ownAnswer.choice !== question.correctIndex ? ownAnswer.choice : null;

  const seatedPlayers = state.slots.filter((slot): slot is Player => slot !== null);
  const playersById = new Map(seatedPlayers.map((player) => [player.id, player]));

  const votersByOption: Player[][] = question.options.map((_, index) =>
    round.answers
      .filter((answer) => answer.choice === index)
      .map((answer) => playersById.get(answer.playerId))
      .filter((player): player is Player => player !== undefined),
  );

  const noAnswerPlayers = seatedPlayers.filter(
    (player) => !round.answers.some((answer) => answer.playerId === player.id),
  );

  const scored = seatedPlayers
    .map((player) => ({
      player,
      gained: round.questionPoints[player.id] ?? 0,
      total: state.scores[player.id] ?? 0,
    }))
    .sort((a, b) => b.gained - a.gained || b.total - a.total);

  const isLast = isLastQuestion(round);

  const advance = () =>
    dispatch({
      type: 'NEXT_QUESTION',
      // The next question runs its own clock, started when the Host moves on.
      endsAt: new Date(Date.now() + state.gameSetup.roundDurationSeconds * 1000).toISOString(),
    });

  return (
    <RetroContainer className="flex flex-col gap-5 p-6">
      <header className="flex flex-col items-center gap-1">
        <PageTitle tone="yellow">VALIDATION</PageTitle>
        <SectionLabel>Question</SectionLabel>
        <span data-testid="question-progress" className="font-arcade text-sm text-green-600">
          {round.currentIndex + 1}/{round.questions.length}
        </span>
      </header>

      <h2 className="text-center font-terminal text-2xl text-black">{question.prompt}</h2>

      <ul className="flex flex-col gap-2">
        {question.options.map((option, index) => {
          const isCorrect = index === question.correctIndex;
          const isOwnWrongPick = index === ownWrongIndex;
          const voters = votersByOption[index] ?? [];
          return (
            <li key={option}>
              <div
                {...(isCorrect ? { 'data-testid': 'correct-option' } : {})}
                className={cn(
                  'flex items-center gap-3 border-4 px-3 py-3 font-terminal text-xl',
                  isCorrect && 'border-ink bg-green-100 text-green-700',
                  isOwnWrongPick && 'border-ink bg-rose-100 text-rose-700',
                  !isCorrect && !isOwnWrongPick && 'border-ink bg-white text-gray-500',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center border-2 font-arcade text-[10px]',
                    isCorrect && 'border-green-700 text-green-700',
                    isOwnWrongPick && 'border-rose-700 text-rose-700',
                    !isCorrect && !isOwnWrongPick && 'border-gray-400 text-gray-500',
                  )}
                >
                  {LETTERS[index]}
                </span>
                <span>{option}</span>
                {isCorrect && <span className="ml-auto font-arcade text-[9px]">CORRECT</span>}
                {isOwnWrongPick && (
                  <span className="ml-auto font-arcade text-[9px]">YOUR PICK</span>
                )}
              </div>
              {voters.length > 0 && (
                <ul
                  data-testid={`option-voters-${index}`}
                  className="mt-1 flex flex-wrap gap-1 pl-3"
                >
                  {voters.map((voter) => (
                    <li
                      key={voter.id}
                      className="border-2 border-ink bg-white px-2 py-0.5 font-arcade text-[8px] text-black"
                    >
                      {voter.nickname}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      {noAnswerPlayers.length > 0 && (
        <p
          data-testid="no-answer-players"
          className="text-center font-terminal text-lg text-gray-500"
        >
          No answer: {noAnswerPlayers.map((player) => player.nickname).join(', ')}
        </p>
      )}

      <ol className="flex flex-col gap-1">
        {scored.map(({ player, gained, total }) => (
          <li
            key={player.id}
            data-testid={`reveal-row-${player.id}`}
            className={cn(
              'flex items-center gap-2 border-2 border-ink px-2 py-1',
              gained > 0 ? 'bg-green-100' : 'bg-white',
            )}
          >
            <span className="flex-1 font-arcade text-[9px] text-black">{player.nickname}</span>
            {gained > 0 ? (
              <div className="flex flex-col items-end gap-0.5">
                <span className="font-arcade text-[8px] text-sky-600">
                  +{CORRECT_POINTS} CORRECT
                </span>
                {gained > CORRECT_POINTS && (
                  <span className="font-arcade text-[8px] text-amber-600">
                    +{SPEED_BONUS} FASTEST
                  </span>
                )}
              </div>
            ) : (
              <span className="font-arcade text-[9px] text-sky-600">—</span>
            )}
            <span className="w-8 shrink-0 text-right font-arcade text-[10px] text-green-600">
              {total}
            </span>
          </li>
        ))}
      </ol>

      {isHost ? (
        <RetroButton tone={isLast ? 'yellow' : 'green'} onClick={advance}>
          {isLast ? 'SEE THE SCOREBOARD' : 'NEXT QUESTION'}
        </RetroButton>
      ) : (
        <p role="status" className="text-center font-terminal text-lg text-gray-600">
          Waiting for the Host to move on...
        </p>
      )}
    </RetroContainer>
  );
};
