import { Link } from 'react-router-dom';

/**
 * Full-bleed platformer horizon: a grass strip over a dirt band, carrying
 * the legal/contact links every screen ends on.
 */
export const Footer = () => (
  <footer className="w-full">
    <div className="bg-grass-band h-4 w-full border-y-4 border-ink" aria-hidden="true" />
    <div className="bg-dirt-band flex flex-col items-center gap-2 border-b-4 border-ink px-4 py-4 text-center">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <Link
          to="/legal#privacy"
          className="font-terminal text-sm text-amber-50 underline hover:text-white"
        >
          Privacy Policy
        </Link>
        <Link
          to="/legal#terms"
          className="font-terminal text-sm text-amber-50 underline hover:text-white"
        >
          Terms of Service
        </Link>
        <Link
          to="/legal#children"
          className="font-terminal text-sm text-amber-50 underline hover:text-white"
        >
          Children&apos;s Privacy
        </Link>
        <Link
          to="/contact"
          className="font-terminal text-sm text-amber-50 underline hover:text-white"
        >
          Suggestions &amp; Bug Reports
        </Link>
      </div>
      <p className="font-terminal text-xs text-amber-100/80">© 2026 EduParty</p>
    </div>
  </footer>
);
