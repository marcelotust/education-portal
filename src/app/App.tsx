import { Analytics } from '@vercel/analytics/react';
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

    {/* Vercel Web Analytics: no-op outside Vercel deployments. */}
    <Analytics />
  </BrowserRouter>
);
