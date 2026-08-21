import { useNavigate } from 'react-router-dom';

import { PageTitle } from '@/components/ui/PageTitle';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroContainer } from '@/components/ui/RetroContainer';

// Same "on the open sky background" placement as LandingScreen's hero, so
// `text-ink` (not the panel-tuned text-gray-700 Legal/Contact use) is what
// stays readable against bg-sky-400. The page scrolls well into the sky's
// dustier purple tints (see SKY_TINTS in AppLayout.tsx) — a thin white
// shadow keeps these small headings crisp there, the same hard-edge
// white-at-half-opacity technique the header logo already uses at 2px
// (Header.tsx), just 1px given how small this text is.
const textShadow = '[text-shadow:1px_1px_0_rgba(255,255,255,0.5)]';
const heading = `font-arcade text-[11px] uppercase tracking-[0.3em] text-ink ${textShadow}`;
const body = 'flex flex-col gap-3 font-terminal text-lg text-ink/90';

/**
 * The maker's own story and the product's differentiators (#152), not a
 * feature list — why EduParty exists, in Marcelo's voice, followed by what
 * makes it different from a Kahoot/Quizizz-shaped tool. Text sits directly
 * on the page background like the landing hero; only the CTAs are boxed.
 */
export const AboutScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col items-center gap-2 text-center">
        <PageTitle>ABOUT</PageTitle>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className={heading}>Why EduParty exists 🎮</h2>
        <div className={body}>
          <p>
            I&apos;m a Software Engineer 👨‍💻 and an Indie Maker 🛠️. I&apos;ve been studying English
            through online classes for many years, and from that seat, as a student, I kept noticing
            the same thing: the games and sites teachers use in class are almost never built for this
            environment. They&apos;re built for a classroom with a projector, or for a student
            sitting alone with an app, not for two or three people on a video call trying to keep a
            lesson moving.
          </p>
          <p>
            A game that fits that environment does more than fill time. It brings students a sense of
            calm 🙂 during a video call, and it gives the teacher room to pause and actually discuss
            an answer instead of racing to the next question.
          </p>
          <p>
            I also noticed the harder problem underneath it: in Brazil 🇧🇷, a lot of teachers
            can&apos;t justify paying for a more sophisticated subscription service, and the free ESL
            portals that are left often sit with the same content for years without an update.
          </p>
          <p>
            So I built the tool I wished existed as a student. EduParty runs right inside the call, no
            screen to share, no subscription to unlock the games you actually need.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={heading}>What makes it different ✨</h2>
        <ul className={body}>
          <li>
            🚫🖥️ <strong className={textShadow}>No screen-share, ever.</strong> Everyone plays on their own screen, synced
            live, while the video call stays exactly where it already is.
          </li>
          <li>
            🏆 <strong className={textShadow}>One scoreboard across every game.</strong> Run a warm-up, a vocabulary quiz,
            and a speaking game in the same lesson, all counting toward the same running score.
            Switch games without starting over.
          </li>
          <li>
            ✅ <strong className={textShadow}>A validation step, not just auto-grading.</strong> A near-miss answer (a typo,
            a plural, a different spelling) doesn&apos;t have to score zero. The Host reviews it, and
            that moment becomes a chance to actually talk about the answer with the class.
          </li>
          <li>
            📚 <strong className={textShadow}>Content built for ESL, kept current.</strong> TABOO is designed for
            circumlocution and speaking practice, not repurposed trivia. QUIZ has levels from A1 to
            C1. New content keeps shipping, it doesn&apos;t sit still.
          </li>
          <li>
            👾 <strong className={textShadow}>Looks like a game, not a dashboard.</strong> Real 16-bit arcade style, thick
            borders, chunky pixel fonts. Something worth opening, not one more gray tool to sit
            through.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={heading}>The name 🍎</h2>
        <div className={body}>
          <p>
            EduParty is also a small tribute. My nephew Eduardo is 10 years old and a great student in
            his own online English classes, he&apos;s part of why I noticed any of this in the first
            place.
          </p>
        </div>
      </section>

      <RetroContainer className="flex flex-col gap-3 p-6">
        <RetroButton tone="green" onClick={() => void navigate('/host')}>
          CREATE A ROOM
        </RetroButton>
        <RetroButton tone="cyan" onClick={() => void navigate('/play')}>
          JOIN A ROOM
        </RetroButton>
        <RetroButton tone="white" onClick={() => void navigate('/')}>
          BACK
        </RetroButton>
      </RetroContainer>
    </div>
  );
};
