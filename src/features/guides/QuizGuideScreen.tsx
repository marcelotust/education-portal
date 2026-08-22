import { useNavigate } from 'react-router-dom';

import { GameSpriteThumb } from '@/components/ui/GameSpriteThumb';
import { PageTitle } from '@/components/ui/PageTitle';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroContainer } from '@/components/ui/RetroContainer';
import { cartridgeFor } from '@/features/lobby/cartridges';
import { GuideCrossLinks } from './components/GuideCrossLinks';
import { guideBody, guideHeading } from './guideTextStyles';

/** How to play QUIZ in EduParty (#149). */
export const QuizGuideScreen = () => {
  const navigate = useNavigate();

  return (
    <RetroContainer className="flex flex-col gap-6 p-6">
      <header className="flex flex-col items-center gap-2 text-center">
        <div className="w-16">
          <GameSpriteThumb
            spritePosition={cartridgeFor('QUIZ').spritePosition}
            className="drop-shadow-[3px_5px_4px_rgba(56,26,65,0.55)]"
          />
        </div>
        <PageTitle tone="royalBlue">QUIZ</PageTitle>
        <p className="font-terminal text-lg text-gray-500">
          Multiple choice, live, levels A1 to C1
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className={guideHeading}>What QUIZ is</h2>
        <div className={guideBody}>
          <p>
            A live multiple-choice round: everyone sees the same question at the same time and picks
            an answer before the clock runs out. Whoever answers correctly and fastest earns the
            most points.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={guideHeading}>How it works in EduParty</h2>
        <ol className={`${guideBody} list-decimal pl-5`}>
          <li>
            The Host picks a topic — ENGLISH at A1/A2, B1/B2, or C1/C2, or a general-knowledge topic
            — plus how many questions (3, 5, or 10) and how long each one runs.
          </li>
          <li>Every seated player answers the same question at once, right on their own screen.</li>
          <li>
            A correct answer is worth 10 points; whoever answered it fastest gets a 5-point bonus on
            top.
          </li>
          <li>
            The reveal shows the right answer and who picked what — no Host review needed here, a
            multiple-choice answer is either right or it isn&apos;t.
          </li>
          <li>Next question, then the final scoreboard once the set is done.</li>
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={guideHeading}>Why it works for ESL</h2>
        <div className={guideBody}>
          <p>
            The ENGLISH topics are leveled, not generic trivia repurposed for language learners, so
            the questions actually match what a class at that level should know. The pace keeps
            energy up, which makes it a solid way to review or wrap up a lesson.
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

      <GuideCrossLinks currentSlug="quiz" />
    </RetroContainer>
  );
};
