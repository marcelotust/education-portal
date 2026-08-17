import { Link } from 'react-router-dom';

/**
 * Full-bleed platformer horizon: the footer.png ground tile (#89) repeated
 * into a single strip, carrying the legal/contact links every screen ends
 * on. Replaces the old two-band CSS gradient (see #61/#68) with real art.
 */
export const Footer = () => (
  <footer className="w-full">
    <div
      className="h-8 w-full bg-repeat-x"
      style={{
        backgroundImage: "url('/footer.png')",
        backgroundSize: '32px 32px',
        imageRendering: 'pixelated',
      }}
      aria-hidden="true"
    />
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-dirt-dark px-4 py-1.5 text-center text-[#d9a266]">
      <Link to="/legal" className="font-terminal text-sm underline hover:text-white">
        Terms
      </Link>
      <Link to="/contact" className="font-terminal text-sm underline hover:text-white">
        Contact
      </Link>
      <p className="font-terminal text-xs opacity-80">© 2026 EduParty</p>
    </div>
  </footer>
);
