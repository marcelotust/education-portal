import { useNavigate } from 'react-router-dom';

import { PageTitle } from '@/components/ui/PageTitle';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroContainer } from '@/components/ui/RetroContainer';

const heading = 'font-arcade text-[11px] uppercase tracking-[0.3em] text-gray-700';
const body = 'flex flex-col gap-2 font-terminal text-lg text-gray-700';

/**
 * The legal home for the app: a plain-language Privacy Policy, Terms of
 * Service, and a Children's Privacy Notice, each anchored so the landing
 * footer can link straight to a section. Not a substitute for real legal
 * review — it describes what the app actually does today (see CLAUDE.md's
 * backend model), not what a lawyer would want it to say.
 */
export const LegalScreen = () => {
  const navigate = useNavigate();

  return (
    <RetroContainer className="flex flex-col gap-6 p-6">
      <header className="flex flex-col items-center gap-2 text-center">
        <PageTitle>LEGAL</PageTitle>
        <p className="font-terminal text-lg text-gray-500">© 2026 EduParty</p>
      </header>

      <p className="font-terminal text-sm text-gray-500">
        This is a plain-language summary of how EduParty actually works, not legal advice. If you
        need this reviewed for a specific school or district, talk to a lawyer before relying on it.
      </p>

      <section id="privacy" className="flex flex-col gap-3">
        <h2 className={heading}>Privacy Policy</h2>
        <div className={body}>
          <p>
            EduParty does not ask for an account, an email address, or a real name. Joining a room
            creates an anonymous Supabase session, kept in your browser&apos;s localStorage so
            refreshing the page does not lose your identity or score. Two tabs in the same browser
            share that one session.
          </p>
          <p>
            While a room is open, we store the nickname and avatar you chose, your seat, and your
            score on the room itself. That data lives only as long as the room does: rooms untouched
            for 5 hours are deleted automatically.
          </p>
          <p>
            Your browser also remembers, locally, the PINs and nicknames of rooms you have joined
            recently, so the landing page can offer to reopen them. That list never leaves your
            device and is not something we can read.
          </p>
          <p>
            We use Vercel Analytics and Speed Insights to see how the app performs; both report
            anonymized usage and performance data, not anything tied to a nickname or a room. The ad
            spaces you may see in the layout are placeholders — no ad network runs today, and this
            policy will be updated before one does.
          </p>
        </div>
      </section>

      <section id="terms" className="flex flex-col gap-3">
        <h2 className={heading}>Terms of Service</h2>
        <div className={body}>
          <p>
            EduParty is provided as-is, free to use, for running games in a classroom or similar
            group setting. There is no uptime guarantee and no warranty — a room can be lost to a
            connection drop, a browser refresh past the resume window, or the 5-hour expiry.
          </p>
          <p>
            Whoever creates a room (the Host) is responsible for what happens in it: who is invited,
            what nicknames are allowed, and how content from the games is used. Don&apos;t use a
            room&apos;s PIN to disrupt a game you were not invited to.
          </p>
          <p>
            These terms may change as the app changes. Continuing to use EduParty after a change
            means you accept the current version.
          </p>
        </div>
      </section>

      <section id="children" className="flex flex-col gap-3">
        <h2 className={heading}>Children&apos;s Privacy Notice</h2>
        <div className={body}>
          <p>
            EduParty is built for classrooms, so a meaningful share of Players are minors joining a
            room a Host set up for them. We do not knowingly collect more than an anonymous session
            and a nickname the Player types in — no email, no real name, no date of birth, and no
            account.
          </p>
          <p>
            Educators: ask players to use a nickname rather than a real name. Because room data is
            deleted 5 hours after the room goes quiet, there is nothing to separately request
            removed — it expires on its own.
          </p>
          <p>
            No advertising runs today. If that changes, this notice will be updated first, and any
            ads shown to rooms with minors will be treated as child-directed under COPPA and similar
            rules elsewhere.
          </p>
        </div>
      </section>

      <RetroButton tone="cyan" onClick={() => void navigate('/')}>
        BACK
      </RetroButton>
    </RetroContainer>
  );
};
