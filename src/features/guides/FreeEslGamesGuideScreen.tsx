import { Link, useNavigate } from 'react-router-dom';

import { PageTitle } from '@/components/ui/PageTitle';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroContainer } from '@/components/ui/RetroContainer';
import { GuideCrossLinks } from './components/GuideCrossLinks';
import { guideBody, guideHeading } from './guideTextStyles';

const linkClasses = 'text-sky-600 underline hover:text-sky-700';

/** The broad, top-of-funnel guide for #149 — an overview linking out to the three per-game guides, not a how-to itself. */
export const FreeEslGamesGuideScreen = () => {
  const navigate = useNavigate();

  return (
    <RetroContainer className="flex flex-col gap-6 p-6">
      <header className="flex flex-col items-center gap-2 text-center">
        <PageTitle tone="royalBlue">FREE ESL GAMES</PageTitle>
        <p className="font-terminal text-lg text-gray-500">
          Built for Zoom and Meet, not a classroom projector
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className={guideHeading}>The problem with most game tools</h2>
        <div className={guideBody}>
          <p>
            Most free ESL games are built for a classroom with a projector or for one student
            playing alone on an app. Neither fits an online lesson: the usual workaround is sharing
            your screen, which kills eye contact, adds lag, and makes it hard to watch the game and
            your student at the same time.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={guideHeading}>What EduParty does instead</h2>
        <div className={guideBody}>
          <p>
            A Host opens a room and gets a 4-letter PIN. Everyone else joins with that PIN from
            their own device — no login, no download. Everyone plays on their own screen, synced
            live, while your video call stays exactly where it already is. No subscription gates the
            games you actually need.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={guideHeading}>Three games, one scoreboard</h2>
        <ul className={guideBody}>
          <li>
            <Link to="/guides/taboo" className={linkClasses}>
              TABOO
            </Link>
            : a clue-giver describes a word without saying it, everyone else guesses. Good for
            speaking practice.
          </li>
          <li>
            <Link to="/guides/stop" className={linkClasses}>
              STOP / Categories
            </Link>
            : fill in a word per category before the clock runs out. Good for vocabulary warm-ups.
          </li>
          <li>
            <Link to="/guides/quiz" className={linkClasses}>
              QUIZ
            </Link>
            : live multiple choice, leveled from A1 to C1. Good for review.
          </li>
        </ul>
        <p className="pt-1 font-terminal text-lg text-gray-700">
          Run any of them back to back in the same room, and the scoreboard keeps a running total
          across all three — nobody has to start over switching games mid-lesson.
        </p>
      </section>

      <div className="flex flex-col gap-3">
        <RetroButton tone="green" onClick={() => void navigate('/host')}>
          CREATE A ROOM
        </RetroButton>
        <RetroButton tone="cyan" onClick={() => void navigate('/play')}>
          JOIN A ROOM
        </RetroButton>
      </div>

      <GuideCrossLinks currentSlug="free-esl-games" />
    </RetroContainer>
  );
};
