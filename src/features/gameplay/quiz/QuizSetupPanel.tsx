import { SectionLabel } from '@/components/ui/SectionLabel';
import {
  QUIZ_QUESTION_COUNTS,
  ROUND_DURATIONS,
  type QuizQuestionCount,
  type QuizSetup,
  type RoundDuration,
} from '@/types';
import { cn } from '@/utils/cn';
import { QUIZ_TOPICS } from './quizRound';

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
    <div className="flex flex-col gap-4 border-4 border-ink bg-white/60 p-3">
      <div className="flex flex-col gap-2">
        <SectionLabel>Time to answer</SectionLabel>
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
                '[text-shadow:1px_1px_0_rgba(0,0,0,0.6)]',
                'disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none',
                setup.roundDurationSeconds === seconds
                  ? 'translate-x-[2px] translate-y-[2px] border-[6px] border-flare bg-sky-500/80 shadow-none outline outline-1 outline-ink/50'
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
        <SectionLabel>Questions</SectionLabel>
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
                'min-h-11 py-2 font-arcade text-[10px] text-white transition-[transform,border-width]',
                '[text-shadow:1px_1px_0_rgba(0,0,0,0.6)]',
                'disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none',
                setup.questionCount === count
                  ? 'translate-x-[2px] translate-y-[2px] border-[6px] border-flare bg-rose-500/80 shadow-none outline outline-1 outline-ink/50'
                  : cn(
                      'border-4 border-ink bg-rose-500 shadow-[2px_2px_0px_0px_#381a41]',
                      'active:bg-rose-500/80',
                    ),
              )}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <SectionLabel>Topic</SectionLabel>
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
                'min-h-11 px-3 py-2 font-arcade text-[9px] text-white transition-[transform,border-width]',
                '[text-shadow:1px_1px_0_rgba(0,0,0,0.6)]',
                'disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none',
                setup.topic === topic
                  ? 'translate-x-[2px] translate-y-[2px] border-[6px] border-flare bg-green-500/80 shadow-none outline outline-1 outline-ink/50'
                  : cn(
                      'border-4 border-ink bg-green-500 shadow-[2px_2px_0px_0px_#381a41]',
                      'active:bg-green-500/80',
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
