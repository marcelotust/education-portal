/** Game "cartridges" the Host can load without dropping the room. */
export type GameId = 'STOP' | 'QUIZ' | 'TABOO';

export interface GameCartridge {
  id: GameId;
  title: string;
  tagline: string;
  /** CSS `background-position` into `public/games.png`'s 2x2 spritesheet. */
  spritePosition: string;
  /** Seconds the typing phase lasts. */
  roundDurationSeconds: number;
}

/** Round lengths STOP and QUIZ offer, in seconds. */
export const ROUND_DURATIONS = [30, 60, 90, 120] as const;
/** Every duration any cartridge's setup can store, so the field type is shared. */
export type RoundDuration = 30 | 60 | 90 | 120 | 180;

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

/** How many questions a QUIZ match runs. */
export const QUIZ_QUESTION_COUNTS = [3, 5, 10] as const;
export type QuizQuestionCount = (typeof QUIZ_QUESTION_COUNTS)[number];

export interface QuizSetup {
  roundDurationSeconds: RoundDuration;
  /** Which pack of questions to draw from. */
  topic: string;
  /** Questions in the match; capped by what the topic actually holds. */
  questionCount: QuizQuestionCount;
}

export interface QuizAnswer {
  playerId: string;
  /** Index the player picked. */
  choice: number;
  /** Milliseconds from the question appearing; ties break on speed. */
  elapsedMs: number;
}

/**
 * A QUIZ round is a whole match: the questions are drawn up front so every
 * screen agrees on what comes next, and the Host walks the index forward.
 */
export interface QuizRound {
  game: 'QUIZ';
  questions: readonly QuizQuestion[];
  /** Index into `questions`; the match ends after the last one is revealed. */
  currentIndex: number;
  /** Answers to the current question only, cleared as the match moves on. */
  answers: readonly QuizAnswer[];
  /** What the question just closed was worth, shown during the reveal. */
  questionPoints: Readonly<Record<string, number>>;
  /** What the match is worth so far, which is what the scoreboard reports. */
  matchPoints: Readonly<Record<string, number>>;
  endsAt: string | null;
  /** QUIZ scores itself, so this flips without a Host judging anything. */
  isScored: boolean;
}

/** TABOO wants longer turns than STOP or QUIZ; kept as its own offered set. */
export const TABOO_ROUND_DURATIONS = [60, 120, 180] as const;

export interface TabooSetup {
  roundDurationSeconds: RoundDuration;
  categories: readonly string[];
}

/** A word to make the room guess, and the words that can't be said to clue it. */
export interface TabooCard {
  id: string;
  word: string;
  forbidden: readonly string[];
  category: string;
}

export interface TabooTurn {
  card: TabooCard;
  clueGiverId: string;
}

export interface TabooGuess {
  playerId: string;
  value: string;
}

/**
 * A TABOO round is a whole match: one turn per seated player, drawn up front
 * like QUIZ's questions, cycling the clue-giver instead of a question index.
 */
export interface TabooRound {
  game: 'TABOO';
  turns: readonly TabooTurn[];
  /** Index into `turns`; the match ends after the last clue-giver's reveal. */
  currentIndex: number;
  /** Guesses for the current turn only, cleared as the match moves on. */
  guesses: readonly TabooGuess[];
  /** What the turn just closed was worth, shown during the reveal. */
  turnPoints: Readonly<Record<string, number>>;
  /** What the match is worth so far, which is what the scoreboard reports. */
  matchPoints: Readonly<Record<string, number>>;
  endsAt: string | null;
  /** TABOO scores itself, so this flips without a Host judging anything. */
  isScored: boolean;
}

/** Whatever cartridge is loaded, the room holds exactly one round shape. */
export type Round = StopRound | QuizRound | TabooRound;

/** Per-cartridge setup, so switching games swaps the whole panel. */
export type GameSetup =
  | ({ game: 'STOP' } & StopSetup)
  | ({ game: 'QUIZ' } & QuizSetup)
  | ({ game: 'TABOO' } & TabooSetup);
