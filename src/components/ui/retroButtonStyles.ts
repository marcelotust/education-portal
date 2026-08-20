import { cn } from '@/utils/cn';

export type RetroButtonTone = 'green' | 'pink' | 'cyan' | 'yellow' | 'white';

/**
 * The size of control this state styling is being applied to. `'md'` is
 * `RetroButton`'s own geometry; `'sm'` matches the smaller toggle-chip
 * buttons (round-length/category/topic pickers) that reimplement this same
 * state logic by hand in raw JSX instead of rendering a `RetroButton` —
 * their layout, padding, and font stay local to each call site, only the
 * selected/default/disabled *state* classes come from here (#146).
 */
export type RetroButtonSize = 'sm' | 'md';

// The label's text-shadow always opposes the text color — a dark shadow on
// already-black text (yellow/white tones) would be invisible — so it's
// bundled here rather than applied as one unconditional class.
const DARK_TEXT_SHADOW = '[text-shadow:1px_1px_0_rgba(0,0,0,0.6)]';
const LIGHT_TEXT_SHADOW = '[text-shadow:1px_1px_0_rgba(255,255,255,0.6)]';

const TONE_STYLES: Record<RetroButtonTone, string> = {
  green: `bg-green-500 text-white ${DARK_TEXT_SHADOW}`,
  pink: `bg-rose-500 text-white ${DARK_TEXT_SHADOW}`,
  cyan: `bg-sky-500 text-white ${DARK_TEXT_SHADOW}`,
  yellow: `bg-yellow-400 text-black ${LIGHT_TEXT_SHADOW}`,
  white: `bg-white text-black ${LIGHT_TEXT_SHADOW}`,
};

// Selected/pressed dims only the fill to 80% — border, shadow and text stay
// at full opacity, so the control still reads crisp and just the color
// itself recedes, instead of the whole element fading.
const TONE_STYLES_SELECTED: Record<RetroButtonTone, string> = {
  green: `bg-green-500/80 text-white ${DARK_TEXT_SHADOW}`,
  pink: `bg-rose-500/80 text-white ${DARK_TEXT_SHADOW}`,
  cyan: `bg-sky-500/80 text-white ${DARK_TEXT_SHADOW}`,
  yellow: `bg-yellow-400/80 text-black ${LIGHT_TEXT_SHADOW}`,
  white: `bg-white/80 text-black ${LIGHT_TEXT_SHADOW}`,
};

// Same idea for the momentary :active press on a non-selected button.
const TONE_ACTIVE_BG: Record<RetroButtonTone, string> = {
  green: 'active:bg-green-500/80',
  pink: 'active:bg-rose-500/80',
  cyan: 'active:bg-sky-500/80',
  yellow: 'active:bg-yellow-400/80',
  white: 'active:bg-white/80',
};

// Border/shadow/press-translate geometry, by size. The `sm` (toggle-chip)
// shape has no active:translate/shadow-none — those buttons only ever dim
// their fill on :active (`TONE_ACTIVE_BG` above), they don't get the
// mechanically-pushed-in press animation `md` (RetroButton proper) has.
// Every literal class here has to be spelled out in full — Tailwind's JIT
// scanner matches complete strings in source, not runtime-interpolated
// pixel values, so this can't be built from a template literal.
const SIZE_GEOMETRY: Record<RetroButtonSize, { default: string; selected: string }> = {
  md: {
    default:
      'border-[3px] border-ink shadow-retro active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
    selected:
      'translate-x-[4px] translate-y-[4px] border-[5px] border-flare shadow-[-1px_-1px_0_0_#000000,1px_1px_0_0_#ffff00]',
  },
  sm: {
    default: 'border-4 border-ink shadow-[2px_2px_0px_0px_#381a41]',
    selected:
      'translate-x-[2px] translate-y-[2px] border-[6px] border-flare shadow-[-1px_-1px_0_0_#000000,1px_1px_0_0_#ffff00]',
  },
};

/**
 * The selected/default/disabled state classes shared by `RetroButton` and
 * every hand-rolled toggle-chip button (#146) — every tone keeps its bold
 * fill color family in every state, full opacity at rest, and when selected
 * only the *fill* dims to 80% (border, shadow, and text stay full-strength)
 * so the control reads as physically recessed without going muddy. Disabled
 * dims everything uniformly to 60% and drops the shadow, reading as flat
 * rather than just faded. Selection's bright `flare` border gets a 1px
 * two-tone bevel just outside it — black on the top/left edges, yellow on
 * bottom/right — built from two stacked zero-blur `box-shadow`s rather than
 * a real second border, since `border` can't vary color by side without
 * extra elements and `box-shadow` doesn't add to the box model the way a
 * second border would.
 *
 * Deliberately does not include layout, padding, font, or `min-h-11` —
 * those vary by call site and stay owned locally, so reusing this can't
 * accidentally change anything's size or position.
 */
export const retroSelectableClasses = ({
  tone,
  selected,
  size = 'md',
}: {
  tone: RetroButtonTone;
  selected: boolean;
  size?: RetroButtonSize;
}): string =>
  cn(
    'transition-[transform,border-width]',
    'disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none',
    selected
      ? cn(SIZE_GEOMETRY[size].selected, TONE_STYLES_SELECTED[tone])
      : cn(SIZE_GEOMETRY[size].default, TONE_STYLES[tone], TONE_ACTIVE_BG[tone]),
  );
