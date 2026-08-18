import { cn } from '@/utils/cn';
import { useInviteCopy } from '../useInviteCopy';

interface InviteLinkButtonProps {
  pin: string;
}

/**
 * Copies the room's join link to the clipboard. A small bordered button
 * beside the PIN, in the same retro-button language as the rest of the app
 * (border, offset shadow, press-in on click) — inviting is a secondary
 * action here, available to anyone seated, not just the Host.
 */
export const InviteLinkButton = ({ pin }: InviteLinkButtonProps) => {
  const { copied, copyInviteLink } = useInviteCopy(pin);

  return (
    <button
      type="button"
      aria-label={copied ? 'Copied!' : 'Invite'}
      onClick={() => void copyInviteLink()}
      className={cn(
        'flex h-11 w-11 shrink-0 items-center justify-center border-4 border-ink text-2xl shadow-retro transition-transform',
        'active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2',
        copied ? 'bg-green-100' : 'bg-white hover:bg-gray-100',
      )}
    >
      <span aria-hidden="true" className="font-arcade">
        {copied ? '✓' : '🔗'}
      </span>
    </button>
  );
};
