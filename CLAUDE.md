# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

EduParty — a gamified, arcade-themed portal for online classes. A teacher (**Host**) creates a persistent room; students (**Clients**) join with a 4-letter PIN. The Host loads game "cartridges" (first one is **STOP**, a categories game) without ever dropping the room.

Status: MVP steps 1–7 of `blueprint.md` are done. The lobby runs on **mock data** (`src/features/lobby/mockRoom.ts`); Supabase (Realtime Broadcast, Presence, Anonymous Auth, Postgres JSONB) is the planned backend but **not yet wired up**. `blueprint.md` is the source of truth for scope and the intended build order.

## Commands

| Command                           | Purpose                               |
| --------------------------------- | ------------------------------------- |
| `npm run dev`                     | Vite dev server                       |
| `npm run build`                   | `tsc -b` typecheck + production build |
| `npm test`                        | Vitest, single run                    |
| `npm run test:watch`              | Vitest watch mode                     |
| `npm run test:coverage`           | V8 coverage                           |
| `npm run lint` / `lint:fix`       | ESLint                                |
| `npm run format` / `format:check` | Prettier                              |
| `npm run typecheck`               | `tsc -b --noEmit`                     |

Run a single test file: `npx vitest run src/features/lobby/LobbyScreen.spec.tsx`
Filter by name: `npx vitest run -t "Host clicks Start"`

## Architecture

Room state is a **finite state machine**, the core of the app. Everything hangs off it.

- `src/hooks/roomMachine.ts` — a pure reducer (`roomReducer`). States: `LOBBY_IDLE → CONFIGURING_GAME → PLAYING_AD → PLAYING → CALCULATING_SCORES`. **Invalid transitions return the exact same state object** so React bails out of re-rendering — preserve this when adding cases.
- `src/hooks/RoomProvider.tsx` — wraps the reducer in Context and enforces the role model: **control events are Host-only**. `isHostOnlyEvent` (everything except the `PLAYER_JOINED`/`PLAYER_LEFT` presence events) is dropped when the local `role` is `CLIENT`. Clients are read-only state listeners.
- `src/types/room.ts` — `RoomState`, the `RoomEvent` union (the FSM's alphabet), and `RoomContextValue`. Adding a feature usually means: add an event to the union, handle it in `roomReducer`, and cover the transition in a spec.
- `src/app/RoomRoute.tsx` mounts the provider for a role; `/host` → `HOST`, `/play` → `CLIENT` (see `src/app/App.tsx`).

The board is a **fixed 6-slot array** (`MAX_PLAYERS`); `null` means an open slot. The lobby renders it as a "Character Select" grid.

Directory layout: `src/app` (routing/composition), `src/components` (layout + shared UI), `src/features` (domains: `lobby/`, `gameplay/`), `src/hooks` (FSM + context), `src/types`, `src/utils`, `src/test` (Vitest setup + factories). Import via the `@/` alias (→ `src/`).

## Conventions (enforced by ESLint — see `blueprint.md` §3)

- React components are **always arrow functions**, **one component per file** (`react/no-multi-comp`), max **250 lines** per file (`max-lines`). When a component grows, split it into `components/` subfolders rather than relaxing the rule.
- **Strict SDD**: write the feature/screen `.spec.tsx` **first**, testing user behavior and FSM transitions, then implement components to satisfy it. Prefer feature-based integration tests over brittle per-component unit tests.
- TypeScript is strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, inline type-imports required). ESLint uses `recommendedTypeChecked` — keep types clean, not just non-erroring.
- All project text — source, UI copy, docs, commit messages — is in **English**.

## Styling

Tailwind with an arcade theme (`tailwind.config.js`): fonts `font-arcade` (Press Start 2P, for headings/buttons) and `font-terminal` (VT323, for inputs/text); `arcade.{black,green,pink,cyan,yellow}` colors; `shadow-neon` and `animate-blink`. Deployed on Vercel (`vercel.json` rewrites all routes to `index.html` for the SPA).
