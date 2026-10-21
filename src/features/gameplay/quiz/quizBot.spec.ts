import { describe, expect, it } from 'vitest';

import type { QuizQuestion } from '@/types';
import { BOT_ACCURACY, planBotAnswer } from './quizBot';

const question: QuizQuestion = {
  id: 'q1',
  prompt: 'Which planet is closest to the Sun?',
  options: ['Venus', 'Mercury', 'Mars', 'Earth'],
  correctIndex: 1,
};

describe('planBotAnswer', () => {
  it('is an easy bot: right about half the time, not always', () => {
    expect(BOT_ACCURACY).toBeGreaterThan(0.3);
    expect(BOT_ACCURACY).toBeLessThan(0.7);
  });

  it('picks the right option when the dice say it knows', () => {
    expect(planBotAnswer(question, 30_000, () => 0).choice).toBe(1);
  });

  it('picks a wrong option otherwise, always inside the options', () => {
    for (const roll of [0.51, 0.7, 0.99]) {
      const { choice } = planBotAnswer(question, 30_000, () => roll);

      expect(choice).not.toBe(1);
      expect(choice).toBeGreaterThanOrEqual(0);
      expect(choice).toBeLessThan(question.options.length);
    }
  });

  it('answers slowly: never before 40% of the time left, never after 85%', () => {
    expect(planBotAnswer(question, 30_000, () => 0).delayMs).toBe(12_000);
    expect(planBotAnswer(question, 30_000, () => 0.999).delayMs).toBeLessThanOrEqual(25_500);
  });

  it('answers at once when no time is left, rather than never', () => {
    expect(planBotAnswer(question, 0, () => 0.5).delayMs).toBe(0);
  });
});
