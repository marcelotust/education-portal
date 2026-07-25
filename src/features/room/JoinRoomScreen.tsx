import { useState, type FormEvent } from 'react';

import { ArcadeButton } from '@/components/ui/ArcadeButton';
import { ArcadeInput } from '@/components/ui/ArcadeInput';
import { rememberRoom } from '@/lib/recentRooms';
import { RoomJoinError, type JoinRoom, type RoomSession } from '@/types/roomService';
import { MAX_NICKNAME_LENGTH, PIN_LENGTH, isValidPin } from '@/utils/room';

const FAILURE_MESSAGES: Record<string, string> = {
  ROOM_NOT_FOUND: 'There is no room with that PIN.',
  ROOM_FULL: 'That room is full — all 6 seats are taken.',
};

/**
 * Arriving with the PIN already filled means the app suggested this room. If it
 * is gone, that is not the student mistyping.
 */
const SUGGESTED_ROOM_GONE = 'That room has ended. Ask for a new PIN.';

const FALLBACK_MESSAGE = 'Could not join the room. Check your connection and try again.';

interface JoinRoomScreenProps {
  joinRoom: JoinRoom;
  onReady: (session: RoomSession) => void;
  /** Prefilled when arriving from the landing page's history. */
  initialPin?: string | undefined;
}

/** First screen of /play: the student types the PIN the Host is showing. */
export const JoinRoomScreen = ({ joinRoom, onReady, initialPin }: JoinRoomScreenProps) => {
  const [pin, setPin] = useState(initialPin ?? '');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isJoining) return;

    const normalisedPin = pin.trim().toUpperCase();
    const trimmedNickname = nickname.trim().toUpperCase();

    if (!isValidPin(normalisedPin)) {
      setError(`The PIN has ${PIN_LENGTH} letters.`);
      return;
    }
    if (trimmedNickname === '') {
      setError('Type a nickname so your classmates know who you are.');
      return;
    }

    setError(null);
    setIsJoining(true);
    try {
      const session = await joinRoom(normalisedPin, trimmedNickname);
      // Presence leaves no trace, so the way back lives in this browser.
      rememberRoom({
        pin: normalisedPin,
        nickname: trimmedNickname,
        joinedAt: new Date().toISOString(),
      });
      onReady(session);
    } catch (cause) {
      const reason = cause instanceof RoomJoinError ? cause.reason : 'UNKNOWN';
      const wasSuggested = reason === 'ROOM_NOT_FOUND' && normalisedPin === initialPin;
      setError(wasSuggested ? SUGGESTED_ROOM_GONE : (FAILURE_MESSAGES[reason] ?? FALLBACK_MESSAGE));
      setIsJoining(false);
    }
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={(event) => void handleSubmit(event)}>
      <header className="flex flex-col items-center gap-2">
        <h1 className="text-neon font-arcade text-sm text-arcade-cyan">INSERT PIN</h1>
        <p className="text-center font-terminal text-lg text-slate-400">
          Ask your teacher for the 4-letter PIN.
        </p>
      </header>

      <ArcadeInput
        label="Room PIN"
        value={pin}
        maxLength={PIN_LENGTH}
        autoComplete="off"
        autoCapitalize="characters"
        className="text-center uppercase tracking-[0.5em]"
        onChange={(event) => setPin(event.target.value)}
      />

      <ArcadeInput
        label="Nickname"
        value={nickname}
        maxLength={MAX_NICKNAME_LENGTH}
        autoComplete="off"
        onChange={(event) => setNickname(event.target.value)}
      />

      {error !== null && (
        <p role="alert" className="font-terminal text-lg text-arcade-pink">
          {error}
        </p>
      )}

      <ArcadeButton type="submit" tone="cyan" disabled={isJoining}>
        {isJoining ? 'JOINING...' : 'JOIN'}
      </ArcadeButton>
    </form>
  );
};
