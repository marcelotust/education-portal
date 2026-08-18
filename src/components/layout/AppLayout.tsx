import { useEffect, useRef, type ReactNode } from 'react';

import { AdSlot } from './AdSlot';
import { Footer } from './Footer';
import { Header } from './Header';

interface AppLayoutProps {
  children: ReactNode;
}

// sky.png is a dithered star tile with a transparent/black alpha channel and
// no color of its own, so a plain mask recolors it freely. Three copies
// blend into a dusk gradient below a flat band of the page's own blue at the
// top. Rendered at native size, no mask-size override — SKY_TILE_HEIGHT_PX
// is the asset's actual pixel height and must track it if the file changes.
// Layers are spaced by the tile height minus a fixed overlap, so the blend
// stays consistent across tile-size changes instead of drifting into gaps
// or flat, unblended stripes.
const SKY_TILE_HEIGHT_PX = 300;
const SKY_LAYER_OVERLAP_PX = 80;
const SKY_LAYER_SPACING_PX = SKY_TILE_HEIGHT_PX - SKY_LAYER_OVERLAP_PX;
const SKY_TINTS = ['#51a0ff', '#5d7ed0', '#9d8ad0'] as const;
const SKY_LAYERS = SKY_TINTS.map((tint, index) => ({
  topPx: SKY_LAYER_SPACING_PX * (index + 1),
  tint,
}));
const SKY_TOTAL_HEIGHT_PX = SKY_LAYER_SPACING_PX * SKY_TINTS.length + SKY_TILE_HEIGHT_PX;

// The sky drifts at 40% of the real scroll speed — background lags behind
// content instead of moving as one flat sheet with it.
const SKY_PARALLAX_SPEED = 0.4;

// Below the sky, a page taller than the gradient must keep going in the last
// tint, not snap back to the page's own starting blue. This can't be a
// second flat color painted on the root: the sky above it is lagging behind
// real scroll (see SKY_PARALLAX_SPEED), so a fill keyed to raw document
// position would fall out of sync and show through as a wrong-colored band
// once real scroll outpaces the lagging sky. Making it a fourth layer inside
// the same parallax wrapper — tall enough for any realistic page, plain
// color, no mask — keeps it moving with the same transform as the tinted
// layers, so it only ever appears exactly where they leave off.
const PAGE_BOTTOM_COLOR = SKY_TINTS[SKY_TINTS.length - 1];
const SKY_FILL_HEIGHT_PX = 20000;

/**
 * Retro Platformer cabinet frame: a persistent brand header and ground-band
 * footer around a centered mobile-first column with lateral ad spaces that
 * only appear once there is desktop room for them. Each screen supplies its
 * own bordered panel (see RetroContainer), so this stays plain.
 */
export const AppLayout = ({ children }: AppLayoutProps) => {
  const skyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const sky = skyRef.current;
      if (sky === null) return;
      // Push the layer back down by the fraction of scroll it isn't
      // supposed to keep up with, so its net movement is scrollY * speed.
      sky.style.transform = `translateY(${window.scrollY * (1 - SKY_PARALLAX_SPEED)}px)`;
    };
    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="relative isolate flex min-h-dvh w-full flex-col bg-sky-400">
      {/* Two nested wrappers, not one: clipping (overflow-hidden, outer) and
          movement (transform, inner) don't reliably compose on the same box
          across browsers — keeping them on separate elements is what
          actually stops layers past a short page's real height from adding
          scroll. Outer isn't an ancestor of Header either, so it can't also
          become Header's sticky containing block and break it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div ref={skyRef} className="absolute inset-0">
          <div
            className="absolute inset-x-0"
            style={{
              top: SKY_TOTAL_HEIGHT_PX,
              height: SKY_FILL_HEIGHT_PX,
              backgroundColor: PAGE_BOTTOM_COLOR,
            }}
          />

          {SKY_LAYERS.map(({ topPx, tint }) => (
            <div
              key={topPx}
              className="absolute inset-x-0 bg-repeat-x"
              style={{
                top: topPx,
                height: SKY_TILE_HEIGHT_PX,
                backgroundColor: tint,
                maskImage: "url('/sky.png')",
                WebkitMaskImage: "url('/sky.png')",
                maskRepeat: 'repeat-x',
                WebkitMaskRepeat: 'repeat-x',
                imageRendering: 'pixelated',
              }}
            />
          ))}
        </div>
      </div>

      <Header />

      <div className="flex w-full flex-1 justify-center gap-6 p-2 lg:p-8">
        <AdSlot label="AD SPACE" />

        <main className="flex w-full max-w-md flex-col">{children}</main>

        <AdSlot label="AD SPACE" />
      </div>

      <Footer />
    </div>
  );
};
