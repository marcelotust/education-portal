import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { LandingRoute } from './LandingRoute';
import { RoomRoute } from './RoomRoute';

export const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingRoute />} />
      <Route path="/host" element={<RoomRoute role="HOST" />} />
      <Route path="/play" element={<RoomRoute role="PLAYER" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>

    {/* Vercel telemetry: both are no-ops outside Vercel deployments. */}
    <Analytics />
    <SpeedInsights />
  </BrowserRouter>
);
