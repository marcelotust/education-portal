import { useState, type FormEvent } from 'react';

import { PageTitle } from '@/components/ui/PageTitle';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroContainer } from '@/components/ui/RetroContainer';
import { RetroInput } from '@/components/ui/RetroInput';
import type { CreateRoom, RoomSession } from '@/types/roomService';
import { MAX_NICKNAME_LENGTH } from '@/utils/room';
import { ResumeRoomBanner } from './ResumeRoomBanner';

interface HostEntryScreenProps {
  createRoom: CreateRoom;
  onReady: (session: RoomSession) => void;
  /** An open room this Host already owns, if any. */
  resumableRoom?: RoomSession | null | undefined;
  onResume?: ((session: RoomSession) => void) | undefined;
}

/** First screen of /host: anyone can open a room, and takes seat 1 in it. */
export const HostEntryScreen = ({
  createRoom,
  onReady,
  resumableRoom,
  onResume,
}: HostEntryScreenProps) => {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isCreating) return;

    const trimmed = nickname.trim().toUpperCase();
    if (trimmed === '') {
      setError('Type a nickname — you take the first seat.');
      return;
    }

    setError(null);
    setIsCreating(true);
    try {
      onReady(await createRoom(trimmed));
    } catch {
      setError('Could not create the room. Check your connection and try again.');
      setIsCreating(false);
    }
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={(event) => void handleSubmit(event)}>
      {resumableRoom != null && onResume !== undefined && (
        <ResumeRoomBanner session={resumableRoom} onResume={onResume} />
      )}

      <RetroContainer className="flex flex-col gap-5 p-6">
        <header className="flex flex-col items-center gap-2">
          <PageTitle>{resumableRoom == null ? 'NEW ROOM' : 'OR START A NEW ROOM'}</PageTitle>
          <p className="text-center font-terminal text-lg text-gray-600">
            You host the room and play as player 1 of 6.
          </p>
        </header>

        <RetroInput
          label="Nickname"
          placeholder="PLAYER 1"
          value={nickname}
          maxLength={MAX_NICKNAME_LENGTH}
          autoComplete="off"
          onChange={(event) => setNickname(event.target.value)}
        />

        {error !== null && (
          <p role="alert" className="font-terminal text-lg text-rose-500">
            {error}
          </p>
        )}

        <RetroButton type="submit" tone="green" disabled={isCreating}>
          {isCreating ? 'CREATING...' : 'CREATE ROOM'}
        </RetroButton>
      </RetroContainer>
    </form>
  );
};
