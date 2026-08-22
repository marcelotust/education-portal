import { Link, useNavigate } from 'react-router-dom';

import { PageTitle } from '@/components/ui/PageTitle';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroContainer } from '@/components/ui/RetroContainer';
import { GuideCrossLinks } from './components/GuideCrossLinks';
import { guideBody, guideHeading } from './guideTextStyles';

const linkClasses = 'text-sky-600 underline hover:text-sky-700';

/** SEO-only guide for #149: which EduParty game fits a short warm-up, and how to keep it tight. */
export const WarmUpGuideScreen = () => {
  const navigate = useNavigate();

  return (
    <RetroContainer className="flex flex-col gap-6 p-6">
      <header className="flex flex-col items-center gap-2 text-center">
        <PageTitle tone="royalBlue">WARM-UPS</PageTitle>
        <p className="font-terminal text-lg text-gray-500">
          Free icebreaker games for the first five minutes
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className={guideHeading}>Why a warm-up matters</h2>
        <div className={guideBody}>
          <p>
            The first few minutes of an online lesson are usually the quietest — a student is still
            settling in, and switching straight into a drill rarely goes well. A short game gets
            them talking before the actual lesson content starts, and does it without needing to
            share your screen.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={guideHeading}>Which game to pick</h2>
        <ul className={guideBody}>
          <li>
            <Link to="/guides/stop" className={linkClasses}>
              STOP / Categories
            </Link>
            : the fastest fit. A 30 or 60 second round gets everyone recalling vocabulary right
            away.
          </li>
          <li>
            <Link to="/guides/quiz" className={linkClasses}>
              QUIZ
            </Link>
            : set it to 3 questions and a short timer for a quick review before moving on.
          </li>
          <li>
            <Link to="/guides/taboo" className={linkClasses}>
              TABOO
            </Link>
            : works better as a main activity than a warm-up — one turn per player takes longer than
            the other two.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={guideHeading}>Keeping it tight</h2>
        <div className={guideBody}>
          <p>
            Pick the shortest round length the setup offers, keep the category or question count
            small, and treat the warm-up as done once the scoreboard shows. The room stays open, so
            the real lesson activity can follow in the same call without resetting anything.
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-3">
        <RetroButton tone="green" onClick={() => void navigate('/host')}>
          CREATE A ROOM
        </RetroButton>
        <RetroButton tone="cyan" onClick={() => void navigate('/play')}>
          JOIN A ROOM
        </RetroButton>
      </div>

      <GuideCrossLinks currentSlug="warm-up-icebreakers" />
    </RetroContainer>
  );
};
