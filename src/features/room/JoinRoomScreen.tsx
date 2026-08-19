import { useRef, useState, type FormEvent } from 'react';

import { PageTitle } from '@/components/ui/PageTitle';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroContainer } from '@/components/ui/RetroContainer';
import { RetroInput } from '@/components/ui/RetroInput';
import { rememberRoom } from '@/lib/recentRooms';
import { RoomJoinError, type JoinRoom, type RoomSession } from '@/types/roomService';
import { MAX_NICKNAME_LENGTH, PIN_LENGTH, isValidPin } from '@/utils/room';
import { PinInput } from './PinInput';

const FAILURE_MESSAGES: Record<string, string> = {
  ROOM_NOT_FOUND: 'There is no room with that PIN.',
  ROOM_FULL: 'That room is full — all 6 seats are taken.',
};

/**
 * Arriving with the PIN already filled means the app suggested this room. If it
 * is gone, that is not the Player mistyping.
 */
const SUGGESTED_ROOM_GONE = 'That room has ended. Ask for a new PIN.';

const FALLBACK_MESSAGE = 'Could not join the room. Check your connection and try again.';

interface JoinRoomScreenProps {
  joinRoom: JoinRoom;
  onReady: (session: RoomSession) => void;
  /** Prefilled when arriving from the landing page's history. */
  initialPin?: string | undefined;
}

/** First screen of /play: the Player types the PIN the Host is showing. */
export const JoinRoomScreen = ({ joinRoom, onReady, initialPin }: JoinRoomScreenProps) => {
  const [pin, setPin] = useState(initialPin ?? '');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const nicknameRef = useRef<HTMLInputElement>(null);

  const canSubmit = isValidPin(pin.trim().toUpperCase()) && nickname.trim() !== '';

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
      <RetroContainer className="flex flex-col gap-5 p-6">
        <header className="flex flex-col items-center gap-2">
          <PageTitle tone="cyan">INSERT PIN</PageTitle>
          <p className="text-center font-terminal text-lg text-gray-600">
            Ask the Host for the 4-letter PIN.
          </p>
        </header>

        <div className="flex flex-col gap-1">
          <PinInput
            value={pin}
            onChange={setPin}
            hasError={error !== null}
            onComplete={() => nicknameRef.current?.focus()}
          />

          {error !== null && (
            <p role="alert" className="text-center font-terminal text-lg text-rose-500">
              {error}
            </p>
          )}
        </div>

        <RetroInput
          ref={nicknameRef}
          label="Nickname"
          placeholder="PLAYER 2"
          value={nickname}
          maxLength={MAX_NICKNAME_LENGTH}
          autoComplete="off"
          autoCapitalize="characters"
          containerClassName="items-center"
          className="w-48 text-center text-3xl uppercase text-sky-600"
          onChange={(event) => setNickname(event.target.value)}
        />

        <RetroButton type="submit" tone="cyan" disabled={isJoining || !canSubmit}>
          {isJoining ? 'JOINING...' : 'JOIN'}
        </RetroButton>
      </RetroContainer>
    </form>
  );
};
