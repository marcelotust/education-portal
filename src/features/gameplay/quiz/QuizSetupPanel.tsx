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
  /** Omitted for Players: they watch the Host configure the match. */
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
    <div className="flex flex-col gap-4 border-4 border-black bg-white p-3">
      <div className="flex flex-col gap-2">
        <p className="font-terminal text-xs uppercase tracking-[0.3em] text-gray-500">
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
                'min-h-11 border-4 border-black py-2 font-arcade text-[10px] transition-transform disabled:cursor-not-allowed',
                setup.roundDurationSeconds === seconds
                  ? 'translate-x-[2px] translate-y-[2px] bg-sky-500 text-white shadow-none'
                  : cn(
                      'bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
                      'disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none',
                    ),
              )}
            >
              {seconds}s
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-terminal text-xs uppercase tracking-[0.3em] text-gray-500">Questions</p>
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
                'min-h-11 border-4 border-black py-2 font-arcade text-[10px] transition-transform disabled:cursor-not-allowed',
                setup.questionCount === count
                  ? 'translate-x-[2px] translate-y-[2px] bg-rose-500 text-white shadow-none'
                  : cn(
                      'bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
                      'disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none',
                    ),
              )}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-terminal text-xs uppercase tracking-[0.3em] text-gray-500">Topic</p>
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
                'min-h-11 border-4 border-black px-3 py-2 font-arcade text-[9px] transition-transform disabled:cursor-not-allowed',
                setup.topic === topic
                  ? 'translate-x-[2px] translate-y-[2px] bg-green-500 text-white shadow-none'
                  : cn(
                      'bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
                      'disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none',
                    ),
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
