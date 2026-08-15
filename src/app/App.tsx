import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

// Lazy: each route pulls in its own gameplay/legal/contact code, and a
// visitor only ever needs one of them on first load.
const LandingRoute = lazy(() =>
  import('./LandingRoute').then((m) => ({ default: m.LandingRoute })),
);
const RoomRoute = lazy(() => import('./RoomRoute').then((m) => ({ default: m.RoomRoute })));
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
        <Route path="/legal" element={<LegalRoute />} />
        <Route path="/contact" element={<ContactRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>

    {/* Vercel telemetry: both are no-ops outside Vercel deployments. */}
    <Analytics />
    <SpeedInsights />
  </BrowserRouter>
);
