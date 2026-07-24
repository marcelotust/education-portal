import { useId, type InputHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

interface ArcadeInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
}

export const ArcadeInput = ({ label, className, ...inputProps }: ArcadeInputProps) => {
  const id = useId();

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="font-terminal text-xs uppercase tracking-[0.3em] text-slate-400"
      >
        {label}
      </label>
      <input
        id={id}
        {...inputProps}
        className={cn(
          'rounded-md border-2 border-slate-700 bg-slate-950 px-3 py-2',
          'font-terminal text-2xl text-arcade-green placeholder:text-slate-700',
          'focus:border-arcade-cyan focus:outline-none',
          className,
        )}
      />
    </div>
  );
};
