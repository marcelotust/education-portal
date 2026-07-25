import { ArcadeButton } from '@/components/ui/ArcadeButton';
import { useRoom } from '@/hooks/useRoom';

/**
 * Placeholder for CALCULATING_SCORES: the Host validation table is the next
 * slice. It already lists what arrived so the round never dead-ends.
 */
export const RoundResultsScreen = () => {
  const { state, isHost, dispatch } = useRoom();
  const answers = state.currentRound?.answers ?? [];
  const players = new Set(answers.map((answer) => answer.playerId));

  return (
    <section className="flex flex-col gap-5 text-center">
      <h1 className="text-neon font-arcade text-sm text-arcade-yellow">TIME&apos;S UP</h1>

      <p className="font-terminal text-xl text-slate-300">
        {players.size} of {state.slots.filter((slot) => slot !== null).length} players answered.
      </p>

      <p className="font-terminal text-lg text-slate-500">Host validation is coming next.</p>

      {isHost && (
        <ArcadeButton tone="cyan" onClick={() => dispatch({ type: 'RETURN_TO_LOBBY' })}>
          BACK TO LOBBY
        </ArcadeButton>
      )}
    </section>
  );
};
