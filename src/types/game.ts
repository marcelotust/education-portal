/** Game "cartridges" the Host can load without dropping the room. */
export type GameId = 'STOP' | 'QUIZ';

export interface GameCartridge {
  id: GameId;
  title: string;
  tagline: string;
  /** Seconds the typing phase lasts. */
  roundDurationSeconds: number;
}

/** Round lengths the Host can pick, in seconds. */
export const ROUND_DURATIONS = [30, 60, 90, 120] as const;
export type RoundDuration = (typeof ROUND_DURATIONS)[number];

/** A match needs enough categories to be worth playing. */
export const MIN_CATEGORIES = 4;

/** What the Host configures before starting STOP; everyone watches it. */
export interface StopSetup {
  roundDurationSeconds: RoundDuration;
  categories: readonly string[];
}

/** Internal phases of the STOP cartridge. */
export type StopPhase = 'TYPING_PHASE' | 'VALIDATION_PHASE';

export interface StopAnswer {
  playerId: string;
  category: string;
  value: string;
  /** `null` while the Host has not judged it yet. */
  isValid: boolean | null;
}

export interface StopRound {
  /** Discriminates the round shape; a cartridge swap never drops the room. */
  game: 'STOP';
  phase: StopPhase;
  letter: string;
  categories: readonly string[];
  answers: readonly StopAnswer[];
  endsAt: string | null;
  /** Who filled everything first and called STOP; `null` if time ran out. */
  stoppedBy: string | null;
  /** Guards against the Host scoring the same round twice. */
  isScored: boolean;
}

/** One multiple-choice question of the QUIZ cartridge. */
export interface QuizQuestion {
  id: string;
  prompt: string;
  options: readonly string[];
  /** Index into `options`. Never sent anywhere the players could read it early. */
  correctIndex: number;
}

export interface QuizSetup {
  roundDurationSeconds: RoundDuration;
  /** Which pack of questions to draw from. */
  topic: string;
}

export interface QuizAnswer {
  playerId: string;
  /** Index the player picked. */
  choice: number;
  /** Milliseconds from the question appearing; ties break on speed. */
  elapsedMs: number;
}

export interface QuizRound {
  game: 'QUIZ';
  question: QuizQuestion;
  answers: readonly QuizAnswer[];
  endsAt: string | null;
  /** QUIZ scores itself, so this flips without a Host judging anything. */
  isScored: boolean;
}

/** Whatever cartridge is loaded, the room holds exactly one round shape. */
export type Round = StopRound | QuizRound;

/** Per-cartridge setup, so switching games swaps the whole panel. */
export type GameSetup = ({ game: 'STOP' } & StopSetup) | ({ game: 'QUIZ' } & QuizSetup);
