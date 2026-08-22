import { useNavigate } from 'react-router-dom';

import { GameSpriteThumb } from '@/components/ui/GameSpriteThumb';
import { PageTitle } from '@/components/ui/PageTitle';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroContainer } from '@/components/ui/RetroContainer';
import { cartridgeFor } from '@/features/lobby/cartridges';
import { GuideCrossLinks } from './components/GuideCrossLinks';
import { guideBody, guideHeading } from './guideTextStyles';

/** How to play TABOO in EduParty (#149) — search-facing content that also serves as the in-app "How to play" reference linked from the game picker. */
export const TabooGuideScreen = () => {
  const navigate = useNavigate();

  return (
    <RetroContainer className="flex flex-col gap-6 p-6">
      <header className="flex flex-col items-center gap-2 text-center">
        <div className="w-16">
          <GameSpriteThumb
            spritePosition={cartridgeFor('TABOO').spritePosition}
            className="drop-shadow-[3px_5px_4px_rgba(56,26,65,0.55)]"
          />
        </div>
        <PageTitle tone="royalBlue">TABOO</PageTitle>
        <p className="font-terminal text-lg text-gray-500">
          How to play it online for ESL, no sign-up
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className={guideHeading}>What TABOO is</h2>
        <div className={guideBody}>
          <p>
            One player, the clue-giver, has a secret word and a short list of forbidden words they
            can&apos;t use to describe it. Everyone else has to guess the word from the
            clue-giver&apos;s description alone. In EduParty, that&apos;s all played live, inside
            the video call you&apos;re already on.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={guideHeading}>How it works in EduParty</h2>
        <ol className={`${guideBody} list-decimal pl-5`}>
          <li>
            The Host picks TABOO, a few categories (Animals, Movies, Sports, Food, Jobs, Countries),
            and a round length (60, 120, or 180 seconds).
          </li>
          <li>
            The room deals one turn per seated player — everyone gets a turn as clue-giver, in a
            different order each match.
          </li>
          <li>
            Everyone but the clue-giver types their guess. The clock keeps running until it ends or
            everyone has guessed.
          </li>
          <li>
            The Host reviews the guesses before anything is scored. A guess that&apos;s close but
            not exact — a typo, a plural, a different spelling — doesn&apos;t have to score zero;
            the Host decides, and it&apos;s a natural moment to talk about the word with the class.
          </li>
          <li>
            The word is revealed, points land on the scoreboard, and the next clue-giver goes.
          </li>
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={guideHeading}>Why it works for ESL</h2>
        <div className={guideBody}>
          <p>
            Describing a word without saying it is circumlocution — exactly the skill a student
            needs when they blank on a word mid-sentence in real conversation. Because the Host
            reviews every guess before it counts, a near-miss doesn&apos;t punish a student for a
            typing slip, which matters a lot more here than it would in a first-language party game.
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

      <GuideCrossLinks currentSlug="taboo" />
    </RetroContainer>
  );
};
