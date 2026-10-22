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

const MIN_BEAT_MS = 800;
const BEAT_SPREAD_MS = 1_000;

/** The short pause after the last human answers, so the bot never looks instant (#165). */
export const botBeatMs = (random: () => number): number =>
  MIN_BEAT_MS + Math.floor(random() * BEAT_SPREAD_MS);

interface ReplyDelayInput {
  /** What is left of the pause planned when the question appeared. */
  plannedLeftMs: number;
  /** Every real participant seated has answered. */
  humansDone: boolean;
  beatMs: number;
}

/**
 * The planned pause is there to give people time to think. Once nobody is
 * left thinking it only makes them wait, so the bot answers after a short beat,
 * and never later than it had planned to.
 */
export const botReplyDelayMs = ({ plannedLeftMs, humansDone, beatMs }: ReplyDelayInput): number =>
  Math.max(0, humansDone ? Math.min(plannedLeftMs, beatMs) : plannedLeftMs);

/**
 * The time recorded with the bot's answer. Never at or below the last human's,
 * so speeding the bot up cannot take the fastest-answer bonus from someone
 * who answered first.
 */
export const botElapsedMs = (realElapsedMs: number, lastHumanElapsedMs: number | null): number =>
  lastHumanElapsedMs === null ? realElapsedMs : Math.max(realElapsedMs, lastHumanElapsedMs + 1);
