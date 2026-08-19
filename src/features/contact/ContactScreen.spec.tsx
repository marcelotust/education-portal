import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type * as ReactRouter from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { ContactScreen } from './ContactScreen';

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof ReactRouter>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

const renderContact = (
  submitFeedback = vi.fn().mockResolvedValue(undefined),
  initialEntries: string[] = ['/contact'],
) => {
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <ContactScreen submitFeedback={submitFeedback} />
    </MemoryRouter>,
  );
  return { submitFeedback };
};

describe('Contact screen', () => {
  it('offers the three feedback categories, none selected at first', () => {
    renderContact();

    expect(screen.getByRole('button', { name: /suggestion/i, pressed: false })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /new game request/i, pressed: false }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bug report/i, pressed: false })).toBeInTheDocument();
  });

  it('refuses to submit without a category', async () => {
    const user = userEvent.setup();
    const { submitFeedback } = renderContact();

    await user.type(screen.getByLabelText(/message/i), 'Please add a memory game.');
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/pick a category/i);
    expect(submitFeedback).not.toHaveBeenCalled();
  });

  it('refuses to submit a blank message', async () => {
    const user = userEvent.setup();
    const { submitFeedback } = renderContact();

    await user.click(screen.getByRole('button', { name: /suggestion/i }));
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/type a message/i);
    expect(submitFeedback).not.toHaveBeenCalled();
  });

  it('submits the chosen category and message, then shows a thank-you', async () => {
    const user = userEvent.setup();
    const { submitFeedback } = renderContact();

    await user.click(screen.getByRole('button', { name: /bug report/i }));
    await user.type(screen.getByLabelText(/message/i), 'The countdown gets stuck sometimes.');
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(submitFeedback).toHaveBeenCalledWith('BUG', 'The countdown gets stuck sometimes.');
    expect(await screen.findByText(/thanks/i)).toBeInTheDocument();
  });

  it('shows an error and keeps the form if the submission fails', async () => {
    const user = userEvent.setup();
    renderContact(vi.fn().mockRejectedValue(new Error('network down')));

    await user.click(screen.getByRole('button', { name: /suggestion/i }));
    await user.type(screen.getByLabelText(/message/i), 'More cartridges please.');
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not send/i);
    expect(screen.getByLabelText(/message/i)).toHaveValue('More cartridges please.');
  });

  it('fakes success without submitting when the honeypot field is filled', async () => {
    const user = userEvent.setup();
    const { submitFeedback } = renderContact();

    await user.click(screen.getByRole('button', { name: /bug report/i }));
    await user.type(screen.getByLabelText(/message/i), 'The countdown gets stuck sometimes.');
    // A sighted/keyboard user never reaches this field — only a bot filling
    // every input it finds would put something here.
    await user.type(screen.getByTestId('company-website-honeypot'), 'https://spam.example');
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(submitFeedback).not.toHaveBeenCalled();
    expect(await screen.findByText(/thanks/i)).toBeInTheDocument();
  });

  it('preselects the category a link asked for', () => {
    renderContact(vi.fn(), ['/contact?category=GAME_REQUEST']);

    expect(
      screen.getByRole('button', { name: /new game request/i, pressed: true }),
    ).toBeInTheDocument();
  });

  it('ignores an unrecognized category in the URL', () => {
    renderContact(vi.fn(), ['/contact?category=NOT_A_REAL_CATEGORY']);

    expect(screen.getByRole('button', { name: /suggestion/i, pressed: false })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /new game request/i, pressed: false }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bug report/i, pressed: false })).toBeInTheDocument();
  });

  it('takes you back to the landing page', async () => {
    const user = userEvent.setup();
    renderContact();

    await user.click(screen.getByRole('button', { name: /back/i }));

    expect(navigate).toHaveBeenCalledWith('/');
  });
});
