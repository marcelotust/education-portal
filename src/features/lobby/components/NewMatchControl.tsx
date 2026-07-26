import { useState } from 'react';

import { ArcadeButton } from '@/components/ui/ArcadeButton';

interface NewMatchControlProps {
  onConfirm: () => void;
}

/**
 * Starting over with the same room. The only destructive action in the app, so
 * it asks first: a mis-tap here costs a class its whole session.
 */
export const NewMatchControl = ({ onConfirm }: NewMatchControlProps) => {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isConfirming) {
    return (
      <ArcadeButton
        tone="yellow"
        className="border-slate-700 text-slate-400 hover:bg-slate-800"
        onClick={() => setIsConfirming(true)}
      >
        NEW MATCH
      </ArcadeButton>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border-2 border-arcade-pink/60 p-3">
      <p className="font-terminal text-lg leading-tight text-slate-300">
        Start a new match? Every score goes back to zero. The room, the PIN and everyone seated stay
        exactly as they are.
      </p>

      <ArcadeButton
        tone="pink"
        onClick={() => {
          onConfirm();
          setIsConfirming(false);
        }}
      >
        ZERO THE SCORES
      </ArcadeButton>

      <ArcadeButton tone="cyan" onClick={() => setIsConfirming(false)}>
        KEEP THEM
      </ArcadeButton>
    </div>
  );
};
