import {
  useId,
  useRef,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
} from 'react';

import { cn } from '@/utils/cn';
import { PIN_LENGTH } from '@/utils/room';

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Tints every box's border rose, e.g. once the Host says that PIN is wrong. */
  hasError?: boolean;
  /** Fires once the last box is filled, so focus can move on to whatever comes next. */
  onComplete?: () => void;
}

/**
 * Room PIN entry as PIN_LENGTH separate boxes instead of one text field, so
 * it reads at a glance as "type 4 letters" rather than an open-ended field.
 * Typing a box advances focus to the next one; Backspace on an empty box
 * steps back instead of doing nothing; focusing a filled box selects its
 * character so typing replaces it; pasting a whole PIN fills every box at
 * once.
 */
export const PinInput = ({ value, onChange, hasError = false, onComplete }: PinInputProps) => {
  const labelId = useId();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const chars = Array.from({ length: PIN_LENGTH }, (_, index) => value[index] ?? '');

  const setChars = (next: string[]) => {
    onChange(next.join('').trimEnd());
  };

  const handleChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    // Only the character actually typed: a filled box that isn't fully
    // replaced by the browser can otherwise leave two characters behind.
    const char = event.target.value.toUpperCase().slice(-1);
    const next = [...chars];
    next[index] = char;
    setChars(next);

    if (char === '') return;
    if (index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    } else {
      onComplete?.();
    }
  };

  const handleKeyDown = (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && chars[index] === '' && index > 0) {
      event.preventDefault();
      const next = [...chars];
      next[index - 1] = '';
      setChars(next);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (index: number) => (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').toUpperCase().replace(/[^A-Z]/g, '');
    if (pasted === '') return;
    event.preventDefault();

    const next = [...chars];
    let cursor = index;
    for (const char of pasted) {
      if (cursor >= PIN_LENGTH) break;
      next[cursor] = char;
      cursor += 1;
    }
    setChars(next);
    if (cursor >= PIN_LENGTH) {
      onComplete?.();
    } else {
      inputRefs.current[cursor]?.focus();
    }
  };

  return (
    <div className="flex flex-col gap-1 text-center">
      <span
        id={labelId}
        className="font-terminal text-sm uppercase tracking-[0.3em] text-gray-500"
      >
        Room PIN
      </span>
      <div role="group" aria-labelledby={labelId} className="flex justify-center gap-2">
        {chars.map((char, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            aria-label={`Room PIN letter ${index + 1}`}
            value={char}
            autoComplete="off"
            autoCapitalize="characters"
            inputMode="text"
            onChange={handleChange(index)}
            onKeyDown={handleKeyDown(index)}
            onPaste={handlePaste(index)}
            onFocus={(event) => event.target.select()}
            className={cn(
              'h-14 w-12 border-4 bg-white text-center font-arcade text-2xl uppercase leading-[3.5rem] text-orange-500',
              'focus:bg-yellow-50 focus:shadow-[inset_2px_2px_0px_rgba(56,26,65,0.1)] focus:outline-none',
              hasError ? 'border-rose-500' : 'border-ink',
            )}
          />
        ))}
      </div>
    </div>
  );
};
