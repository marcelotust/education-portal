import { useEffect, useRef, useState } from 'react';

import { ArcadeButton } from '@/components/ui/ArcadeButton';

interface InviteLinkButtonProps {
  pin: string;
}

const COPIED_LABEL_MS = 2000;

/**
 * Turns the room PIN into a join link the Host can hand out, preferring the
 * native share sheet on mobile and falling back to a clipboard copy.
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
    <ArcadeButton tone="pink" onClick={() => void handleClick()}>
      {copied ? 'COPIED!' : 'INVITE'}
    </ArcadeButton>
  );
};
