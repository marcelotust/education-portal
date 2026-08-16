import { cn } from '@/utils/cn';
import { useInviteCopy } from '../useInviteCopy';

interface InviteLinkButtonProps {
  pin: string;
}

/**
 * Copies the room's join link to the clipboard. A bare icon beside the PIN,
 * not a boxed button — inviting is a secondary action here, not the thing
 * this screen is asking the Host to do.
 */
export const InviteLinkButton = ({ pin }: InviteLinkButtonProps) => {
  const { copied, copyInviteLink } = useInviteCopy(pin);

  return (
    <button
      type="button"
      aria-label={copied ? 'Copied!' : 'Invite'}
      onClick={() => void copyInviteLink()}
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center font-arcade text-xl transition-transform',
        'active:scale-90',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2',
        copied ? 'text-green-500' : 'text-flare hover:text-rose-400',
      )}
    >
      <span aria-hidden="true">{copied ? '✓' : '❐'}</span>
    </button>
  );
};
