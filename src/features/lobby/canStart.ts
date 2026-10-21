import type { GameId, PlayerSlot } from '@/types';
import { cartridgeFor } from './cartridges';

/** The Host holds a seat too, so "alone" means no other seat belongs to a Player. */
export const isAlone = (slots: readonly PlayerSlot[]): boolean =>
  !slots.some((slot) => slot?.role === 'PLAYER');

/** Whether a Host with nobody else could start this cartridge, bot included. */
export const playsAlone = (gameId: GameId, hasBot: boolean): boolean => {
  const { playsWithout } = cartridgeFor(gameId);
  return playsWithout === 'NOTHING' || (playsWithout === 'BOT' && hasBot);
};

/**
 * One rule for the picker, the hint and START GAME, so the order the Host
 * clicks in never matters: a real Player always suffices, and alone depends
 * on what the cartridge says it can play without.
 */
export const hasEnoughPlayers = (
  gameId: GameId,
  slots: readonly PlayerSlot[],
  hasBot: boolean,
): boolean => !isAlone(slots) || playsAlone(gameId, hasBot);
