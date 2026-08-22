import { useNavigate } from 'react-router-dom';

import { GameSpriteThumb } from '@/components/ui/GameSpriteThumb';
import { PageTitle } from '@/components/ui/PageTitle';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroContainer } from '@/components/ui/RetroContainer';
import { cartridgeFor } from '@/features/lobby/cartridges';
import { GuideCrossLinks } from './components/GuideCrossLinks';
import { guideBody, guideHeading } from './guideTextStyles';

/** How to play STOP (Categories) in EduParty (#149). */
export const StopGuideScreen = () => {
  const navigate = useNavigate();

  return (
    <RetroContainer className="flex flex-col gap-6 p-6">
      <header className="flex flex-col items-center gap-2 text-center">
        <div className="w-16">
          <GameSpriteThumb
            spritePosition={cartridgeFor('STOP').spritePosition}
            className="drop-shadow-[3px_5px_4px_rgba(56,26,65,0.55)]"
          />
        </div>
        <PageTitle tone="royalBlue">STOP</PageTitle>
        <p className="font-terminal text-lg text-gray-500">
          Categories against the clock, free and fast
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className={guideHeading}>What STOP is</h2>
        <div className={guideBody}>
          <p>
            Also known as Categories or Scattergories: everyone gets a letter and a shared list of
            categories, and races to write one word starting with that letter for each category
            before time runs out.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={guideHeading}>How it works in EduParty</h2>
        <ol className={`${guideBody} list-decimal pl-5`}>
          <li>
            The Host picks at least four categories and a round length, from 30 to 120 seconds.
          </li>
          <li>
            Everyone gets the same letter and types privately into their own categories — nobody
            sees anyone else&apos;s answers yet.
          </li>
          <li>
            Whoever fills every category first can call STOP, which pulls the deadline in for
            everyone instead of ending the round on the spot.
          </li>
          <li>
            The Host reviews every answer. A word shared with another player is worth 5 points; a
            unique one is worth 10 — the classic STOP scoring, done live.
          </li>
          <li>Confirm scores, and the running total carries over even into the next game.</li>
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={guideHeading}>Why it works for ESL</h2>
        <div className={guideBody}>
          <p>
            It puts real recall pressure on vocabulary without needing a full sentence, which makes
            it a good warm-up or a change of pace between drills. Because the Host reviews every
            answer before it scores, a reasonable spelling variant doesn&apos;t have to be marked
            wrong.
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

      <GuideCrossLinks currentSlug="stop" />
    </RetroContainer>
  );
};
