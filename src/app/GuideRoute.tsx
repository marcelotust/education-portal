import { lazy, Suspense, type ComponentType } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import { AppLayout } from '@/components/layout/AppLayout';
import { findGuide } from '@/features/guides/guideMeta';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

const TabooGuideScreen = lazy(() =>
  import('@/features/guides/TabooGuideScreen').then((m) => ({ default: m.TabooGuideScreen })),
);
const StopGuideScreen = lazy(() =>
  import('@/features/guides/StopGuideScreen').then((m) => ({ default: m.StopGuideScreen })),
);
const QuizGuideScreen = lazy(() =>
  import('@/features/guides/QuizGuideScreen').then((m) => ({ default: m.QuizGuideScreen })),
);
const FreeEslGamesGuideScreen = lazy(() =>
  import('@/features/guides/FreeEslGamesGuideScreen').then((m) => ({
    default: m.FreeEslGamesGuideScreen,
  })),
);
const WarmUpGuideScreen = lazy(() =>
  import('@/features/guides/WarmUpGuideScreen').then((m) => ({ default: m.WarmUpGuideScreen })),
);

const SCREEN_BY_SLUG: Record<string, ComponentType> = {
  taboo: TabooGuideScreen,
  stop: StopGuideScreen,
  quiz: QuizGuideScreen,
  'free-esl-games': FreeEslGamesGuideScreen,
  'warm-up-icebreakers': WarmUpGuideScreen,
};

/**
 * Resolves `/guides/:slug` to its screen and meta (#149) — one dynamic
 * route backed by the guideMeta registry, instead of five near-identical
 * XRoute.tsx files. An unknown slug (or none) bounces to the front door,
 * same as the app's other unmatched-path fallback.
 */
export const GuideRoute = () => {
  const { slug } = useParams<{ slug: string }>();
  const guide = slug === undefined ? undefined : findGuide(slug);

  useDocumentMeta({
    title: guide === undefined ? 'EduParty' : `EduParty — ${guide.title}`,
    description: guide?.description ?? '',
  });

  const Screen = slug === undefined ? undefined : SCREEN_BY_SLUG[slug];
  if (guide === undefined || Screen === undefined) return <Navigate to="/" replace />;

  return (
    <AppLayout>
      <Suspense fallback={null}>
        <Screen />
      </Suspense>
    </AppLayout>
  );
};
