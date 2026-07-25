import { useEffect, useState } from 'react';

import { secondsUntil } from '@/features/gameplay/stopRound';

/**
 * Seconds left until `endsAt`, recomputed on every tick. The deadline is an
 * absolute timestamp shared by everyone, so no two clocks drift apart mid-round.
 */
export const useCountdown = (endsAt: string | null): number => {
  const [, tick] = useState(0);

  useEffect(() => {
    if (endsAt === null) return;

    const interval = setInterval(() => {
      tick((count) => count + 1);
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [endsAt]);

  return secondsUntil(endsAt);
};
