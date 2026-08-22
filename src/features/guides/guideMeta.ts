import type { GameId } from '@/types';

export interface GuideMeta {
  slug: string;
  /** Document `<title>` and page heading. */
  title: string;
  /** Meta description for search/social previews. */
  description: string;
  /** Short label used in cross-link lists. */
  navLabel: string;
  /** Set only for the three per-game guides — drives the picker's CTA (#149). */
  gameId?: GameId;
}

/**
 * The content-page catalog for #149: three per-game guides (also linked
 * in-app, not just for search) plus two broader SEO-only pages. Slugs are
 * routed at `/guides/:slug` (GuideRoute.tsx); this file stays free of the
 * screens' actual JSX so anything that only needs metadata (About's link
 * list, the picker's CTA, the sitemap) doesn't pull in every guide's code.
 */
export const GUIDES: readonly GuideMeta[] = [
  {
    slug: 'taboo',
    title: 'How to Play TABOO Online for ESL Classes',
    description:
      'How to run a TABOO round in EduParty for online English classes: the rules, why it works for speaking practice, and how to start one in under a minute.',
    navLabel: 'How to play TABOO',
    gameId: 'TABOO',
  },
  {
    slug: 'stop',
    title: 'STOP / Categories Game for ESL — No Sign-Up',
    description:
      'How to play STOP (Categories) in EduParty: a fast vocabulary-recall game for online English classes, free and with no sign-up.',
    navLabel: 'How to play STOP',
    gameId: 'STOP',
  },
  {
    slug: 'quiz',
    title: 'Multiplayer QUIZ Game for English Class',
    description:
      'How to run a QUIZ round in EduParty: live multiple-choice English practice from A1 to C1, scored for correctness and speed.',
    navLabel: 'How to play QUIZ',
    gameId: 'QUIZ',
  },
  {
    slug: 'free-esl-games',
    title: 'Free ESL Games for Zoom and Google Meet Classes',
    description:
      'Free, no-signup multiplayer games built for online English classes — no screen to share, just a PIN and the video call you already have open.',
    navLabel: 'Free ESL games, an overview',
  },
  {
    slug: 'warm-up-icebreakers',
    title: 'ESL Warm-Up and Icebreaker Games, Free and Online',
    description:
      'Free online warm-up and icebreaker games for the first few minutes of an ESL class, played live inside the video call.',
    navLabel: 'Warm-up & icebreaker games',
  },
];

export const findGuide = (slug: string): GuideMeta | undefined =>
  GUIDES.find((guide) => guide.slug === slug);

export const guideForGame = (gameId: GameId): GuideMeta | undefined =>
  GUIDES.find((guide) => guide.gameId === gameId);
