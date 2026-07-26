import {
  MAX_PLAYERS,
  type AvatarId,
  type Player,
  type QuizQuestion,
  type QuizRound,
  type StopRound,
} from '@/types';
import { DEFAULT_STOP_GAME_SETUP } from '@/features/gameplay/stopRound';
import type { RoomState } from '@/types';

const AVATARS: readonly AvatarId[] = ['RED', 'BLUE', 'GREEN', 'PINK', 'CYAN', 'YELLOW'];

const NICKNAMES = ['ANA', 'BRUNO', 'CAIO', 'DUDA', 'ELIS', 'FABIO'] as const;

export const makePlayer = (index: number, overrides: Partial<Player> = {}): Player => ({
  id: `player-${index}`,
  nickname: NICKNAMES[index % NICKNAMES.length] ?? `P${index}`,
  avatarId: AVATARS[index % AVATARS.length] ?? 'RED',
  role: 'CLIENT',
  isReady: true,
  joinedAt: new Date(2026, 0, 1, 10, index).toISOString(),
  ...overrides,
});

export const makeRound = (overrides: Partial<StopRound> = {}): StopRound => ({
  game: 'STOP',
  phase: 'TYPING_PHASE',
  letter: 'B',
  categories: ['ANIMAL', 'FOOD'],
  answers: [],
  stoppedBy: null,
  endsAt: '2026-07-24T12:01:00.000Z',
  isScored: false,
  ...overrides,
});

const QUIZ_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'Which planet is closest to the Sun?',
    options: ['Venus', 'Mercury', 'Mars', 'Earth'],
    correctIndex: 1,
  },
  {
    id: 'q2',
    prompt: 'What is the largest ocean?',
    options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
    correctIndex: 3,
  },
  {
    id: 'q3',
    prompt: 'How many continents are there?',
    options: ['5', '6', '7', '8'],
    correctIndex: 2,
  },
];

/** A three-question QUIZ match sitting on its first question. */
export const makeQuizRound = (overrides: Partial<QuizRound> = {}): QuizRound => ({
  game: 'QUIZ',
  questions: QUIZ_QUESTIONS,
  currentIndex: 0,
  answers: [],
  questionPoints: {},
  matchPoints: {},
  endsAt: '2026-07-24T12:00:30.000Z',
  isScored: false,
  ...overrides,
});

interface MakeRoomOptions {
  playerCount?: number;
  status?: RoomState['status'];
}

/** Mock room used by the specs while the Supabase layer does not exist yet. */
export const makeRoom = ({
  playerCount = 3,
  status = 'LOBBY_IDLE',
}: MakeRoomOptions = {}): RoomState => {
  const slots = Array.from({ length: MAX_PLAYERS }, (_, index) =>
    index < playerCount ? makePlayer(index) : null,
  );

  return {
    pin: 'ABCD',
    hostId: 'host-1',
    status,
    slots,
    selectedGameId: null,
    currentRound: null,
    gameSetup: DEFAULT_STOP_GAME_SETUP,
    scores: {},
    lastRoundPoints: {},
  };
};
