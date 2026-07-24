import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { RoomRoute } from './RoomRoute';

export const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/host" replace />} />
      <Route path="/host" element={<RoomRoute role="HOST" />} />
      <Route path="/play" element={<RoomRoute role="CLIENT" />} />
      <Route path="*" element={<Navigate to="/host" replace />} />
    </Routes>

    {/* Vercel telemetry: both are no-ops outside Vercel deployments. */}
    <Analytics />
    <SpeedInsights />
  </BrowserRouter>
);
