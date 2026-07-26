import type { QuizAnswer, QuizQuestion, QuizRound, QuizSetup } from '@/types';
import { QUESTION_PACKS, type QuestionPack } from './questionPacks';

/** Points for a correct answer; the fastest correct answer earns a bonus. */
export const CORRECT_POINTS = 10;
export const SPEED_BONUS = 5;

export const DEFAULT_QUIZ_SETUP: QuizSetup = {
  roundDurationSeconds: 30,
  topic: 'GENERAL',
  questionCount: 5,
};

const packFor = (topic: string): QuestionPack =>
  QUESTION_PACKS.find((p) => p.topic === topic) ?? QUESTION_PACKS[0]!;

const shuffled = <T>(items: readonly T[]): T[] => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap]!, copy[index]!];
  }
  return copy;
};

/**
 * Draws the whole match up front: questions the room has not seen yet first,
 * topped up with older ones rather than running a shorter match. A topic with
 * fewer questions than asked for caps the match — never repeats inside one.
 */
export const createQuizRound = (
  setup: QuizSetup,
  askedIds: readonly string[] = [],
  now = new Date(),
): QuizRound => {
  const pool = packFor(setup.topic).questions;
  const unasked = shuffled(pool.filter((question) => !askedIds.includes(question.id)));
  const asked = shuffled(pool.filter((question) => askedIds.includes(question.id)));
  const questions = [...unasked, ...asked].slice(0, Math.min(setup.questionCount, pool.length));

  return {
    game: 'QUIZ',
    questions,
    currentIndex: 0,
    answers: [],
    questionPoints: {},
    matchPoints: {},
    endsAt: new Date(now.getTime() + setup.roundDurationSeconds * 1000).toISOString(),
    isScored: false,
  };
};

/** The question on screen. `undefined` only if a round arrives malformed. */
export const currentQuestion = (round: QuizRound): QuizQuestion | undefined =>
  round.questions[round.currentIndex];

export const isLastQuestion = (round: QuizRound): boolean =>
  round.currentIndex >= round.questions.length - 1;

/**
 * QUIZ needs no Host: a right answer is a right answer. The first correct
 * answer takes a speed bonus, which is what makes it a race rather than a test.
 */
export const computeQuizScores = (round: QuizRound): Record<string, number> => {
  const correctIndex = currentQuestion(round)?.correctIndex;
  const correct = round.answers
    .filter((answer) => answer.choice === correctIndex)
    .sort((a, b) => a.elapsedMs - b.elapsedMs);

  const scores: Record<string, number> = {};
  for (const answer of round.answers) scores[answer.playerId] = 0;

  correct.forEach((answer, position) => {
    scores[answer.playerId] = CORRECT_POINTS + (position === 0 ? SPEED_BONUS : 0);
  });

  return scores;
};

export const hasAnswered = (round: QuizRound, playerId: string): boolean =>
  round.answers.some((answer: QuizAnswer) => answer.playerId === playerId);
