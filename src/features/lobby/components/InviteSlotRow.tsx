import { cn } from '@/utils/cn';
import { useInviteCopy } from '../useInviteCopy';

interface InviteSlotRowProps {
  pin: string;
}

/** The board's one open seat, standing in as an invite CTA for the Host. */
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
          'flex min-h-11 w-full items-center gap-3 border-4 border-dashed px-3 py-1.5 text-left transition-transform',
          'active:translate-x-[4px] active:translate-y-[4px]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2',
          copied
            ? 'border-green-400 bg-green-50'
            : 'border-yellow-400 bg-yellow-50 hover:bg-yellow-100',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center border-2 border-dashed font-arcade text-base',
            copied ? 'border-green-400 text-green-600' : 'border-yellow-400 text-yellow-600',
          )}
        >
          {copied ? '✓' : '❐'}
        </span>

        <span
          className={cn(
            'flex-1 truncate text-left font-arcade text-[10px]',
            copied ? 'text-green-600' : 'text-yellow-700',
          )}
        >
          {copied ? 'COPIED!' : 'INVITE NEW PLAYERS'}
        </span>
      </button>
    </li>
  );
};
