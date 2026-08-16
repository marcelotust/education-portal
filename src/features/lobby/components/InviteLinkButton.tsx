import { cn } from '@/utils/cn';
import { useInviteCopy } from '../useInviteCopy';

interface InviteLinkButtonProps {
  pin: string;
}

/**
 * Copies the room's join link to the clipboard. A small icon button next to
 * the PIN, not a full CTA — inviting is a secondary action here, not the
 * thing this screen is asking the Host to do.
 */
export const InviteLinkButton = ({ pin }: InviteLinkButtonProps) => {
  const { copied, copyInviteLink } = useInviteCopy(pin);

  return (
    <button
      type="button"
      aria-label={copied ? 'Copied!' : 'Invite'}
      onClick={() => void copyInviteLink()}
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center border-4 border-black font-arcade text-base transition-transform',
        'shadow-retro active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2',
        copied ? 'bg-green-400 text-black' : 'bg-rose-500 text-white hover:bg-rose-400',
      )}
    >
      <span aria-hidden="true">{copied ? '✓' : '❐'}</span>
    </button>
  );
};
