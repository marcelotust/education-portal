import type { StopRound } from '@/types';

/** Classic STOP scoring: an answer nobody else had is worth double. */
export const UNIQUE_POINTS = 10;
export const DUPLICATE_POINTS = 5;

const normalise = (value: string): string => value.trim().toUpperCase();

/** An answer only counts once the Host has not rejected it and it is not blank. */
const counts = (isValid: boolean | null, value: string): boolean =>
  isValid !== false && normalise(value) !== '';

export interface AnswerPoints {
  playerId: string;
  category: string;
  points: number;
}

/**
 * What every single answer is worth, so the Host can see the duplicate rule at
 * work while judging: rejecting one copy of a word hands the other player the
 * full points back.
 */
export const computeAnswerPoints = (round: StopRound): AnswerPoints[] => {
  const points: AnswerPoints[] = [];

  for (const category of round.categories) {
    const valid = round.answers.filter(
      (answer) => answer.category === category && counts(answer.isValid, answer.value),
    );

    const timesUsed = new Map<string, number>();
    for (const answer of valid) {
      const word = normalise(answer.value);
      timesUsed.set(word, (timesUsed.get(word) ?? 0) + 1);
    }

    for (const answer of round.answers.filter((entry) => entry.category === category)) {
      const shared = (timesUsed.get(normalise(answer.value)) ?? 0) > 1;
      const earned = counts(answer.isValid, answer.value)
        ? shared
          ? DUPLICATE_POINTS
          : UNIQUE_POINTS
        : 0;
      points.push({ playerId: answer.playerId, category, points: earned });
    }
  }

  return points;
};

/**
 * Points per player for a finished round. Duplicates are compared per category
 * and only among answers that count, so a rejected copy of a word never drags
 * down the player who wrote it legitimately.
 */
export const computeRoundScores = (
  round: StopRound,
  playerIds: readonly string[] = [],
): Record<string, number> => {
  const scores: Record<string, number> = {};
  for (const playerId of playerIds) scores[playerId] = 0;

  for (const { playerId, points } of computeAnswerPoints(round)) {
    scores[playerId] = (scores[playerId] ?? 0) + points;
  }

  // Players who answered nothing still belong on the scoreboard.
  for (const answer of round.answers) scores[answer.playerId] ??= 0;

  return scores;
};
