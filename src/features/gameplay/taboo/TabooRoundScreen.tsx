import { useCallback, useEffect, useRef, useState } from 'react';

import { RetroButton } from '@/components/ui/RetroButton';
import { RetroContainer } from '@/components/ui/RetroContainer';
import { RetroInput } from '@/components/ui/RetroInput';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useCountdown } from '@/hooks/useCountdown';
import { useRoom } from '@/hooks/useRoom';
import { useTabooGuessBroadcast } from '@/hooks/useTabooGuessBroadcast';
import type { TabooGuess } from '@/types';
import { cn } from '@/utils/cn';
import { countPlayers } from '@/utils/room';
import { currentTurn, hasEveryoneGuessed, hasGuessed } from './tabooRound';

/** Long enough to read, short enough to feel earned; matches QUIZ's grace period. */
const TABOO_GRACE_MS = 5000;

const urgencyFor = (secondsLeft: number): 'calm' | 'warning' | 'critical' => {
  if (secondsLeft <= 5) return 'critical';
  if (secondsLeft <= 10) return 'warning';
  return 'calm';
};

const URGENCY_STYLES = {
  calm: 'text-sky-600',
  warning: 'text-yellow-500 scale-110',
  critical: 'animate-blink text-rose-500 scale-125',
} as const;

interface TabooRoundScreenProps {
  playerId: string;
}

/** TABOO needs no Host to judge: a guess either matches the word or it does not. */
export const TabooRoundScreen = ({ playerId }: TabooRoundScreenProps) => {
  const { state, isHost, dispatch } = useRoom();
  const round = state.currentRound?.game === 'TABOO' ? state.currentRound : null;
  const turn = round === null ? undefined : currentTurn(round);
  const secondsLeft = useCountdown(round?.endsAt ?? null);
  const turnIndex = round?.currentIndex ?? 0;
  // Which turn the draft belongs to, so the next one starts blank without an
  // effect having to clear it.
  const [draft, setDraft] = useState<{ turnIndex: number; value: string } | null>(null);
  const guessValue = draft?.turnIndex === turnIndex ? draft.value : '';
  const [submittedFor, setSubmittedFor] = useState(-1);
  const hasSubmitted = submittedFor === turnIndex;
  const allGuessedFor = useRef(-1);

  useEffect(() => {
    allGuessedFor.current = -1;
  }, [turnIndex]);

  useEffect(() => {
    // Only the Host closes the turn, so it happens once for everyone.
    if (isHost && secondsLeft <= 0 && round !== null) dispatch({ type: 'END_ROUND' });
  }, [isHost, secondsLeft, round, dispatch]);

  const onGuess = useCallback(
    (received: TabooGuess) => dispatch({ type: 'TABOO_GUESSED', guess: received }),
    [dispatch],
  );
  const channel = useTabooGuessBroadcast({ pin: state.pin, onGuess });

  useEffect(() => {
    // Only the Host pulls the deadline in, so it happens once for everyone.
    if (!isHost || round === null || allGuessedFor.current === turnIndex) return;
    if (!hasEveryoneGuessed(round, countPlayers(state))) return;

    allGuessedFor.current = turnIndex;
    dispatch({
      type: 'TABOO_ALL_GUESSED',
      endsAt: new Date(Date.now() + TABOO_GRACE_MS).toISOString(),
    });
  }, [isHost, round, turnIndex, state, dispatch]);

  const submitGuess = () => {
    const value = guessValue.trim();
    if (round === null || value === '' || hasSubmitted || hasGuessed(round, playerId)) return;

    setSubmittedFor(turnIndex);
    const guess: TabooGuess = { playerId, value };
    dispatch({ type: 'TABOO_GUESSED', guess });
    channel.sendGuess(guess);
  };

  if (round === null || turn === undefined) return null;

  const urgency = urgencyFor(secondsLeft);
  const everyoneGuessed = hasEveryoneGuessed(round, countPlayers(state));
  const isClueGiver = turn.clueGiverId === playerId;
  const clueGiverNickname =
    state.slots.find((slot) => slot?.id === turn.clueGiverId)?.nickname ?? 'SOMEBODY';

  return (
    <RetroContainer className="flex flex-col gap-5 p-6">
      <header className="sticky top-0 z-10 -mx-6 -mt-6 flex items-center justify-between gap-3 border-b-4 border-black bg-white/95 px-6 py-2 backdrop-blur">
        <div className="flex flex-col items-center">
          <SectionLabel>Turn</SectionLabel>
          <span data-testid="turn-progress" className="font-arcade text-sm text-green-600">
            {turnIndex + 1}/{round.turns.length}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <SectionLabel>Time</SectionLabel>
          <span
            data-testid="round-timer"
            data-urgency={urgency}
            className={cn(
              'font-arcade text-2xl transition-transform duration-300',
              URGENCY_STYLES[urgency],
            )}
          >
            {secondsLeft}
          </span>
        </div>
      </header>

      {everyoneGuessed && (
        <p
          role="alert"
          className="animate-blink border-4 border-black bg-rose-100 px-3 py-2 text-center font-arcade text-[10px] text-rose-600"
        >
          EVERYONE HAS GUESSED! ENDING ROUND
        </p>
      )}

      {isClueGiver ? (
        <div className="flex flex-col items-center gap-4">
          <SectionLabel>Make them say</SectionLabel>
          <p className="text-solid-shadow font-arcade text-2xl text-green-600">{turn.card.word}</p>

          <SectionLabel>Without saying</SectionLabel>
          <ul className="flex flex-col gap-2">
            {turn.card.forbidden.map((word) => (
              <li
                key={word}
                className="border-4 border-black bg-rose-100 px-3 py-2 text-center font-arcade text-[10px] text-rose-600"
              >
                {word}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <h1 className="text-center font-terminal text-2xl text-black">
            {clueGiverNickname} is explaining a word
          </h1>

          <RetroInput
            label="Your guess"
            value={guessValue}
            disabled={hasSubmitted}
            autoComplete="off"
            maxLength={32}
            onChange={(event) => setDraft({ turnIndex, value: event.target.value })}
          />

          <RetroButton
            tone="green"
            disabled={hasSubmitted || guessValue.trim() === ''}
            onClick={submitGuess}
          >
            {hasSubmitted ? 'GUESS SENT' : 'CONFIRM'}
          </RetroButton>

          {hasSubmitted && (
            <p
              role="status"
              className="animate-blink text-center font-terminal text-lg text-green-600"
            >
              Answer locked. Waiting for the others...
            </p>
          )}
        </div>
      )}
    </RetroContainer>
  );
};
