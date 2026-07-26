import {
  QUIZ_QUESTION_COUNTS,
  ROUND_DURATIONS,
  type QuizQuestionCount,
  type QuizSetup,
  type RoundDuration,
} from '@/types';
import { cn } from '@/utils/cn';
import { QUIZ_TOPICS } from './questionPacks';

interface QuizSetupPanelProps {
  setup: QuizSetup;
  /** Omitted for Clients: they watch the Host configure the match. */
  onSelectDuration?: ((seconds: RoundDuration) => void) | undefined;
  onSelectTopic?: ((topic: string) => void) | undefined;
  onSelectQuestionCount?: ((count: QuizQuestionCount) => void) | undefined;
}

export const QuizSetupPanel = ({
  setup,
  onSelectDuration,
  onSelectTopic,
  onSelectQuestionCount,
}: QuizSetupPanelProps) => {
  const isReadOnly = onSelectDuration === undefined;

  return (
    <div className="flex flex-col gap-4 rounded-lg border-2 border-slate-800 p-3">
      <div className="flex flex-col gap-2">
        <p className="font-terminal text-xs uppercase tracking-[0.3em] text-slate-400">
          Time to answer
        </p>
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
                'min-h-11 rounded border-2 py-2 font-arcade text-[10px] transition-colors',
                setup.roundDurationSeconds === seconds
                  ? 'border-arcade-cyan text-arcade-cyan disabled:border-arcade-cyan disabled:text-arcade-cyan'
                  : 'border-slate-700 text-slate-500',
                'disabled:cursor-not-allowed',
              )}
            >
              {seconds}s
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-terminal text-xs uppercase tracking-[0.3em] text-slate-400">Questions</p>
        <div className="grid grid-cols-3 gap-2">
          {QUIZ_QUESTION_COUNTS.map((count) => (
            <button
              key={count}
              type="button"
              aria-label={`${count} questions`}
              aria-pressed={setup.questionCount === count}
              disabled={isReadOnly}
              onClick={() => onSelectQuestionCount?.(count)}
              className={cn(
                'min-h-11 rounded border-2 py-2 font-arcade text-[10px] transition-colors',
                setup.questionCount === count
                  ? 'border-arcade-pink text-arcade-pink disabled:border-arcade-pink disabled:text-arcade-pink'
                  : 'border-slate-700 text-slate-500',
                'disabled:cursor-not-allowed',
              )}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-terminal text-xs uppercase tracking-[0.3em] text-slate-400">Topic</p>
        <div className="flex flex-wrap gap-2">
          {QUIZ_TOPICS.map((topic) => (
            <button
              key={topic}
              type="button"
              aria-label={topic}
              aria-pressed={setup.topic === topic}
              disabled={isReadOnly}
              onClick={() => onSelectTopic?.(topic)}
              className={cn(
                'min-h-11 rounded border-2 px-3 py-2 font-arcade text-[9px] transition-colors',
                setup.topic === topic
                  ? 'border-arcade-green text-arcade-green disabled:border-arcade-green disabled:text-arcade-green'
                  : 'border-slate-800 text-slate-600',
                'disabled:cursor-not-allowed',
              )}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
