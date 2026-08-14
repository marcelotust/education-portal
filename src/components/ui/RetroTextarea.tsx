import { useId, type TextareaHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

interface RetroTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label: string;
}

/** Retro Platformer textarea: same border/focus treatment as RetroInput, multi-line. */
export const RetroTextarea = ({ label, className, ...textareaProps }: RetroTextareaProps) => {
  const id = useId();

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="font-terminal text-sm uppercase tracking-[0.3em] text-gray-500"
      >
        {label}
      </label>
      <textarea
        id={id}
        {...textareaProps}
        className={cn(
          'border-4 border-black bg-white px-3 py-2',
          'font-terminal text-xl text-black placeholder:text-gray-400',
          'focus:bg-yellow-50 focus:shadow-[inset_2px_2px_0px_rgba(0,0,0,0.1)] focus:outline-none',
          className,
        )}
      />
    </div>
  );
};
