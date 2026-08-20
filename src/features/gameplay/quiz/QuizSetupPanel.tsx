import { retroSelectableClasses } from '@/components/ui/retroButtonStyles';
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
                'min-h-11 py-2 font-arcade text-[10px]',
                retroSelectableClasses({
                  tone: 'cyan',
                  selected: setup.roundDurationSeconds === seconds,
                  size: 'sm',
                }),
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
                'min-h-11 py-2 font-arcade text-[10px]',
                retroSelectableClasses({
                  tone: 'pink',
                  selected: setup.questionCount === count,
                  size: 'sm',
                }),
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
                'min-h-11 px-3 py-2 font-arcade text-[9px]',
                retroSelectableClasses({
                  tone: 'green',
                  selected: setup.topic === topic,
                  size: 'sm',
                }),
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
