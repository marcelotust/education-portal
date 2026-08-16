import { useEffect, useRef, useState } from 'react';

const COPIED_LABEL_MS = 2000;

/** Copies the room's join link to the clipboard and flags it for a couple seconds. */
export const useInviteCopy = (pin: string) => {
  const [copied, setCopied] = useState(false);
  const copiedTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(copiedTimeout.current), []);

  const copyInviteLink = async () => {
    const inviteUrl = `${window.location.origin}/play?pin=${pin}`;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    clearTimeout(copiedTimeout.current);
    copiedTimeout.current = setTimeout(() => setCopied(false), COPIED_LABEL_MS);
  };

  return { copied, copyInviteLink };
};
