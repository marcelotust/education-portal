import { Link } from 'react-router-dom';

/**
 * Full-bleed platformer horizon: the footer2.png ground tile (#89) IS the
 * footer — its own dirt half carries the legal/contact links, and the
 * footer's total height is exactly the tile's, no padding-driven band
 * underneath it. Replaces the old two-band CSS gradient (see #61/#68)
 * with real art.
 */
export const Footer = () => (
  <footer
    className="flex h-[65px] w-full items-center justify-center bg-top bg-repeat-x"
    style={{
      backgroundImage: "url('/footer2.png')",
      backgroundSize: '48px 65px',
      imageRendering: 'pixelated',
    }}
  >
    <div className="flex translate-y-2.5 flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 text-center text-white/80">
      <Link to="/legal" className="font-terminal text-base underline hover:text-white">
        Terms
      </Link>
      <Link to="/contact" className="font-terminal text-base underline hover:text-white">
        Contact
      </Link>
      <p className="font-terminal text-sm font-bold">© 2026 EduParty</p>
    </div>
  </footer>
);
