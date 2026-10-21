import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { GameCartridgePicker } from './GameCartridgePicker';

const renderPicker = (props: Parameters<typeof GameCartridgePicker>[0]) =>
  render(
    <MemoryRouter>
      <GameCartridgePicker {...props} />
    </MemoryRouter>,
  );

const card = (name: RegExp) => screen.getByRole('button', { name });

describe('GameCartridgePicker play-mode tags', () => {
  it('tells the Host which games can be played alone and which need people', () => {
    renderPicker({ selectedGameId: null, onSelect: vi.fn() });

    expect(within(card(/^stop$/i)).getByText('SOLO OK')).toBeInTheDocument();
    expect(within(card(/^quiz$/i)).getByText('NEEDS PLAYERS')).toBeInTheDocument();
    expect(within(card(/^taboo$/i)).getByText('NEEDS PLAYERS')).toBeInTheDocument();
  });

  it('keeps the tags off the read-only shelf a Player sees', () => {
    renderPicker({ selectedGameId: null });

    expect(screen.queryByText('SOLO OK')).not.toBeInTheDocument();
    expect(screen.queryByText('NEEDS PLAYERS')).not.toBeInTheDocument();
  });

  it('marks the cards that cannot start yet when the Host is alone, but keeps them selectable', () => {
    const onSelect = vi.fn();
    renderPicker({ selectedGameId: null, onSelect, isAlone: true });

    expect(card(/^taboo$/i)).toHaveAttribute('data-needs-players', 'true');
    expect(card(/^taboo$/i)).toBeEnabled();
    expect(card(/^stop$/i)).not.toHaveAttribute('data-needs-players');
  });

  it('marks nothing once someone else is in the room', () => {
    renderPicker({ selectedGameId: null, onSelect: vi.fn(), isAlone: false });

    expect(card(/^taboo$/i)).not.toHaveAttribute('data-needs-players');
  });
});
