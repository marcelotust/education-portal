import { Link } from 'react-router-dom';

/**
 * Full-bleed platformer horizon: the footer.png ground tile (#89), tall
 * enough on its own to carry the legal/contact links over its dirt half —
 * no separate solid-color band underneath. dirt.dark backs it up as a
 * same-tone fallback for whatever height the tile itself doesn't cover
 * (e.g. text wrapping to two lines on a narrow screen), so the seam never
 * shows. Replaces the old two-band CSS gradient (see #61/#68) with real art.
 */
export const Footer = () => (
  <footer
    className="w-full bg-dirt-dark bg-top bg-repeat-x pb-5 pt-10"
    style={{
      backgroundImage: "url('/footer.png')",
      backgroundSize: '40px 60px',
      imageRendering: 'pixelated',
    }}
  >
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 text-center text-[#d9a266]">
      <Link to="/legal" className="font-terminal text-base underline hover:text-white">
        Terms
      </Link>
      <Link to="/contact" className="font-terminal text-base underline hover:text-white">
        Contact
      </Link>
      <p className="font-terminal text-sm opacity-80">© 2026 EduParty</p>
    </div>
  </footer>
);
