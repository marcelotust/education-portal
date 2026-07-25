import type { QuizAnswer, QuizQuestion, QuizRound, QuizSetup } from '@/types';

/** Points for a correct answer; the fastest correct answer earns a bonus. */
export const CORRECT_POINTS = 10;
export const SPEED_BONUS = 5;

interface QuestionPack {
  topic: string;
  questions: readonly QuizQuestion[];
}

/**
 * A built-in bank for the MVP. Authoring questions is a feature of its own;
 * until then a teacher picks a pack rather than writing one.
 */
export const QUESTION_PACKS: readonly QuestionPack[] = [
  {
    topic: 'GENERAL',
    questions: [
      {
        id: 'g1',
        prompt: 'Which planet is closest to the Sun?',
        options: ['Venus', 'Mercury', 'Mars', 'Earth'],
        correctIndex: 1,
      },
      {
        id: 'g2',
        prompt: 'How many continents are there?',
        options: ['5', '6', '7', '8'],
        correctIndex: 2,
      },
      {
        id: 'g3',
        prompt: 'What is the largest ocean?',
        options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
        correctIndex: 3,
      },
    ],
  },
  {
    topic: 'SCIENCE',
    questions: [
      {
        id: 's1',
        prompt: 'What gas do plants absorb from the air?',
        options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'],
        correctIndex: 1,
      },
      {
        id: 's2',
        prompt: 'How many bones does an adult human have?',
        options: ['206', '186', '226', '246'],
        correctIndex: 0,
      },
      {
        id: 's3',
        prompt: 'What is the chemical symbol for gold?',
        options: ['Go', 'Gd', 'Au', 'Ag'],
        correctIndex: 2,
      },
    ],
  },
];

export const QUIZ_TOPICS: readonly string[] = QUESTION_PACKS.map((pack) => pack.topic);

export const DEFAULT_QUIZ_SETUP: QuizSetup = { roundDurationSeconds: 30, topic: 'GENERAL' };

const packFor = (topic: string): QuestionPack =>
  QUESTION_PACKS.find((p) => p.topic === topic) ?? QUESTION_PACKS[0]!;

/** Draws one question. Asked ids are excluded so a session does not repeat. */
export const createQuizRound = (
  setup: QuizSetup,
  askedIds: readonly string[] = [],
  now = new Date(),
): QuizRound => {
  const pool = packFor(setup.topic).questions;
  const unasked = pool.filter((question) => !askedIds.includes(question.id));
  const candidates = unasked.length > 0 ? unasked : pool;
  const question = candidates[Math.floor(Math.random() * candidates.length)] ?? pool[0]!;

  return {
    game: 'QUIZ',
    question,
    answers: [],
    endsAt: new Date(now.getTime() + setup.roundDurationSeconds * 1000).toISOString(),
    isScored: false,
  };
};

/**
 * QUIZ needs no Host: a right answer is a right answer. The first correct
 * answer takes a speed bonus, which is what makes it a race rather than a test.
 */
export const computeQuizScores = (round: QuizRound): Record<string, number> => {
  const correct = round.answers
    .filter((answer) => answer.choice === round.question.correctIndex)
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
