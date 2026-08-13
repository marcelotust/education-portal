import { ArcadeButton } from '@/components/ui/ArcadeButton';
import { useRoom } from '@/hooks/useRoom';
import type { Player } from '@/types';
import { cn } from '@/utils/cn';
import { currentTurn, isLastTurn } from './tabooRound';

/**
 * The pause between two clue-givers. Until now nobody outside the clue-giver
 * knew the word — this is that moment, and it waits for the Host so they can
 * explain before the next turn starts.
 */
export const TabooRevealScreen = () => {
  const { state, isHost, dispatch } = useRoom();
  const round = state.currentRound?.game === 'TABOO' ? state.currentRound : null;
  const turn = round === null ? undefined : currentTurn(round);
  if (round === null || turn === undefined) return null;

  const clueGiverNickname =
    state.slots.find((slot) => slot?.id === turn.clueGiverId)?.nickname ?? 'SOMEBODY';

  const scored = state.slots
    .filter((slot): slot is Player => slot !== null)
    .map((player) => ({
      player,
      gained: round.turnPoints[player.id] ?? 0,
      total: state.scores[player.id] ?? 0,
    }))
    .sort((a, b) => b.gained - a.gained || b.total - a.total);

  const isLast = isLastTurn(round);

  const advance = () =>
    dispatch({
      type: 'NEXT_TABOO_TURN',
      // The next turn runs its own clock, started when the Host moves on.
      endsAt: new Date(Date.now() + state.gameSetup.roundDurationSeconds * 1000).toISOString(),
    });

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-col items-center gap-1">
        <span className="font-terminal text-xs uppercase tracking-[0.3em] text-slate-400">
          Turn
        </span>
        <span data-testid="turn-progress" className="font-arcade text-sm text-arcade-green">
          {round.currentIndex + 1}/{round.turns.length}
        </span>
      </header>

      <p className="text-center font-terminal text-lg text-slate-400">
        {clueGiverNickname} was explaining
      </p>
      <p
        data-testid="revealed-word"
        className="text-neon text-center font-arcade text-2xl text-arcade-green"
      >
        {turn.card.word}
      </p>

      <ol className="flex flex-col gap-1">
        {scored.map(({ player, gained, total }) => (
          <li
            key={player.id}
            data-testid={`reveal-row-${player.id}`}
            className={cn(
              'flex items-center gap-2 rounded border px-2 py-1',
              gained > 0 ? 'border-arcade-green/60' : 'border-slate-800',
            )}
          >
            <span className="flex-1 font-arcade text-[9px] text-slate-200">{player.nickname}</span>
            <span className="font-arcade text-[9px] text-arcade-cyan">
              {gained > 0 ? `+${gained}` : '—'}
            </span>
            <span className="w-8 shrink-0 text-right font-arcade text-[10px] text-arcade-green">
              {total}
            </span>
          </li>
        ))}
      </ol>

      {isHost ? (
        <ArcadeButton tone={isLast ? 'yellow' : 'green'} onClick={advance}>
          {isLast ? 'SEE THE SCOREBOARD' : 'NEXT CLUE-GIVER'}
        </ArcadeButton>
      ) : (
        <p role="status" className="text-center font-terminal text-lg text-slate-400">
          Waiting for the Host to move on...
        </p>
      )}
    </section>
  );
};
