import { useEffect, useState } from 'react';

import { useRoom } from './useRoom';

/**
 * How long the Host seat may stay empty before the Players are told. Presence
 * drops on any network hiccup, and a Host switching tabs on a phone comes
 * back in a second or two — announcing that would be noise, not information.
 */
const HOST_AWAY_GRACE_MS = 6000;

/**
 * Whether the Host has been gone long enough for the round to be stuck.
 *
 * Only the Host writes the room row, so while its seat is empty nothing can
 * close the round, judge it or score it (see `docs/decisions/0001`). Presence
 * already knows: `buildSlotsFromPresence` drops the seat as soon as the
 * connection goes. Always `false` on the Host's own screen.
 */
export const useHostAway = (): boolean => {
  const { state, isHost } = useRoom();
  const isHostSeated = state.slots.some((slot) => slot?.id === state.hostId);
  const [isAway, setIsAway] = useState(false);

  useEffect(() => {
    if (isHost || isHostSeated) return undefined;

    const timer = setTimeout(() => setIsAway(true), HOST_AWAY_GRACE_MS);
    // The Host coming back tears this down, which is where the notice clears.
    return () => {
      clearTimeout(timer);
      setIsAway(false);
    };
  }, [isHost, isHostSeated]);

  return isAway;
};
