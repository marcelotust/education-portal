const STORAGE_KEY = 'eduparty.recent-rooms';

export const RECENT_ROOMS_LIMIT = 5;

export interface RecentRoom {
  pin: string;
  nickname: string;
  joinedAt: string;
}

const isRecentRoom = (value: unknown): value is RecentRoom => {
  if (typeof value !== 'object' || value === null) return false;
  const room = value as Partial<RecentRoom>;
  return (
    typeof room.pin === 'string' &&
    typeof room.nickname === 'string' &&
    typeof room.joinedAt === 'string'
  );
};

/**
 * Rooms a student joined leave no trace in the database — presence is
 * ephemeral and RLS keeps the room Host-writable — so the list lives in this
 * browser. It follows the device, not the person.
 */
export const listRecentRooms = (): RecentRoom[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(isRecentRoom)
      .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt))
      .slice(0, RECENT_ROOMS_LIMIT);
  } catch {
    // Corrupted storage is not worth crashing a landing page over.
    return [];
  }
};

export const rememberRoom = (room: RecentRoom): void => {
  const others = listRecentRooms().filter((entry) => entry.pin !== room.pin);
  const next = [room, ...others].slice(0, RECENT_ROOMS_LIMIT);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private browsing can refuse writes; the app must keep working.
  }
};
