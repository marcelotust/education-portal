import { describe, expect, it } from 'vitest';

import { makePlayer, makeRoom, makeRound } from '@/test/factories';
import { isHostOnlyEvent, roomReducer } from './roomMachine';
import { MAX_PLAYERS, type RoomState } from '@/types';

const withStatus = (status: RoomState['status']): RoomState => makeRoom({ status });

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
    expect(state.currentRound?.letter).toBe('B');

    state = roomReducer(state, { type: 'END_ROUND' });
    expect(state.status).toBe('CALCULATING_SCORES');

    state = roomReducer(state, { type: 'RETURN_TO_LOBBY' });
    expect(state.status).toBe('LOBBY_IDLE');
    expect(state.selectedGameId).toBeNull();
    expect(state.currentRound).toBeNull();
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

      expect(state.currentRound?.phase).toBe('TYPING_PHASE');
      expect(state.currentRound?.categories).toEqual(['ANIMAL', 'FOOD']);
      expect(state.currentRound?.answers).toEqual([]);
    });

    it('collects the answers a player submits', () => {
      const state = roomReducer(playing(), {
        type: 'ANSWERS_SUBMITTED',
        playerId: 'player-0',
        answers: [{ playerId: 'player-0', category: 'ANIMAL', value: 'BEAR', isValid: null }],
      });

      expect(state.currentRound?.answers).toHaveLength(1);
      expect(state.currentRound?.answers[0]?.value).toBe('BEAR');
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

      expect(state.currentRound?.answers).toHaveLength(1);
      expect(state.currentRound?.answers[0]?.value).toBe('BEE');
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

      expect(state.currentRound?.answers).toHaveLength(2);
    });

    it('ignores answers arriving when no round is running', () => {
      const idle = withStatus('LOBBY_IDLE');

      expect(
        roomReducer(idle, { type: 'ANSWERS_SUBMITTED', playerId: 'player-0', answers: [] }),
      ).toBe(idle);
    });

    it('moves the round to the validation phase when it ends', () => {
      const state = roomReducer(playing(), { type: 'END_ROUND' });

      expect(state.status).toBe('CALCULATING_SCORES');
      expect(state.currentRound?.phase).toBe('VALIDATION_PHASE');
    });

    it('is a shared event: a Client must be able to send its own answers', () => {
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

      const answers = state.currentRound?.answers ?? [];
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

      expect(state.currentRound?.answers[0]?.isValid).toBe(true);
    });

    it('adds the round points to the running scores and marks the round scored', () => {
      const state = roomReducer(judging(), { type: 'ROUND_SCORED' });

      expect(state.scores['player-0']).toBe(10);
      expect(state.scores['player-1']).toBe(10);
      expect(state.currentRound?.isScored).toBe(true);
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

    it('keeps judging and scoring Host-only', () => {
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

  it('ignores events that are not valid for the current state', () => {
    const idle = withStatus('LOBBY_IDLE');

    expect(roomReducer(idle, { type: 'AD_FINISHED', round: makeRound() })).toBe(idle);
    expect(roomReducer(idle, { type: 'END_ROUND' })).toBe(idle);
  });

  it('refuses to start a game while no cartridge is selected', () => {
    const configuring = withStatus('CONFIGURING_GAME');

    expect(roomReducer(configuring, { type: 'START_GAME' })).toBe(configuring);
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
      scores: {},
      ...over,
    });

    it('applies the flow the Host broadcast', () => {
      const next = roomReducer(makeRoom(), { type: 'ROOM_STATE_RECEIVED', state: remote() });

      expect(next.status).toBe('PLAYING');
      expect(next.selectedGameId).toBe('STOP');
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
        scores: room.scores,
      };

      expect(roomReducer(room, { type: 'ROOM_STATE_RECEIVED', state: echo })).toBe(room);
    });

    it('is not a Host-only event: Clients must be able to apply it', () => {
      expect(isHostOnlyEvent({ type: 'ROOM_STATE_RECEIVED', state: remote() })).toBe(false);
    });
  });
});
