import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { GoogleAnalytics } from '@/components/layout/GoogleAnalytics';
import { GuideRoute } from './GuideRoute';

// Lazy: each route pulls in its own gameplay/legal/contact code, and a
// visitor only ever needs one of them on first load. GuideRoute is the
// exception — it's a small dispatcher that lazy-loads each guide screen
// itself (#149), so it's cheap enough to import directly here.
const LandingRoute = lazy(() =>
  import('./LandingRoute').then((m) => ({ default: m.LandingRoute })),
);
const RoomRoute = lazy(() => import('./RoomRoute').then((m) => ({ default: m.RoomRoute })));
const AboutRoute = lazy(() => import('./AboutRoute').then((m) => ({ default: m.AboutRoute })));
const LegalRoute = lazy(() => import('./LegalRoute').then((m) => ({ default: m.LegalRoute })));
const ContactRoute = lazy(() =>
  import('./ContactRoute').then((m) => ({ default: m.ContactRoute })),
);

export const App = () => (
  <BrowserRouter>
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route path="/host" element={<RoomRoute role="HOST" />} />
        <Route path="/play" element={<RoomRoute role="PLAYER" />} />
        <Route path="/about" element={<AboutRoute />} />
        <Route path="/guides/:slug" element={<GuideRoute />} />
        <Route path="/legal" element={<LegalRoute />} />
        <Route path="/contact" element={<ContactRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>

    {/* Vercel telemetry: both are no-ops outside Vercel deployments. */}
    <Analytics />
    <SpeedInsights />
    <GoogleAnalytics />
  </BrowserRouter>
);
