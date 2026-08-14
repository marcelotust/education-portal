import { useEffect, useRef, useState } from 'react';

import { cn } from '@/utils/cn';

interface InviteLinkButtonProps {
  pin: string;
}

const COPIED_LABEL_MS = 2000;

/**
 * Turns the room PIN into a join link the Host can hand out, preferring the
 * native share sheet on mobile and falling back to a clipboard copy. A small
 * icon button next to the PIN, not a full CTA — inviting is a secondary
 * action here, not the thing this screen is asking the Host to do.
 */
export const InviteLinkButton = ({ pin }: InviteLinkButtonProps) => {
  const [copied, setCopied] = useState(false);
  const copiedTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(copiedTimeout.current), []);

  const handleClick = async () => {
    const inviteUrl = `${window.location.origin}/play?pin=${pin}`;

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'Join my EduParty room', url: inviteUrl });
      } catch {
        // A cancelled share sheet is not a failure worth reporting.
      }
      return;
    }

    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    clearTimeout(copiedTimeout.current);
    copiedTimeout.current = setTimeout(() => setCopied(false), COPIED_LABEL_MS);
  };

  return (
    <button
      type="button"
      aria-label={copied ? 'Copied!' : 'Invite'}
      onClick={() => void handleClick()}
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center border-4 border-black font-arcade text-base transition-transform',
        'shadow-retro active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2',
        copied ? 'bg-green-400 text-black' : 'bg-rose-500 text-white hover:bg-rose-400',
      )}
    >
      <span aria-hidden="true">{copied ? '✓' : '→'}</span>
    </button>
  );
};
