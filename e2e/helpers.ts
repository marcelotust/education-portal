import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { expect, type Browser, type BrowserContext, type Page } from '@playwright/test';

const run = promisify(execFile);

/** PINs of the rooms a run created, so cleanup never touches anyone else's. */
const createdPins = new Set<string>();

export interface Participant {
  context: BrowserContext;
  page: Page;
}

/** A separate context has its own localStorage, hence its own anonymous identity. */
export const openParticipant = async (browser: Browser): Promise<Participant> => {
  const context = await browser.newContext();
  return { context, page: await context.newPage() };
};

/** Creates a room as the Host and returns its PIN. */
export const createRoom = async (page: Page, nickname = 'HOSTY'): Promise<string> => {
  await page.goto('/host');
  await page.getByRole('textbox', { name: 'Nickname' }).fill(nickname);
  await page.getByRole('button', { name: 'CREATE ROOM' }).click();

  await expect(page.getByRole('heading', { name: 'LOBBY' })).toBeVisible();
  const pin =
    (await page
      .locator('p')
      .filter({ hasText: /^[A-Z]{4}$/ })
      .first()
      .textContent()) ?? '';
  expect(pin).toMatch(/^[A-Z]{4}$/);

  createdPins.add(pin);
  return pin;
};

/** Joins a room by PIN as a Player. */
export const joinRoom = async (page: Page, pin: string, nickname = 'PLAYA'): Promise<void> => {
  await page.goto('/play');
  // One box per letter: type into the first and the rest follow.
  await page.getByRole('textbox', { name: 'Room PIN letter 1' }).pressSequentially(pin);
  await page.getByRole('textbox', { name: 'Nickname' }).fill(nickname);
  await page.getByRole('button', { name: 'JOIN' }).click();

  await expect(page.getByRole('heading', { name: 'LOBBY' })).toBeVisible();
};

/**
 * Best-effort cleanup of only the rooms this run created. Needs the Supabase
 * CLI logged in; rooms expire after 5 hours anyway (ADR 0004).
 */
export const deleteCreatedRooms = async (): Promise<void> => {
  const pins = [...createdPins].filter((pin) => /^[A-Z]{4}$/.test(pin));
  createdPins.clear();
  if (pins.length === 0) return;

  const list = pins.map((pin) => `'${pin}'`).join(', ');
  try {
    await run('npx', [
      'supabase',
      'db',
      'query',
      '--linked',
      `delete from public.rooms where pin in (${list})`,
    ]);
  } catch (error) {
    console.warn(`Could not delete test rooms ${pins.join(', ')}:`, error);
  }
};
