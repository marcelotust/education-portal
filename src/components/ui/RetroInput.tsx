import { useId, type InputHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

interface RetroInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
}

/**
 * Retro Platformer text input: thick black border, flat (no drop shadow —
 * shadows are reserved for panels and buttons), a soft yellow tint and inset
 * shadow on focus instead of a glow.
 */
export const RetroInput = ({ label, className, ...inputProps }: RetroInputProps) => {
  const id = useId();

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="font-terminal text-sm uppercase tracking-[0.3em] text-gray-600"
      >
        {label}
      </label>
      <input
        id={id}
        {...inputProps}
        className={cn(
          'border-4 border-black bg-white px-3 py-2',
          'font-terminal text-2xl text-black placeholder:text-gray-400',
          'focus:bg-yellow-50 focus:shadow-[inset_2px_2px_0px_rgba(0,0,0,0.1)] focus:outline-none',
          className,
        )}
      />
    </div>
  );
};
