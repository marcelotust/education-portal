import { ArcadeButton } from '@/components/ui/ArcadeButton';
import { useRoom } from '@/hooks/useRoom';
import type { Player } from '@/types';
import { cn } from '@/utils/cn';
import { currentQuestion, isLastQuestion } from './quizRound';

const LETTERS = ['A', 'B', 'C', 'D'];

/**
 * The pause between two questions. Until now a QUIZ never told anyone what the
 * right answer was — the round simply ended. This is that moment, and it waits
 * for the Host so a teacher can explain before the next question starts.
 */
export const QuizRevealScreen = () => {
  const { state, isHost, dispatch } = useRoom();
  const round = state.currentRound?.game === 'QUIZ' ? state.currentRound : null;
  const question = round === null ? undefined : currentQuestion(round);
  if (round === null || question === undefined) return null;

  const scored = state.slots
    .filter((slot): slot is Player => slot !== null)
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
    <section className="flex flex-col gap-5">
      <header className="flex flex-col items-center gap-1">
        <span className="font-terminal text-xs uppercase tracking-[0.3em] text-slate-400">
          Question
        </span>
        <span data-testid="question-progress" className="font-arcade text-sm text-arcade-green">
          {round.currentIndex + 1}/{round.questions.length}
        </span>
      </header>

      <h1 className="text-center font-terminal text-2xl text-slate-100">{question.prompt}</h1>

      <ul className="flex flex-col gap-2">
        {question.options.map((option, index) => {
          const isCorrect = index === question.correctIndex;
          return (
            <li key={option}>
              <div
                {...(isCorrect ? { 'data-testid': 'correct-option' } : {})}
                className={cn(
                  'flex items-center gap-3 rounded border-2 px-3 py-3 font-terminal text-xl',
                  isCorrect
                    ? 'border-arcade-green bg-arcade-green/15 text-arcade-green'
                    : 'border-slate-800 text-slate-500',
                )}
              >
                <span className="font-arcade text-[10px] text-slate-500">{LETTERS[index]}</span>
                {option}
                {isCorrect && <span className="ml-auto font-arcade text-[9px]">CORRECT</span>}
              </div>
            </li>
          );
        })}
      </ul>

      <ol className="flex flex-col gap-1">
        {scored.map(({ player, gained, total }) => (
          <li
            key={player.id}
            data-testid={`reveal-row-${player.id}`}
            className={cn(
              'flex items-center gap-2 rounded border px-2 py-1',
              gained > 0 ? 'border-arcade-green/60' : 'border-slate-800',
            )}
          >
            <span className="flex-1 font-arcade text-[9px] text-slate-200">{player.nickname}</span>
            <span className="font-arcade text-[9px] text-arcade-cyan">
              {gained > 0 ? `+${gained}` : '—'}
            </span>
            <span className="w-8 shrink-0 text-right font-arcade text-[10px] text-arcade-green">
              {total}
            </span>
          </li>
        ))}
      </ol>

      {isHost ? (
        <ArcadeButton tone={isLast ? 'yellow' : 'green'} onClick={advance}>
          {isLast ? 'SEE THE SCOREBOARD' : 'NEXT QUESTION'}
        </ArcadeButton>
      ) : (
        <p role="status" className="text-center font-terminal text-lg text-slate-400">
          Waiting for the Host to move on...
        </p>
      )}
    </section>
  );
};
