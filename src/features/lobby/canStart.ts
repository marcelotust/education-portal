import type { GameId, PlayerSlot } from '@/types';
import { cartridgeFor } from './cartridges';

/** The Host holds a seat too, so "alone" means no other seat belongs to a Player. */
export const isAlone = (slots: readonly PlayerSlot[]): boolean =>
  !slots.some((slot) => slot?.role === 'PLAYER');

/**
 * One rule for the picker, the hint and START GAME, so the order the Host
 * clicks in never matters: a real Player always suffices, and alone depends
 * on what the cartridge says it can play without.
 */
export const hasEnoughPlayers = (gameId: GameId, slots: readonly PlayerSlot[]): boolean =>
  !isAlone(slots) || cartridgeFor(gameId).playsWithout === 'NOTHING';
