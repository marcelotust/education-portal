import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { GuideRoute } from './GuideRoute';

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<div>HOME</div>} />
        <Route path="/guides/:slug" element={<GuideRoute />} />
      </Routes>
    </MemoryRouter>,
  );

describe('GuideRoute', () => {
  it('resolves a known slug to that guide, lazy-loaded', async () => {
    renderAt('/guides/taboo');

    expect(await screen.findByRole('heading', { name: /^taboo$/i })).toBeInTheDocument();
  });

  it('resolves each of the five known slugs', async () => {
    for (const [path, headingName] of [
      ['/guides/stop', /^stop$/i],
      ['/guides/quiz', /^quiz$/i],
      ['/guides/free-esl-games', /free esl games/i],
      ['/guides/warm-up-icebreakers', /warm-ups/i],
    ] as const) {
      const { unmount } = renderAt(path);
      expect(await screen.findByRole('heading', { name: headingName })).toBeInTheDocument();
      unmount();
    }
  });

  it('sends an unknown slug back to the front door instead of a blank page', async () => {
    renderAt('/guides/not-a-real-guide');

    expect(await screen.findByText('HOME')).toBeInTheDocument();
  });
});
