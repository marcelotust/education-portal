import { describe, expect, it } from 'vitest';

import type { QuizQuestion } from '@/types';
import { BOT_ACCURACY, botElapsedMs, botReplyDelayMs, botBeatMs, planBotAnswer } from './quizBot';

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

describe('botBeatMs', () => {
  it('is a short human-looking beat of 0.8 to 1.8 seconds', () => {
    expect(botBeatMs(() => 0)).toBe(800);
    expect(botBeatMs(() => 0.999)).toBeLessThanOrEqual(1_800);
  });
});

describe('botReplyDelayMs', () => {
  it('keeps the planned pace while someone is still thinking', () => {
    expect(botReplyDelayMs({ plannedLeftMs: 12_000, humansDone: false, beatMs: 1_000 })).toBe(
      12_000,
    );
  });

  it('shortens to the beat once every real player has answered', () => {
    expect(botReplyDelayMs({ plannedLeftMs: 12_000, humansDone: true, beatMs: 1_000 })).toBe(1_000);
  });

  it('never waits longer than the plan, even after the humans are done', () => {
    expect(botReplyDelayMs({ plannedLeftMs: 400, humansDone: true, beatMs: 1_000 })).toBe(400);
  });

  it('never goes negative when the plan is already overdue', () => {
    expect(botReplyDelayMs({ plannedLeftMs: -50, humansDone: false, beatMs: 1_000 })).toBe(0);
  });
});

describe('botElapsedMs', () => {
  it('reports the real time it took when that is later than every human', () => {
    expect(botElapsedMs(9_000, 4_000)).toBe(9_000);
  });

  it('never ties or beats the last human, so they keep the fastest-answer bonus', () => {
    expect(botElapsedMs(3_000, 4_000)).toBe(4_001);
    expect(botElapsedMs(4_000, 4_000)).toBe(4_001);
  });

  it('is just the real time when no human has answered', () => {
    expect(botElapsedMs(5_000, null)).toBe(5_000);
  });
});
