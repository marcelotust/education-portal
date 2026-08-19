import { cn } from '@/utils/cn';
import { useInviteCopy } from '../useInviteCopy';

interface InviteSlotRowProps {
  pin: string;
}

/** The board's one open seat, standing in as an invite CTA for anyone seated. */
export const InviteSlotRow = ({ pin }: InviteSlotRowProps) => {
  const { copied, copyInviteLink } = useInviteCopy(pin);

  return (
    <li>
      <button
        type="button"
        data-testid="invite-slot"
        aria-label={copied ? 'Copied!' : 'Invite new players'}
        onClick={() => void copyInviteLink()}
        className={cn(
          'flex min-h-11 w-full items-center justify-center border-4 border-dashed px-3 py-1.5 transition-transform',
          'active:translate-x-[4px] active:translate-y-[4px]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2',
          copied
            ? 'border-green-400 bg-green-50'
            : 'border-yellow-400 bg-yellow-50 hover:bg-yellow-100',
        )}
      >
        <span
          className={cn(
            'truncate font-arcade text-[10px]',
            // green-600 only clears ~3.15:1 against bg-green-50, short of
            // WCAG AA's 4.5:1 for normal text.
            copied ? 'text-green-700' : 'text-yellow-700',
          )}
        >
          {copied ? 'COPIED!' : 'INVITE NEW PLAYERS'}
        </span>
      </button>
    </li>
  );
};
