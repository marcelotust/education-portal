import { useState } from 'react';

import { RetroButton } from '@/components/ui/RetroButton';

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
      <RetroButton tone="white" onClick={() => setIsConfirming(true)}>
        NEW MATCH
      </RetroButton>
    );
  }

  return (
    <div className="flex flex-col gap-2 border-4 border-black bg-orange-50 p-3">
      <p className="font-terminal text-lg leading-tight text-black">
        Start a new match? Every score goes back to zero. The room, the PIN and everyone seated stay
        exactly as they are.
      </p>

      <RetroButton
        tone="pink"
        onClick={() => {
          onConfirm();
          setIsConfirming(false);
        }}
      >
        ZERO THE SCORES
      </RetroButton>

      <RetroButton tone="cyan" onClick={() => setIsConfirming(false)}>
        KEEP THEM
      </RetroButton>
    </div>
  );
};
