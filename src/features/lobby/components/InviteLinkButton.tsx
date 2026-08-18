import { cn } from '@/utils/cn';
import { useInviteCopy } from '../useInviteCopy';

interface InviteLinkButtonProps {
  pin: string;
}

/**
 * Copies the room's join link to the clipboard — the same action as the
 * lobby's "INVITE NEW PLAYERS" open-seat CTA, offered again here beside the
 * PIN so it's reachable without an open seat. Sized down from a standard
 * RetroButton: it sits beside the PIN, not as a primary action of its own.
 */
export const InviteLinkButton = ({ pin }: InviteLinkButtonProps) => {
  const { copied, copyInviteLink } = useInviteCopy(pin);

  return (
    <button
      type="button"
      onClick={() => void copyInviteLink()}
      className={cn(
        'flex h-6 shrink-0 items-center justify-center whitespace-nowrap border-2 border-ink px-1.5 font-arcade text-[7px] tracking-wider shadow-retro transition-transform',
        'active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2',
        copied ? 'bg-green-100 text-green-700' : 'bg-yellow-400 text-black hover:bg-yellow-300',
      )}
    >
      {copied ? 'COPIED!' : 'SHARE'}
    </button>
  );
};
