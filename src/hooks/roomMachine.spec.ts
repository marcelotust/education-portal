import { describe, expect, it } from 'vitest';

import { TABOO_CORRECT_POINTS } from '@/features/gameplay/taboo/tabooRound';
import { DEFAULT_STOP_GAME_SETUP } from '@/features/gameplay/stopRound';
import { makePlayer, makeQuizRound, makeRoom, makeRound, makeTabooRound } from '@/test/factories';
import { isHostOnlyEvent, roomReducer } from './roomMachine';
import { MAX_PLAYERS, type RoomState } from '@/types';

const withStatus = (status: RoomState['status']): RoomState => makeRoom({ status });

/** The STOP specs only ever look at STOP rounds; this narrows for them. */
const stopRoundOf = (state: RoomState) =>
  state.currentRound?.game === 'STOP' ? state.currentRound : null;

describe('room FSM', () => {
  it('walks the happy path LOBBY_IDLE -> ... -> CALCULATING_SCORES -> LOBBY_IDLE', () => {
    let state = roomReducer(withStatus('LOBBY_IDLE'), { type: 'OPEN_GAME_CONFIG' });
    expect(state.status).toBe('CONFIGURING_GAME');

    state = roomReducer(state, { type: 'SELECT_GAME', gameId: 'STOP' });
    expect(state.selectedGameId).toBe('STOP');

    state = roomReducer(state, { type: 'START_GAME' });
    expect(state.status).toBe('PLAYING_AD');

    state = roomReducer(state, { type: 'AD_FINISHED', round: makeRound() });
    expect(state.status).toBe('PLAYING');
    expect(stopRoundOf(state)?.letter).toBe('B');

    state = roomReducer(state, { type: 'END_ROUND' });
    expect(state.status).toBe('CALCULATING_SCORES');

    state = roomReducer(state, { type: 'RETURN_TO_LOBBY' });
    expect(state.status).toBe('LOBBY_IDLE');
    expect(state.selectedGameId).toBeNull();
    expect(state.currentRound).toBeNull();
  });

  describe('MATCH_RESET', () => {
    const played = (): RoomState => ({
      ...withStatus('LOBBY_IDLE'),
      scores: { 'player-0': 30, 'player-1': 45 },
      lastRoundPoints: { 'player-0': 10 },
    });

    it('zeroes the scores and the last round without touching the room', () => {
      const state = roomReducer(played(), { type: 'MATCH_RESET' });

      expect(state.scores).toEqual({});
      expect(state.lastRoundPoints).toEqual({});
      expect(state.pin).toBe('ABCD');
      expect(state.slots).toEqual(played().slots);
    });

    it('refuses to wipe a match that is still being played', () => {
      const playing = { ...played(), status: 'PLAYING' as const };

      expect(roomReducer(playing, { type: 'MATCH_RESET' })).toBe(playing);
    });

    it('refuses to wipe while the Host is still judging', () => {
      const judging = { ...played(), status: 'CALCULATING_SCORES' as const };

      expect(roomReducer(judging, { type: 'MATCH_RESET' })).toBe(judging);
    });

    it('returns the same state when there is nothing to clear', () => {
      const fresh = withStatus('LOBBY_IDLE');

      expect(roomReducer(fresh, { type: 'MATCH_RESET' })).toBe(fresh);
    });

    it('is Host-only, like every other control event', () => {
      expect(isHostOnlyEvent({ type: 'MATCH_RESET' })).toBe(true);
    });
  });

  describe('STOP typing phase', () => {
    const playing = (): RoomState => {
      const state = roomReducer(
        { ...withStatus('CONFIGURING_GAME'), selectedGameId: 'STOP' },
        { type: 'START_GAME' },
      );
      return roomReducer(state, { type: 'AD_FINISHED', round: makeRound() });
    };

    it('opens the round in the typing phase with the drawn letter', () => {
      const state = playing();

      expect(stopRoundOf(state)?.phase).toBe('TYPING_PHASE');
      expect(stopRoundOf(state)?.categories).toEqual(['ANIMAL', 'FOOD']);
      expect(stopRoundOf(state)?.answers).toEqual([]);
    });

    it('collects the answers a player submits', () => {
      const state = roomReducer(playing(), {
        type: 'ANSWERS_SUBMITTED',
        playerId: 'player-0',
        answers: [{ playerId: 'player-0', category: 'ANIMAL', value: 'BEAR', isValid: null }],
      });

      expect(stopRoundOf(state)?.answers).toHaveLength(1);
      expect(stopRoundOf(state)?.answers[0]?.value).toBe('BEAR');
    });

    it('lets a player resubmit without duplicating their answers', () => {
      let state = roomReducer(playing(), {
        type: 'ANSWERS_SUBMITTED',
        playerId: 'player-0',
        answers: [{ playerId: 'player-0', category: 'ANIMAL', value: 'BEAR', isValid: null }],
      });
      state = roomReducer(state, {
        type: 'ANSWERS_SUBMITTED',
        playerId: 'player-0',
        answers: [{ playerId: 'player-0', category: 'ANIMAL', value: 'BEE', isValid: null }],
      });

      expect(stopRoundOf(state)?.answers).toHaveLength(1);
      expect(stopRoundOf(state)?.answers[0]?.value).toBe('BEE');
    });

    it('keeps answers from different players side by side', () => {
      let state = roomReducer(playing(), {
        type: 'ANSWERS_SUBMITTED',
        playerId: 'player-0',
        answers: [{ playerId: 'player-0', category: 'ANIMAL', value: 'BEAR', isValid: null }],
      });
      state = roomReducer(state, {
        type: 'ANSWERS_SUBMITTED',
        playerId: 'player-1',
        answers: [{ playerId: 'player-1', category: 'ANIMAL', value: 'BAT', isValid: null }],
      });

      expect(stopRoundOf(state)?.answers).toHaveLength(2);
    });

    it('ignores answers arriving when no round is running', () => {
      const idle = withStatus('LOBBY_IDLE');

      expect(
        roomReducer(idle, { type: 'ANSWERS_SUBMITTED', playerId: 'player-0', answers: [] }),
      ).toBe(idle);
    });

    /** A round that still has a minute to run, so STOP has something to cut. */
    const running = (): RoomState => ({
      ...playing(),
      currentRound: makeRound({ endsAt: new Date(Date.now() + 60_000).toISOString() }),
    });

    it('pulls the deadline in when a player calls STOP', () => {
      const soon = new Date(Date.now() + 2000).toISOString();

      const state = roomReducer(running(), {
        type: 'STOP_CALLED',
        playerId: 'player-1',
        endsAt: soon,
      });

      expect(state.currentRound?.endsAt).toBe(soon);
      expect(stopRoundOf(state)?.stoppedBy).toBe('player-1');
    });

    it('credits the first caller when a second STOP lands right after', () => {
      const first = roomReducer(running(), {
        type: 'STOP_CALLED',
        playerId: 'player-1',
        endsAt: new Date(Date.now() + 5000).toISOString(),
      });

      const second = roomReducer(first, {
        type: 'STOP_CALLED',
        playerId: 'player-2',
        endsAt: new Date(Date.now() + 4000).toISOString(),
      });

      expect(stopRoundOf(second)?.stoppedBy).toBe('player-1');
    });

    it('never lets a STOP push the deadline further away', () => {
      const started = running();
      const later = new Date(Date.now() + 999_000).toISOString();

      expect(
        roomReducer(started, { type: 'STOP_CALLED', playerId: 'player-1', endsAt: later }),
      ).toBe(started);
    });

    it('ignores a STOP once the round is no longer running', () => {
      const idle = withStatus('LOBBY_IDLE');

      expect(
        roomReducer(idle, {
          type: 'STOP_CALLED',
          playerId: 'player-1',
          endsAt: new Date().toISOString(),
        }),
      ).toBe(idle);
    });

    it('moves the round to the validation phase when it ends', () => {
      const state = roomReducer(playing(), { type: 'END_ROUND' });

      expect(state.status).toBe('CALCULATING_SCORES');
      expect(stopRoundOf(state)?.phase).toBe('VALIDATION_PHASE');
    });

    it('is a shared event: a Player must be able to send its own answers', () => {
      expect(
        isHostOnlyEvent({ type: 'ANSWERS_SUBMITTED', playerId: 'player-0', answers: [] }),
      ).toBe(false);
    });
  });

  describe('STOP validation phase', () => {
    const judging = (): RoomState => ({
      ...withStatus('CALCULATING_SCORES'),
      currentRound: makeRound({
        phase: 'VALIDATION_PHASE',
        categories: ['ANIMAL'],
        answers: [
          { playerId: 'player-0', category: 'ANIMAL', value: 'BEAR', isValid: null },
          { playerId: 'player-1', category: 'ANIMAL', value: 'BANANA', isValid: null },
        ],
      }),
    });

    it('records the Host rejecting one answer without touching the others', () => {
      const state = roomReducer(judging(), {
        type: 'ANSWER_JUDGED',
        playerId: 'player-1',
        category: 'ANIMAL',
        isValid: false,
      });

      const answers = stopRoundOf(state)?.answers ?? [];
      expect(answers.find((a) => a.playerId === 'player-1')?.isValid).toBe(false);
      expect(answers.find((a) => a.playerId === 'player-0')?.isValid).toBeNull();
    });

    it('lets the Host change its mind about an answer', () => {
      let state = roomReducer(judging(), {
        type: 'ANSWER_JUDGED',
        playerId: 'player-0',
        category: 'ANIMAL',
        isValid: false,
      });
      state = roomReducer(state, {
        type: 'ANSWER_JUDGED',
        playerId: 'player-0',
        category: 'ANIMAL',
        isValid: true,
      });

      expect(stopRoundOf(state)?.answers[0]?.isValid).toBe(true);
    });

    it('remembers what the round was worth, so the result outlives the scoreboard', () => {
      const state = roomReducer(
        { ...judging(), scores: { 'player-0': 40 } },
        {
          type: 'ROUND_SCORED',
        },
      );

      expect(state.lastRoundPoints['player-0']).toBe(10);
      expect(state.scores['player-0']).toBe(50);

      const lobby = roomReducer(state, { type: 'RETURN_TO_LOBBY' });
      expect(lobby.lastRoundPoints['player-0']).toBe(10);
    });

    it('adds the round points to the running scores and marks the round scored', () => {
      const state = roomReducer(judging(), { type: 'ROUND_SCORED' });

      expect(state.scores['player-0']).toBe(10);
      expect(state.scores['player-1']).toBe(10);
      expect(stopRoundOf(state)?.isScored).toBe(true);
    });

    it('accumulates points across rounds instead of replacing them', () => {
      const state = roomReducer(
        { ...judging(), scores: { 'player-0': 25 } },
        { type: 'ROUND_SCORED' },
      );

      expect(state.scores['player-0']).toBe(35);
    });

    it('refuses to score the same round twice', () => {
      const scored = roomReducer(judging(), { type: 'ROUND_SCORED' });

      expect(roomReducer(scored, { type: 'ROUND_SCORED' })).toBe(scored);
    });

    it('keeps the scores when the room goes back to the lobby', () => {
      const scored = roomReducer(judging(), { type: 'ROUND_SCORED' });

      const lobby = roomReducer(scored, { type: 'RETURN_TO_LOBBY' });

      expect(lobby.scores['player-0']).toBe(10);
      expect(lobby.currentRound).toBeNull();
    });

    it('approves everything still pending, leaving rejections alone', () => {
      const judged = roomReducer(judging(), {
        type: 'ANSWER_JUDGED',
        playerId: 'player-1',
        category: 'ANIMAL',
        isValid: false,
      });

      const state = roomReducer(judged, { type: 'REMAINING_ANSWERS_APPROVED' });
      const answers = stopRoundOf(state)?.answers ?? [];

      expect(answers.find((a) => a.playerId === 'player-0')?.isValid).toBe(true);
      expect(answers.find((a) => a.playerId === 'player-1')?.isValid).toBe(false);
    });

    it('keeps judging and scoring Host-only', () => {
      expect(isHostOnlyEvent({ type: 'REMAINING_ANSWERS_APPROVED' })).toBe(true);
      expect(
        isHostOnlyEvent({
          type: 'ANSWER_JUDGED',
          playerId: 'player-0',
          category: 'ANIMAL',
          isValid: true,
        }),
      ).toBe(true);
      expect(isHostOnlyEvent({ type: 'ROUND_SCORED' })).toBe(true);
    });
  });

  describe('QUIZ cartridge', () => {
    const configuringQuiz = (): RoomState =>
      roomReducer(withStatus('CONFIGURING_GAME'), { type: 'SELECT_GAME', gameId: 'QUIZ' });

    const playingQuiz = (): RoomState => {
      const started = roomReducer(configuringQuiz(), { type: 'START_GAME' });
      return roomReducer(started, { type: 'AD_FINISHED', round: makeQuizRound() });
    };

    it('swaps the setup panel when the cartridge changes', () => {
      expect(configuringQuiz().gameSetup.game).toBe('QUIZ');

      const backToStop = roomReducer(configuringQuiz(), { type: 'SELECT_GAME', gameId: 'STOP' });
      expect(backToStop.gameSetup.game).toBe('STOP');
    });

    it('starts without needing categories, which QUIZ does not have', () => {
      expect(roomReducer(configuringQuiz(), { type: 'START_GAME' }).status).toBe('PLAYING_AD');
    });

    it('records an answer once, and refuses a change of mind', () => {
      const answered = roomReducer(playingQuiz(), {
        type: 'QUIZ_ANSWERED',
        answer: { playerId: 'player-0', choice: 1, elapsedMs: 900 },
      });
      const again = roomReducer(answered, {
        type: 'QUIZ_ANSWERED',
        answer: { playerId: 'player-0', choice: 0, elapsedMs: 1500 },
      });

      const round = again.currentRound;
      expect(round?.game === 'QUIZ' && round.answers).toHaveLength(1);
      expect(round?.game === 'QUIZ' && round.answers[0]?.choice).toBe(1);
    });

    it('scores the question itself and stops on the reveal, with no Host judging', () => {
      const answered = roomReducer(playingQuiz(), {
        type: 'QUIZ_ANSWERED',
        answer: { playerId: 'player-0', choice: 1, elapsedMs: 900 },
      });

      const ended = roomReducer(answered, { type: 'END_ROUND' });
      const round = ended.currentRound;

      expect(ended.status).toBe('SHOWING_ANSWER');
      // Correct and fastest: ten points plus the speed bonus.
      expect(ended.scores['player-0']).toBe(15);
      expect(round?.game === 'QUIZ' && round.questionPoints['player-0']).toBe(15);
      // The match is not over, so there is nothing to report as a result yet.
      expect(ended.currentRound?.isScored).toBe(false);
      expect(ended.lastRoundPoints).toEqual({});
    });

    it('gives a wrong answer nothing', () => {
      const answered = roomReducer(playingQuiz(), {
        type: 'QUIZ_ANSWERED',
        answer: { playerId: 'player-0', choice: 0, elapsedMs: 400 },
      });

      expect(roomReducer(answered, { type: 'END_ROUND' }).scores['player-0']).toBe(0);
    });

    it('is a shared event: a Player must be able to send its own pick', () => {
      expect(
        isHostOnlyEvent({
          type: 'QUIZ_ANSWERED',
          answer: { playerId: 'player-0', choice: 0, elapsedMs: 0 },
        }),
      ).toBe(false);
    });

    describe('ending the round once everyone has answered', () => {
      /** A round with a full minute left, so QUIZ_ALL_ANSWERED has something to cut. */
      const running = (): RoomState => {
        const state = playingQuiz();
        const round = state.currentRound;
        return round?.game === 'QUIZ'
          ? {
              ...state,
              currentRound: { ...round, endsAt: new Date(Date.now() + 60_000).toISOString() },
            }
          : state;
      };

      it('pulls the deadline in once every seated player has answered', () => {
        const soon = new Date(Date.now() + 5000).toISOString();

        const state = roomReducer(running(), { type: 'QUIZ_ALL_ANSWERED', endsAt: soon });

        expect(state.currentRound?.endsAt).toBe(soon);
      });

      it('never lets it push the deadline further away', () => {
        const started = running();
        const later = new Date(Date.now() + 999_000).toISOString();

        expect(roomReducer(started, { type: 'QUIZ_ALL_ANSWERED', endsAt: later })).toBe(started);
      });

      it('ignores it once the round is no longer running', () => {
        const idle = withStatus('LOBBY_IDLE');

        expect(
          roomReducer(idle, { type: 'QUIZ_ALL_ANSWERED', endsAt: new Date().toISOString() }),
        ).toBe(idle);
      });

      it('is Host-only: the trigger is derived locally, but only the Host may act on it', () => {
        expect(
          isHostOnlyEvent({ type: 'QUIZ_ALL_ANSWERED', endsAt: new Date().toISOString() }),
        ).toBe(true);
      });
    });

    describe('a match is a sequence of questions', () => {
      const NEXT_DEADLINE = '2026-07-25T10:00:30.000Z';

      /** Answers whatever question is on correctly, then closes it. */
      const revealing = (state: RoomState): RoomState => {
        const round = state.currentRound;
        const correct =
          round?.game === 'QUIZ' ? (round.questions[round.currentIndex]?.correctIndex ?? 0) : 0;

        const answered = roomReducer(state, {
          type: 'QUIZ_ANSWERED',
          answer: { playerId: 'player-0', choice: correct, elapsedMs: 900 },
        });
        return roomReducer(answered, { type: 'END_ROUND' });
      };

      it('moves to the next question on a fresh clock, with the answers cleared', () => {
        const next = roomReducer(revealing(playingQuiz()), {
          type: 'NEXT_QUESTION',
          endsAt: NEXT_DEADLINE,
        });
        const round = next.currentRound;

        expect(next.status).toBe('PLAYING');
        expect(round?.game === 'QUIZ' && round.currentIndex).toBe(1);
        expect(round?.game === 'QUIZ' && round.answers).toEqual([]);
        expect(round?.game === 'QUIZ' && round.questionPoints).toEqual({});
        expect(round?.endsAt).toBe(NEXT_DEADLINE);
      });

      it('keeps the running total across questions', () => {
        // Two correct answers, one per question: fifteen points each time.
        const second = roomReducer(revealing(playingQuiz()), {
          type: 'NEXT_QUESTION',
          endsAt: NEXT_DEADLINE,
        });

        expect(revealing(second).scores['player-0']).toBe(30);
      });

      it('ends the match after the last question and reports what it was worth', () => {
        let state = playingQuiz();
        // Three questions in the factory match; the third reveal is the last.
        for (let question = 0; question < 3; question += 1) {
          state = revealing(state);
          state = roomReducer(state, { type: 'NEXT_QUESTION', endsAt: NEXT_DEADLINE });
        }

        expect(state.status).toBe('CALCULATING_SCORES');
        expect(state.currentRound?.isScored).toBe(true);
        expect(state.scores['player-0']).toBe(45);
        // The scoreboard reports the match, not just the question that closed it.
        expect(state.lastRoundPoints['player-0']).toBe(45);
      });

      it('refuses to skip a question that is still being answered', () => {
        const playing = playingQuiz();

        expect(roomReducer(playing, { type: 'NEXT_QUESTION', endsAt: NEXT_DEADLINE })).toBe(
          playing,
        );
      });

      it('ignores an answer arriving during the reveal', () => {
        const reveal = revealing(playingQuiz());

        expect(
          roomReducer(reveal, {
            type: 'QUIZ_ANSWERED',
            answer: { playerId: 'player-1', choice: 1, elapsedMs: 100 },
          }),
        ).toBe(reveal);
      });

      it('records how many questions the Host wants', () => {
        const state = roomReducer(configuringQuiz(), {
          type: 'QUIZ_QUESTION_COUNT_SELECTED',
          count: 10,
        });

        expect(state.gameSetup.game === 'QUIZ' && state.gameSetup.questionCount).toBe(10);
      });

      it('leaves the count alone once the match is running', () => {
        const playing = playingQuiz();

        expect(roomReducer(playing, { type: 'QUIZ_QUESTION_COUNT_SELECTED', count: 10 })).toBe(
          playing,
        );
      });
    });

    it('ignores the STOP-only events, which have nothing to act on', () => {
      const playing = playingQuiz();

      expect(roomReducer(playing, { type: 'STOP_CALLED', playerId: 'player-0', endsAt: 'x' })).toBe(
        playing,
      );
      expect(
        roomReducer(playing, { type: 'ANSWERS_SUBMITTED', playerId: 'player-0', answers: [] }),
      ).toBe(playing);
    });
  });

  describe('TABOO cartridge', () => {
    const configuringTaboo = (): RoomState =>
      roomReducer(withStatus('CONFIGURING_GAME'), { type: 'SELECT_GAME', gameId: 'TABOO' });

    /** 3 seated players; the factory match hands each of them exactly one turn as clue-giver. */
    const playingTaboo = (): RoomState => {
      const started = roomReducer(configuringTaboo(), { type: 'START_GAME' });
      return roomReducer(started, { type: 'AD_FINISHED', round: makeTabooRound() });
    };

    it('swaps the setup panel when the cartridge changes', () => {
      expect(configuringTaboo().gameSetup.game).toBe('TABOO');
    });

    it('needs at least one category to start', () => {
      const noCategories: RoomState = {
        ...configuringTaboo(),
        gameSetup: { game: 'TABOO', roundDurationSeconds: 120, categories: [] },
      };

      expect(roomReducer(noCategories, { type: 'START_GAME' }).status).toBe('CONFIGURING_GAME');
      expect(roomReducer(configuringTaboo(), { type: 'START_GAME' }).status).toBe('PLAYING_AD');
    });

    it('records a guess once, and refuses a change of mind', () => {
      // Turn 0's clue-giver is player-0; player-1 is free to guess.
      const guessed = roomReducer(playingTaboo(), {
        type: 'TABOO_GUESSED',
        guess: { playerId: 'player-1', value: 'wrong', isValid: null },
      });
      const again = roomReducer(guessed, {
        type: 'TABOO_GUESSED',
        guess: { playerId: 'player-1', value: 'elephant', isValid: null },
      });

      const round = again.currentRound;
      expect(round?.game === 'TABOO' && round.guesses).toHaveLength(1);
      expect(round?.game === 'TABOO' && round.guesses[0]?.value).toBe('wrong');
    });

    it("refuses a guess from the current turn's own clue-giver", () => {
      const playing = playingTaboo();

      const guessed = roomReducer(playing, {
        type: 'TABOO_GUESSED',
        guess: { playerId: 'player-0', value: 'elephant', isValid: null },
      });

      expect(guessed).toBe(playing);
    });

    it('hands the turn to the Host to judge instead of scoring it on the spot', () => {
      const guessed = roomReducer(playingTaboo(), {
        type: 'TABOO_GUESSED',
        guess: { playerId: 'player-1', value: 'elephant', isValid: null },
      });

      const ended = roomReducer(guessed, { type: 'END_ROUND' });
      const round = ended.currentRound;

      expect(ended.status).toBe('CALCULATING_SCORES');
      expect(round?.isScored).toBe(false);
      // Nothing is added to anyone's score until the Host confirms it.
      expect(ended.scores['player-1']).toBeUndefined();
    });

    it('pre-fills an exact match as valid, a suggestion the Host still has to confirm', () => {
      const guessed = roomReducer(playingTaboo(), {
        type: 'TABOO_GUESSED',
        guess: { playerId: 'player-1', value: 'elephant', isValid: null },
      });

      const ended = roomReducer(guessed, { type: 'END_ROUND' });
      const round = ended.currentRound;

      expect(round?.game === 'TABOO' && round.guesses[0]?.isValid).toBe(true);
    });

    it('leaves a wrong guess pending rather than scoring it zero automatically', () => {
      const guessed = roomReducer(playingTaboo(), {
        type: 'TABOO_GUESSED',
        guess: { playerId: 'player-1', value: 'giraffe', isValid: null },
      });

      const ended = roomReducer(guessed, { type: 'END_ROUND' });
      const round = ended.currentRound;

      expect(round?.game === 'TABOO' && round.guesses[0]?.isValid).toBeNull();
    });

    it('is a shared event: a Player must be able to send its own guess', () => {
      expect(
        isHostOnlyEvent({
          type: 'TABOO_GUESSED',
          guess: { playerId: 'player-0', value: 'x', isValid: null },
        }),
      ).toBe(false);
    });

    describe('TABOO validation phase', () => {
      const judging = (): RoomState => {
        const guessed = roomReducer(playingTaboo(), {
          type: 'TABOO_GUESSED',
          guess: { playerId: 'player-1', value: 'giraffe', isValid: null },
        });
        return roomReducer(guessed, { type: 'END_ROUND' });
      };

      const tabooRoundOf = (state: RoomState) =>
        state.currentRound?.game === 'TABOO' ? state.currentRound : null;

      it('records the Host approving a near-miss the auto-match rejected', () => {
        const state = roomReducer(judging(), {
          type: 'GUESS_JUDGED',
          playerId: 'player-1',
          isValid: true,
        });

        expect(tabooRoundOf(state)?.guesses[0]?.isValid).toBe(true);
      });

      it('lets the Host change its mind about a guess', () => {
        let state = roomReducer(judging(), {
          type: 'GUESS_JUDGED',
          playerId: 'player-1',
          isValid: true,
        });
        state = roomReducer(state, {
          type: 'GUESS_JUDGED',
          playerId: 'player-1',
          isValid: false,
        });

        expect(tabooRoundOf(state)?.guesses[0]?.isValid).toBe(false);
      });

      it('moves the turn on to the reveal once the Host confirms, adding the earned points', () => {
        const approved = roomReducer(judging(), {
          type: 'GUESS_JUDGED',
          playerId: 'player-1',
          isValid: true,
        });
        const scored = roomReducer(approved, { type: 'TURN_SCORED' });

        expect(scored.status).toBe('SHOWING_ANSWER');
        expect(scored.scores['player-1']).toBe(TABOO_CORRECT_POINTS);
        expect(tabooRoundOf(scored)?.turnPoints['player-1']).toBe(TABOO_CORRECT_POINTS);
        expect(tabooRoundOf(scored)?.isScored).toBe(true);
      });

      it('scores a rejected guess as nothing', () => {
        const scored = roomReducer(judging(), { type: 'TURN_SCORED' });

        expect(scored.scores['player-1']).toBe(0);
      });

      it('refuses to score the same turn twice', () => {
        const scored = roomReducer(judging(), { type: 'TURN_SCORED' });

        expect(roomReducer(scored, { type: 'TURN_SCORED' })).toBe(scored);
      });

      it('approves everything still pending, leaving what the Host already rejected alone', () => {
        const rejected = roomReducer(judging(), {
          type: 'GUESS_JUDGED',
          playerId: 'player-1',
          isValid: false,
        });

        const state = roomReducer(rejected, { type: 'REMAINING_GUESSES_APPROVED' });

        expect(tabooRoundOf(state)?.guesses[0]?.isValid).toBe(false);
      });

      it('keeps judging and scoring Host-only', () => {
        expect(isHostOnlyEvent({ type: 'GUESS_JUDGED', playerId: 'player-1', isValid: true })).toBe(
          true,
        );
        expect(isHostOnlyEvent({ type: 'REMAINING_GUESSES_APPROVED' })).toBe(true);
        expect(isHostOnlyEvent({ type: 'TURN_SCORED' })).toBe(true);
      });
    });

    describe('a match is a sequence of turns', () => {
      const NEXT_DEADLINE = '2026-07-25T10:02:00.000Z';

      /**
       * Whoever is seated and is not the clue-giver guesses the word right,
       * then closes it and has the Host confirm the (already exact-matched)
       * score, landing on the reveal exactly as before.
       */
      const revealing = (state: RoomState): RoomState => {
        const round = state.currentRound;
        if (round?.game !== 'TABOO') return state;
        const turn = round.turns[round.currentIndex];
        const guesser = ['player-0', 'player-1', 'player-2'].find((id) => id !== turn?.clueGiverId);

        const guessed = roomReducer(state, {
          type: 'TABOO_GUESSED',
          guess: { playerId: guesser ?? 'player-0', value: turn?.card.word ?? '', isValid: null },
        });
        const judging = roomReducer(guessed, { type: 'END_ROUND' });
        return roomReducer(judging, { type: 'TURN_SCORED' });
      };

      it('moves to the next turn on a fresh clock, with the guesses cleared', () => {
        const next = roomReducer(revealing(playingTaboo()), {
          type: 'NEXT_TABOO_TURN',
          endsAt: NEXT_DEADLINE,
        });
        const round = next.currentRound;

        expect(next.status).toBe('PLAYING');
        expect(round?.game === 'TABOO' && round.currentIndex).toBe(1);
        expect(round?.game === 'TABOO' && round.guesses).toEqual([]);
        expect(round?.endsAt).toBe(NEXT_DEADLINE);
      });

      it('ends the match after the last turn and reports what it was worth', () => {
        let state = playingTaboo();
        // Three turns in the factory match; the third reveal is the last.
        for (let turn = 0; turn < 3; turn += 1) {
          state = revealing(state);
          state = roomReducer(state, { type: 'NEXT_TABOO_TURN', endsAt: NEXT_DEADLINE });
        }

        expect(state.status).toBe('CALCULATING_SCORES');
        expect(state.currentRound?.isScored).toBe(true);
        const total = Object.values(state.lastRoundPoints).reduce((sum, points) => sum + points, 0);
        expect(total).toBe(TABOO_CORRECT_POINTS * 3);
      });

      it('refuses to skip a turn that is still being guessed', () => {
        const playing = playingTaboo();

        expect(roomReducer(playing, { type: 'NEXT_TABOO_TURN', endsAt: NEXT_DEADLINE })).toBe(
          playing,
        );
      });
    });

    describe('ending the turn once everyone has guessed', () => {
      /** A turn with a full minute left, so TABOO_ALL_GUESSED has something to cut. */
      const running = (): RoomState => {
        const state = playingTaboo();
        const round = state.currentRound;
        return round?.game === 'TABOO'
          ? {
              ...state,
              currentRound: { ...round, endsAt: new Date(Date.now() + 60_000).toISOString() },
            }
          : state;
      };

      it('pulls the deadline in', () => {
        const soon = new Date(Date.now() + 5000).toISOString();

        const state = roomReducer(running(), { type: 'TABOO_ALL_GUESSED', endsAt: soon });

        expect(state.currentRound?.endsAt).toBe(soon);
      });

      it('never lets it push the deadline further away', () => {
        const started = running();
        const later = new Date(Date.now() + 999_000).toISOString();

        expect(roomReducer(started, { type: 'TABOO_ALL_GUESSED', endsAt: later })).toBe(started);
      });

      it('is Host-only: the trigger is derived locally, but only the Host may act on it', () => {
        expect(
          isHostOnlyEvent({ type: 'TABOO_ALL_GUESSED', endsAt: new Date().toISOString() }),
        ).toBe(true);
      });
    });
  });

  it('ignores events that are not valid for the current state', () => {
    const idle = withStatus('LOBBY_IDLE');

    expect(roomReducer(idle, { type: 'AD_FINISHED', round: makeRound() })).toBe(idle);
    expect(roomReducer(idle, { type: 'END_ROUND' })).toBe(idle);
  });

  it('refuses to start a game while no cartridge is selected', () => {
    const configuring = withStatus('CONFIGURING_GAME');

    expect(roomReducer(configuring, { type: 'START_GAME' })).toBe(configuring);
  });

  describe('game setup', () => {
    const configuring = (over: Partial<RoomState> = {}): RoomState => ({
      ...withStatus('CONFIGURING_GAME'),
      selectedGameId: 'STOP',
      ...over,
    });

    it('records the round length the Host picked', () => {
      const state = roomReducer(configuring(), { type: 'ROUND_DURATION_SELECTED', seconds: 90 });

      expect(state.gameSetup.roundDurationSeconds).toBe(90);
    });

    it('adds a category the Host tapped and removes it when tapped again', () => {
      const start = configuring({
        gameSetup: {
          game: 'STOP' as const,
          roundDurationSeconds: 60,
          categories: ['NAME', 'ANIMAL'],
        },
      });

      const added = roomReducer(start, { type: 'CATEGORY_TOGGLED', category: 'CITY' });
      expect(added.gameSetup.game === 'STOP' && added.gameSetup.categories).toEqual([
        'NAME',
        'ANIMAL',
        'CITY',
      ]);

      const removed = roomReducer(added, { type: 'CATEGORY_TOGGLED', category: 'ANIMAL' });
      expect(removed.gameSetup.game === 'STOP' && removed.gameSetup.categories).toEqual([
        'NAME',
        'CITY',
      ]);
    });

    it('refuses to start with fewer than four categories, whatever the UI shows', () => {
      const tooFew = configuring({
        gameSetup: {
          game: 'STOP' as const,
          roundDurationSeconds: 60,
          categories: ['NAME', 'ANIMAL', 'FOOD'],
        },
      });

      expect(roomReducer(tooFew, { type: 'START_GAME' })).toBe(tooFew);
    });

    it('starts once the fourth category is picked', () => {
      const enough = configuring({
        gameSetup: {
          game: 'STOP' as const,
          roundDurationSeconds: 60,
          categories: ['NAME', 'ANIMAL', 'FOOD', 'CITY'],
        },
      });

      expect(roomReducer(enough, { type: 'START_GAME' }).status).toBe('PLAYING_AD');
    });

    it('only accepts setup changes while the room is configuring', () => {
      const idle = withStatus('LOBBY_IDLE');

      expect(roomReducer(idle, { type: 'ROUND_DURATION_SELECTED', seconds: 30 })).toBe(idle);
      expect(roomReducer(idle, { type: 'CATEGORY_TOGGLED', category: 'CITY' })).toBe(idle);
    });

    it('keeps the setup Host-only', () => {
      expect(isHostOnlyEvent({ type: 'ROUND_DURATION_SELECTED', seconds: 30 })).toBe(true);
      expect(isHostOnlyEvent({ type: 'CATEGORY_TOGGLED', category: 'CITY' })).toBe(true);
    });
  });

  it('seats a joining player in the first open slot', () => {
    const room = makeRoom({ playerCount: 1 });

    const next = roomReducer(room, { type: 'PLAYER_JOINED', player: makePlayer(5) });

    expect(next.slots[1]?.id).toBe('player-5');
  });

  it('rejects a 7th player because the room holds 6 seats', () => {
    const full = makeRoom({ playerCount: 6 });

    expect(roomReducer(full, { type: 'PLAYER_JOINED', player: makePlayer(9) })).toBe(full);
  });

  it('frees the slot of a player that left', () => {
    const room = makeRoom({ playerCount: 3 });

    const next = roomReducer(room, { type: 'PLAYER_LEFT', playerId: 'player-1' });

    expect(next.slots[1]).toBeNull();
    expect(next.slots[0]?.id).toBe('player-0');
  });

  it('classifies flow-control events as Host-only and presence events as shared', () => {
    expect(isHostOnlyEvent({ type: 'START_GAME' })).toBe(true);
    expect(isHostOnlyEvent({ type: 'OPEN_GAME_CONFIG' })).toBe(true);
    expect(isHostOnlyEvent({ type: 'PLAYER_LEFT', playerId: 'player-1' })).toBe(false);
    expect(isHostOnlyEvent({ type: 'PLAYERS_SYNCED', slots: [] })).toBe(false);
  });

  it('replaces the whole board when Realtime Presence syncs, keeping 6 seats', () => {
    const room = makeRoom({ playerCount: 3 });

    const next = roomReducer(room, { type: 'PLAYERS_SYNCED', slots: [makePlayer(7)] });

    expect(next.slots).toHaveLength(MAX_PLAYERS);
    expect(next.slots[0]?.id).toBe('player-7');
    expect(next.slots[1]).toBeNull();
  });

  it('keeps the same state object when a presence sync changes nothing', () => {
    const room = makeRoom({ playerCount: 2 });

    expect(roomReducer(room, { type: 'PLAYERS_SYNCED', slots: room.slots })).toBe(room);
  });

  describe('remote state received from the Host', () => {
    const remote = (over: Partial<RoomState> = {}) => ({
      status: 'PLAYING' as const,
      slots: [],
      selectedGameId: 'STOP' as const,
      currentRound: null,
      gameSetup: DEFAULT_STOP_GAME_SETUP,
      scores: {},
      lastRoundPoints: {},
      ...over,
    });

    it('applies the flow the Host broadcast', () => {
      const next = roomReducer(makeRoom(), { type: 'ROOM_STATE_RECEIVED', state: remote() });

      expect(next.status).toBe('PLAYING');
      expect(next.selectedGameId).toBe('STOP');
    });

    it('carries the match setup so Players watch it being configured', () => {
      const next = roomReducer(makeRoom(), {
        type: 'ROOM_STATE_RECEIVED',
        state: remote({
          gameSetup: {
            game: 'STOP' as const,
            roundDurationSeconds: 120,
            categories: ['NAME', 'CITY', 'MOVIE', 'FOOD'],
          },
        }),
      });

      expect(next.gameSetup.roundDurationSeconds).toBe(120);
      expect(next.gameSetup.game === 'STOP' && next.gameSetup.categories).toContain('MOVIE');
    });

    it('never lets the remote row overwrite the presence-driven board', () => {
      const room = makeRoom({ playerCount: 3 });

      const next = roomReducer(room, { type: 'ROOM_STATE_RECEIVED', state: remote() });

      expect(next.slots).toBe(room.slots);
    });

    it('keeps the same state object when the remote row matches the local flow', () => {
      const room = makeRoom({ playerCount: 3 });
      const echo = {
        status: room.status,
        slots: room.slots,
        selectedGameId: room.selectedGameId,
        currentRound: room.currentRound,
        gameSetup: room.gameSetup,
        scores: room.scores,
        lastRoundPoints: room.lastRoundPoints,
      };

      expect(roomReducer(room, { type: 'ROOM_STATE_RECEIVED', state: echo })).toBe(room);
    });

    it('is not a Host-only event: Players must be able to apply it', () => {
      expect(isHostOnlyEvent({ type: 'ROOM_STATE_RECEIVED', state: remote() })).toBe(false);
    });
  });
});
