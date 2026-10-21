import type { QuizQuestion } from '@/types';

/** An easy bot: it knows the answer about half the time. */
export const BOT_ACCURACY = 0.5;

/** The bot thinks for between 40% and 85% of the time left, so it is never first. */
const MIN_THINKING = 0.4;
const THINKING_SPREAD = 0.45;

export interface BotAnswerPlan {
  choice: number;
  delayMs: number;
}

/**
 * What the bot will pick and how long it takes. Pure, with the dice passed in,
 * so a spec can pin both; the rolls are taken in a fixed order (delay, then
 * whether it knows, then which wrong option).
 */
export const planBotAnswer = (
  question: QuizQuestion,
  remainingMs: number,
  random: () => number,
): BotAnswerPlan => {
  const delayMs = Math.round(
    Math.max(0, remainingMs) * (MIN_THINKING + THINKING_SPREAD * random()),
  );

  if (random() < BOT_ACCURACY) return { choice: question.correctIndex, delayMs };

  const wrong = question.options
    .map((_, index) => index)
    .filter((index) => index !== question.correctIndex);
  const pick = Math.min(wrong.length - 1, Math.floor(random() * wrong.length));

  return { choice: wrong[pick] ?? question.correctIndex, delayMs };
};
