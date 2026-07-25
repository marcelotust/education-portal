/** Game "cartridges" the Host can load without dropping the room. */
export type GameId = 'STOP';

export interface GameCartridge {
  id: GameId;
  title: string;
  tagline: string;
  /** Seconds the typing phase lasts. */
  roundDurationSeconds: number;
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
  phase: StopPhase;
  letter: string;
  categories: readonly string[];
  answers: readonly StopAnswer[];
  endsAt: string | null;
  /** Guards against the Host scoring the same round twice. */
  isScored: boolean;
}
