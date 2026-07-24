import { useState, type FormEvent } from 'react';

import { ArcadeButton } from '@/components/ui/ArcadeButton';
import { ArcadeInput } from '@/components/ui/ArcadeInput';
import type { CreateRoom, RoomSession } from '@/types/roomService';
import { MAX_NICKNAME_LENGTH } from '@/utils/room';

interface HostEntryScreenProps {
  createRoom: CreateRoom;
  onReady: (session: RoomSession) => void;
}

/** First screen of /host: anyone can open a room, and takes seat 1 in it. */
export const HostEntryScreen = ({ createRoom, onReady }: HostEntryScreenProps) => {
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
      <header className="flex flex-col items-center gap-2">
        <h1 className="text-neon font-arcade text-sm text-arcade-pink">NEW ROOM</h1>
        <p className="text-center font-terminal text-lg text-slate-400">
          You host the room and play as player 1 of 6.
        </p>
      </header>

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

      <ArcadeButton type="submit" tone="green" disabled={isCreating}>
        {isCreating ? 'CREATING...' : 'CREATE ROOM'}
      </ArcadeButton>
    </form>
  );
};
