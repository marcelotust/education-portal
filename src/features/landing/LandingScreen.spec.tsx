import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type * as ReactRouter from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { rememberRoom } from '@/lib/recentRooms';
import { LandingScreen } from './LandingScreen';

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof ReactRouter>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

const renderLanding = (resumableRoom: { pin: string } | null = null) =>
  render(
    <MemoryRouter>
      <LandingScreen resumableRoom={resumableRoom} />
    </MemoryRouter>,
  );

describe('Landing screen', () => {
  beforeEach(() => {
    localStorage.clear();
    navigate.mockClear();
  });

  it('says what EduParty is to somebody who just arrived', () => {
    renderLanding();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/eduparty/i);
    expect(screen.getByText(/4-letter pin/i)).toBeInTheDocument();
    expect(screen.getByText(/100% free/i)).toBeInTheDocument();
    expect(screen.getByText(/online english classes/i)).toBeInTheDocument();
    expect(screen.getByText(/everyone.s invited/i)).toBeInTheDocument();
  });

  it('offers the two ways in', async () => {
    const user = userEvent.setup();
    renderLanding();

    await user.click(screen.getByRole('button', { name: /create a room/i }));
    expect(navigate).toHaveBeenCalledWith('/host');

    await user.click(screen.getByRole('button', { name: /join a room/i }));
    expect(navigate).toHaveBeenCalledWith('/play');
  });

  it('offers to walk back into a room this Host still owns', async () => {
    const user = userEvent.setup();
    renderLanding({ pin: 'KPZT' });

    await user.click(screen.getByRole('button', { name: /resume KPZT/i }));

    expect(navigate).toHaveBeenCalledWith('/host');
  });

  it('titles the resume section and keeps it below the two ways in', () => {
    renderLanding({ pin: 'KPZT' });

    const create = screen.getByRole('button', { name: /create a room/i });
    const join = screen.getByRole('button', { name: /join a room/i });
    const title = screen.getByText(/load your last room/i);
    const resumeButton = screen.getByRole('button', { name: /resume KPZT/i });

    expect(create.compareDocumentPosition(join) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(join.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(
      title.compareDocumentPosition(resumeButton) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('says nothing about resuming when there is no open room', () => {
    renderLanding();

    expect(screen.queryByRole('button', { name: /resume/i })).not.toBeInTheDocument();
  });

  it('lists the rooms this device joined before, most recent first', () => {
    rememberRoom({
      pin: 'AAAA',
      nickname: 'ANA',
      joinedAt: new Date(Date.now() - 60_000).toISOString(),
    });
    rememberRoom({ pin: 'BBBB', nickname: 'ANA', joinedAt: new Date().toISOString() });
    renderLanding();

    const recent = screen.getAllByRole('button', { name: /rejoin/i });
    expect(recent[0]).toHaveAccessibleName(/BBBB/);
    expect(recent[1]).toHaveAccessibleName(/AAAA/);
  });

  it('takes the Player straight back with the PIN already filled', async () => {
    const user = userEvent.setup();
    rememberRoom({ pin: 'KPZT', nickname: 'ANA', joinedAt: new Date().toISOString() });
    renderLanding();

    await user.click(screen.getByRole('button', { name: /rejoin KPZT/i }));

    expect(navigate).toHaveBeenCalledWith('/play?pin=KPZT');
  });

  it('drops a room the server says is gone', () => {
    rememberRoom({ pin: 'DEAD', nickname: 'ANA', joinedAt: new Date().toISOString() });
    rememberRoom({ pin: 'LIVE', nickname: 'ANA', joinedAt: new Date().toISOString() });

    render(
      <MemoryRouter>
        <LandingScreen resumableRoom={null} livePins={['LIVE']} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: /rejoin LIVE/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /rejoin DEAD/i })).not.toBeInTheDocument();
  });

  it('shows the list while the check is still in flight, rather than an empty page', () => {
    rememberRoom({ pin: 'KPZT', nickname: 'ANA', joinedAt: new Date().toISOString() });

    render(
      <MemoryRouter>
        <LandingScreen resumableRoom={null} livePins={null} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: /rejoin KPZT/i })).toBeInTheDocument();
  });

  it('shows no history on a device that never joined anything', () => {
    renderLanding();

    expect(screen.queryByRole('button', { name: /rejoin/i })).not.toBeInTheDocument();
  });

  it('shows off the game library with its real taglines', () => {
    renderLanding();

    expect(screen.getByText('STOP')).toBeInTheDocument();
    expect(screen.getByText(/categories against the clock/i)).toBeInTheDocument();
    expect(screen.getByText('QUIZ')).toBeInTheDocument();
    expect(screen.getByText(/multiple choice, fastest wins/i)).toBeInTheDocument();
    expect(screen.getByText('TABOO')).toBeInTheDocument();
    expect(screen.getByText(/say anything but the word/i)).toBeInTheDocument();
  });

  it('says more cartridges are coming without naming a date', () => {
    renderLanding();

    expect(screen.getByText(/more cartridges/i)).toBeInTheDocument();
  });

  it('places the game library below the two ways in', () => {
    renderLanding();

    const join = screen.getByRole('button', { name: /join a room/i });
    const games = screen.getByText('STOP');

    expect(join.compareDocumentPosition(games) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
