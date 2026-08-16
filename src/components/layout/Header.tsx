import { Link } from 'react-router-dom';

/** Persistent brand mark at the top of every screen, linking back to the front door. */
export const Header = () => (
  <header className="sticky top-0 z-20 flex w-full justify-center bg-sky-400 p-4">
    <Link to="/">
      <img src="/logo.png" alt="EduParty" width={485} height={95} className="h-8 w-auto sm:h-10" />
    </Link>
  </header>
);
