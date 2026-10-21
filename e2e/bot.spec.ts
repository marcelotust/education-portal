import { expect, test } from '@playwright/test';

import { createRoom, deleteCreatedRooms, joinRoom, openParticipant } from './helpers.ts';

test.afterAll(async () => {
  await deleteCreatedRooms();
});

test.describe('the bot and solo STOP on the real transports (#155, #156)', () => {
  test('a Player sees the seat the Host gives the bot', async ({ browser }) => {
    const host = await openParticipant(browser);
    const player = await openParticipant(browser);

    const pin = await createRoom(host.page);
    await joinRoom(player.page, pin);
    await host.page.getByRole('button', { name: 'ADD BOT' }).click();

    // Seats: Host, Player, then the bot.
    await expect(player.page.getByTestId('player-slot-2')).toContainText('BOT');
    await expect(host.page.getByTestId('player-slot-2')).toContainText('BOT');

    await host.context.close();
    await player.context.close();
  });

  test('the bot answers a QUIZ question on its own, and both screens agree', async ({
    browser,
  }) => {
    const host = await openParticipant(browser);
    const player = await openParticipant(browser);

    const pin = await createRoom(host.page);
    await joinRoom(player.page, pin);
    await host.page.getByRole('button', { name: 'ADD BOT' }).click();

    await host.page.getByRole('button', { name: 'SELECT GAME' }).click();
    await host.page.getByRole('button', { name: 'QUIZ' }).click();
    await host.page.getByRole('button', { name: 'START GAME' }).click();

    await expect(host.page.getByTestId('question-progress')).toHaveText('1/5', { timeout: 30_000 });

    // Nobody clicks. Once the question closes, the bot must be among the voters
    // (a list nested inside an option), not just in the standings.
    const botVote = (page: typeof host.page) => page.locator('li li').filter({ hasText: /^BOT$/ });
    await expect(botVote(host.page)).toBeVisible({ timeout: 60_000 });
    await expect(botVote(player.page)).toBeVisible({ timeout: 30_000 });

    await host.context.close();
    await player.context.close();
  });

  test('a Host with nobody else can start STOP, but not the games that need company', async ({
    browser,
  }) => {
    const host = await openParticipant(browser);
    await createRoom(host.page);

    await host.page.getByRole('button', { name: 'SELECT GAME' }).click();
    const start = host.page.getByRole('button', { name: 'START GAME' });

    await host.page.getByRole('button', { name: 'QUIZ' }).click();
    await expect(start).toBeDisabled();
    await expect(host.page.getByText(/quiz needs a real player or a bot/i)).toBeVisible();

    await host.page.getByRole('button', { name: 'TABOO' }).click();
    await expect(start).toBeDisabled();

    await host.page.getByRole('button', { name: 'STOP' }).click();
    await expect(start).toBeEnabled();
    await start.click();

    await expect(host.page.getByTestId('ad-countdown')).toBeVisible();
    await expect(host.page.getByTestId('ad-countdown')).toBeHidden({ timeout: 30_000 });

    await host.context.close();
  });
});
