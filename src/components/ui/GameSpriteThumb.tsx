import { cn } from '@/utils/cn';

interface GameSpriteThumbProps {
  /** CSS `background-position` into `public/games.png`'s 2x2 spritesheet. */
  spritePosition: string;
  className?: string;
}

/**
 * One quadrant of the games.png spritesheet, cropped via `background-position`
 * against a doubled `background-size` so it stays sharp at any card width.
 */
export const GameSpriteThumb = ({ spritePosition, className }: GameSpriteThumbProps) => (
  <div
    aria-hidden="true"
    className={cn(
      "aspect-[4/3] w-full border-2 border-black bg-[url('/games.png')] bg-[length:200%_200%]",
      className,
    )}
    style={{ backgroundPosition: spritePosition, imageRendering: 'pixelated' }}
  />
);
